This document explains how to run the MVP locally with Keycloak and oauth2-proxy protecting the frontends.

Goals
- Only the auth layer (oauth2-proxy) is exposed publicly.
- Frontends remain internal (not directly published to host).
- Welcome frontend is the initial upstream for oauth2-proxy; it then links to other frontends.

Local testing steps
1. Copy `.env.example` to `.env` and set `KEYCLOAK_ADMIN_PASSWORD` and `OAUTH2_PROXY_CLIENT_SECRET`.
2. Start the stack: `docker compose up --build` in the `cannabis-traceability-mvp` folder.
3. Keycloak will be available at `http://localhost:8080` and oauth2-proxy at `http://localhost:9006`.
4. Use Keycloak admin console to create realm `mvp` and a client `mvp-client` (or import appropriate config). For quick testing you can create a public client with redirect `http://localhost:9006/oauth2/callback`.
5. Open `http://localhost:9006` to be redirected to Keycloak login. After auth, oauth2-proxy will forward to the welcome frontend.

VPS deployment notes
- Your production website must remain online and untouched. Keep your existing nginx running.
- On the VPS, do NOT publish frontend ports. Run the same docker-compose but configure nginx to reverse proxy only the auth subdomain (e.g. `s2s-mvp.renewedge-solutions.com`) to the oauth2-proxy container's internal port (4180).
- Keep Keycloak accessible only from the internal network. Only oauth2-proxy requires access from nginx.
- Update DNS for `s2s-mvp.renewedge-solutions.com` to point to the VPS.
- Create proper TLS certificates in nginx for `s2s-mvp.renewedge-solutions.com` (Let's Encrypt) and proxy to `http://127.0.0.1:9006` or the oauth2-proxy container IP.

Next steps I can do now
- Wire a basic oauth2-proxy config file and docker-compose envs for an OIDC client pre-created in Keycloak.
- Optionally add a small script to bootstrap Keycloak realm and client via its admin API.

Cookie secret
- Generate a cookie secret for oauth2-proxy (must be 32 or 64 bytes base64):
	- `python -c "import os,base64; print(base64.b64encode(os.urandom(32)).decode())"`
	- Put the result into `oauth2-proxy/oauth2-proxy.cfg` as `cookie_secret = "..."` or set it via env on the VPS.

If you want, I'll implement an automated Keycloak realm/client import and an oauth2-proxy configuration file next.
