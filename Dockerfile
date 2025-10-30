## Multi-stage build: build React app with Vite, then serve with Nginx

# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Pass API base at build time (Vite reads env at build time)
ARG VITE_API_BASE
ENV VITE_API_BASE=${VITE_API_BASE}

COPY package.json package-lock.json* ./
# Prefer clean, reproducible installs
RUN npm ci || npm install --no-audit --no-fund

COPY . .

# Build static assets
RUN npm run build

# ---- Runtime stage ----
FROM nginx:alpine AS runner

# Copy build output to nginx static folder
COPY --from=builder /app/build /usr/share/nginx/html

# Use project nginx.conf (enables SPA-style routing if needed)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web port
EXPOSE 80

# Use default nginx config (works fine for hash-based routing)
CMD ["nginx", "-g", "daemon off;"]
