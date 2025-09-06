Local auth setup for MVP

What I added locally

- `docker-compose.auth.yml` - small compose stack with:
  - Keycloak (development mode)
  - oauth2-proxy connected to Keycloak
  - welcome-frontend (no external port)
  - a small nginx (test) that forwards s2s-mvp.local -> oauth2-proxy

- `nginx/mvp.conf` - nginx site config used by the local `mvp-nginx` container

Why

You wanted only the auth container exposed publicly. Locally we expose oauth2-proxy and keycloak to test the full login flow. On the VPS we'll keep only the oauth2-proxy/Keycloak accessible via your host nginx and route / protect the welcome frontend behind oauth2.

Next steps (local):

1. Start the stack locally:

```sh
cd cannabis-traceability-mvp
docker compose -f docker-compose.yml -f docker-compose.auth.yml up --build
```

2. Open http://s2s-mvp.local:8081 in your browser. It will route to oauth2-proxy which will redirect to Keycloak for login.

Important notes before production deploy:
- Replace the Keycloak admin creds and oauth client secrets with strong values.
- In Keycloak create a realm and a client with redirect_uri pointing to your auth domain (https://s2s-mvp.renewedge-solutions.com/oauth2/callback) and set appropriate valid origins.
- On the VPS: configure your host nginx to forward s2s-mvp.renewedge-solutions.com to oauth2-proxy (running in a docker network) and keep your production website server untouched.
- Make sure cookies and TLS (HTTPS) are properly configured. Use certbot / Let's Encrypt on the VPS nginx.

If you want, I can now:
- fix the small compose YAML lint issue, and
- wire each frontend to use OIDC (currently frontends use a fake /auth endpoints). I suggest we first make the Keycloak + oauth2 flow work for the welcome frontend locally.

Quick local run (private frontends + auth)

1. Add an /etc/hosts entry so `s2s-mvp.local` points to your machine (for local nginx test):

```sh
sudo -- sh -c "echo '127.0.0.1 s2s-mvp.local' >> /etc/hosts"
```

2. Start the stack (this uses the original `docker-compose.yml` plus the auth overlay and the private override):

```sh
cd cannabis-traceability-mvp
docker compose -f docker-compose.yml -f docker-compose.private.yml -f docker-compose.auth.yml up --build
```

3. Open http://s2s-mvp.local:8081 — this will route to the local `mvp-nginx` which proxies into oauth2-proxy and should redirect you to Keycloak.

Notes:
- If you prefer a different local name, update `nginx/mvp.conf`'s `server_name` accordingly.
- For now Keycloak admin credentials are `admin` / `admin` (development only). Create a realm and client as described earlier before exposing to the internet.
