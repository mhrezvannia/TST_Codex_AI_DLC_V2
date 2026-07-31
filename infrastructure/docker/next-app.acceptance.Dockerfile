ARG W2_02_DEPENDENCY_IMAGE=linercore/w2-02-node-deps:a37a1fefcfe8
FROM ${W2_02_DEPENDENCY_IMAGE} AS dependency-source

WORKDIR /app

COPY infrastructure/docker/w2-02-dependency-manifest.sha256 /tmp/w2-02-dependency-manifest.sha256
RUN sha256sum -c /tmp/w2-02-dependency-manifest.sha256

FROM node:24-alpine AS builder

WORKDIR /app

ARG WORKSPACE
COPY --from=dependency-source /app/node_modules ./node_modules
COPY . .
RUN node .yarn/releases/yarn-4.5.3.cjs workspace ${WORKSPACE} build

FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ARG WORKSPACE
ENV WORKSPACE_NAME=${WORKSPACE}

COPY --from=builder /app /app

EXPOSE 3000
CMD node .yarn/releases/yarn-4.5.3.cjs workspace "$WORKSPACE_NAME" exec next start -H 0.0.0.0 -p 3000
