FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:stable-alpine AS runtime

LABEL org.opencontainers.image.title="Mathe-Reise" \
      org.opencontainers.image.description="Offline-fähige Mathematik-Förderapp für die dritte Klasse" \
      org.opencontainers.image.source="https://github.com/hackepeter87/nachhilfe" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.version="0.3.0"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "-qO-", "http://127.0.0.1:8080/healthz"]
