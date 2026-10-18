# Run `npm run staging:build` before building the image.
# Pin a verified image digest and sign it before any future production release.
ARG NGINX_IMAGE=nginx:1.28-alpine
FROM ${NGINX_IMAGE}
COPY dist/staging/index.html /usr/share/nginx/html/index.html
COPY dist/staging/start.html /usr/share/nginx/html/start.html
COPY dist/staging/nginx.conf /etc/nginx/nginx.conf
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD wget -q -O - http://127.0.0.1:8080/healthz || exit 1
