# Multi-stage build: build each frontend with node, then copy static builds into nginx image

FROM node:20-alpine AS builder
WORKDIR /workspace

# Install a small set of global deps
RUN apk add --no-cache git python3 make g++

# Copy package.json per frontend and run builds sequentially
COPY welcome-frontend /workspace/welcome-frontend
COPY farmer-frontend /workspace/farmer-frontend
COPY auditor-frontend /workspace/auditor-frontend
COPY regulator-frontend /workspace/regulator-frontend
COPY retail-frontend /workspace/retail-frontend
COPY laboratory-frontend /workspace/laboratory-frontend

# Install and build each frontend
# We assume each frontend has its own package.json and uses Vite build -> output is /dist

# Helper: install deps and build a given app
RUN set -eux; \
  for app in welcome-frontend farmer-frontend auditor-frontend regulator-frontend retail-frontend laboratory-frontend; do \
    echo "Building $app"; \
    cd /workspace/$app; \
    if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi; \
    npm run build --silent; \
  done

# Nginx image: serve prebuilt apps under subpaths
FROM nginx:1.26-alpine

# Remove default site
RUN rm -rf /usr/share/nginx/html/*

# Copy combined nginx config
COPY docker/combined-frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets into locations under /usr/share/nginx/html
COPY --from=builder /workspace/welcome-frontend/dist /usr/share/nginx/html/
COPY --from=builder /workspace/farmer-frontend/dist /usr/share/nginx/html/farmer
COPY --from=builder /workspace/auditor-frontend/dist /usr/share/nginx/html/auditor
COPY --from=builder /workspace/regulator-frontend/dist /usr/share/nginx/html/regulator
COPY --from=builder /workspace/retail-frontend/dist /usr/share/nginx/html/retail
COPY --from=builder /workspace/laboratory-frontend/dist /usr/share/nginx/html/laboratory

# Ensure correct permissions
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 9000
CMD ["nginx", "-g", "daemon off;"]
