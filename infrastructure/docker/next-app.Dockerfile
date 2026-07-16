FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY apps/auth/package.json ./apps/auth/package.json
COPY apps/booking/package.json ./apps/booking/package.json
COPY apps/charge-agreements/package.json ./apps/charge-agreements/package.json
COPY apps/reference-data/package.json ./apps/reference-data/package.json
COPY packages/api-core/package.json ./packages/api-core/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/config/package.json ./packages/config/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
COPY packages/transformers/package.json ./packages/transformers/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/utils/package.json ./packages/utils/package.json
RUN node .yarn/releases/yarn-4.5.3.cjs install --immutable

FROM deps AS builder

ARG WORKSPACE
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
