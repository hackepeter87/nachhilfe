FROM node:24.15-alpine@sha256:d1b3b4da11eefd5941e7f0b9cf17783fc99d9c6fc34884a665f40a06dbdfc94f AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.30.6-alpine@sha256:f5116ed4606f3eb015dd4a8e28cb9b351476dc0ad4bc6e9f93b19cec130cdf03 AS runtime

ARG OCI_VERSION=dev
ARG OCI_REVISION=unknown
ARG OCI_CREATED=unknown

USER root
RUN apk upgrade --no-cache

LABEL org.opencontainers.image.title="Mathe-Reise" \
      org.opencontainers.image.description="Offline-fähige Mathematik-Förderapp für die dritte Klasse" \
      org.opencontainers.image.source="https://github.com/hackepeter87/nachhilfe" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.version="${OCI_VERSION}" \
      org.opencontainers.image.revision="${OCI_REVISION}" \
      org.opencontainers.image.created="${OCI_CREATED}"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["wget", "-qO-", "http://127.0.0.1:8080/healthz"]
