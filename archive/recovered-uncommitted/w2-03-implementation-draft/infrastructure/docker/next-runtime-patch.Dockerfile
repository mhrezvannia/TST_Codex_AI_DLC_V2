ARG BASE_IMAGE=node:24-alpine
FROM ${BASE_IMAGE}

ARG APP_DIR
COPY .next /app/apps/${APP_DIR}/.next
