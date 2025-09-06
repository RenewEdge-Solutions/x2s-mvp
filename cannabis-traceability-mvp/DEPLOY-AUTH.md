Deployment checklist — Auth-protected MVP (safe, no downtime)

Overview

This guide helps you deploy the MVP auth stack on your VPS while keeping your production website online.

Files created for deployment
- `docker-compose.auth.prod.yml` — production compose stack (Keycloak, oauth2-proxy, session-proxy, frontends internal). Binds Keycloak and oauth2-proxy to localhost only.
- `.env.example` — copy to `.env` and fill secrets.
- `nginx/snippets/auth.nginx` and `nginx/snippets/mvp.nginx` — example server blocks provided below.

Pre-deploy checklist on VPS
1. Create a directory (e.g., `/srv/s2s-mvp`) and copy the repo there.
2. Copy `.env.example` to `.env` and set the secrets. Keep `.env` out of git.
3. Ensure Docker and Docker Compose (v2) are installed.
4. Backup existing nginx configs (important):
   sudo cp -r /etc/nginx /etc/nginx.bak

Nginx snippets (add these to your host nginx configuration)

1) auth.renewedge-solutions.com — proxy to Keycloak (internal)

server {
  listen 80;
  server_name auth.renewedge-solutions.com;

  location / {
    proxy_pass http://127.0.0.1:8080; # Keycloak bound to localhost
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

2) s2s-mvp.renewedge-solutions.com — route through oauth2-proxy (auth enforced)

server {
  listen 80;
  server_name s2s-mvp.renewedge-solutions.com;

  location / {
    proxy_pass http://127.0.0.1:4180; # oauth2-proxy bound to localhost
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}

Notes:
- Both new server blocks are bound to distinct subdomains. They do not touch your existing site config. Place them in `/etc/nginx/sites-available/` and symlink to `/etc/nginx/sites-enabled/`.
- Obtain TLS certificates with certbot for the two subdomains. Use --nginx plugin or create temporary HTTP challenge config then obtain certs before flipping to HTTPS.

Deploy steps
1. On the VPS, pull/copy the repo into `/srv/s2s-mvp`.
2. Create `.env` (from `.env.example`) and set secrets.
3. Start the stack:
   docker compose -f docker-compose.auth.prod.yml --env-file .env up -d --build
4. Test locally on the VPS with curl/hosts before enabling public DNS:
   curl -v --header "Host: s2s-mvp.renewedge-solutions.com" http://127.0.0.1:4180/
   (should redirect to Keycloak login URL)
5. Configure nginx server blocks above, reload nginx: `sudo nginx -t && sudo systemctl reload nginx`.
6. Obtain TLS certs with certbot and update server blocks to listen 443.
7. Test full flow from your machine.

Rollback: to restore previous nginx or stop the stack:
- sudo systemctl stop nginx && sudo cp -r /etc/nginx.bak/* /etc/nginx && sudo systemctl start nginx
- docker compose -f docker-compose.auth.prod.yml down

Security reminders
- Do not expose Keycloak admin console publicly.
- Rotate admin and client secrets before opening public DNS.
- Use firewall rules to restrict public access if necessary.

If you want, I will now generate the exact nginx files in this repo under `deploy/nginx/` and a `deploy.sh` helper that copies files and runs compose (you will still run it on the server). Request that and I'll add them.

Note: after copying `deploy/deploy.sh` to the server, run `chmod +x deploy/deploy.sh` before executing it.
