# Stage 1: Build
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm@10.24.0

WORKDIR /app

# Copy root configs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all packages and apps (needed for monorepo dependencies)
COPY packages ./packages
COPY apps/back-office-app ./apps/back-office-app

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the app
RUN pnpm --filter=@erp-digital-printing/back-office-app build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built assets
COPY --from=builder /app/apps/back-office-app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY apps/back-office-app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Environment Variable Injection Script
# This script creates env-config.js from container environment variables at startup.
CMD ["/bin/sh", "-c", "echo \"window.__ENV__ = { VITE_API_URL: '${VITE_API_URL}' };\" > /usr/share/nginx/html/env-config.js && exec nginx -g 'daemon off;'"]
