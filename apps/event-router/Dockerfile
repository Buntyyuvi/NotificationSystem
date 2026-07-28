FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-kafka/package.json ./packages/shared-kafka/
COPY packages/shared-redis/package.json ./packages/shared-redis/
COPY packages/shared-db/package.json ./packages/shared-db/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/shared-logger/package.json ./packages/shared-logger/
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/shared-kafka/node_modules ./packages/shared-kafka/node_modules
COPY --from=deps /app/packages/shared-redis/node_modules ./packages/shared-redis/node_modules
COPY --from=deps /app/packages/shared-db/node_modules ./packages/shared-db/node_modules
COPY --from=deps /app/packages/shared-utils/node_modules ./packages/shared-utils/node_modules
COPY --from=deps /app/packages/shared-logger/node_modules ./packages/shared-logger/node_modules
COPY tsconfig.base.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-kafka ./packages/shared-kafka
COPY packages/shared-redis ./packages/shared-redis
COPY packages/shared-db ./packages/shared-db
COPY packages/shared-utils ./packages/shared-utils
COPY packages/shared-logger ./packages/shared-logger
COPY apps/event-router ./apps/event-router
RUN npm run build --workspace=packages/shared-types && npm run build --workspace=packages/shared-kafka && npm run build --workspace=packages/shared-redis && npm run build --workspace=packages/shared-db && npm run build --workspace=packages/shared-utils && npm run build --workspace=packages/shared-logger && npm run build --workspace=apps/event-router

FROM base AS runner
COPY --from=builder /app/apps/event-router/dist ./dist
COPY --from=builder /app/apps/event-router/package.json ./
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/index.js"]
