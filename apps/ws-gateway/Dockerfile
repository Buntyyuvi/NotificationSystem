FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared-redis/package.json ./packages/shared-redis/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-utils/package.json ./packages/shared-utils/
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared-redis/node_modules ./packages/shared-redis/node_modules
COPY --from=deps /app/packages/shared-logger/node_modules ./packages/shared-logger/node_modules
COPY --from=deps /app/packages/shared-utils/node_modules ./packages/shared-utils/node_modules
COPY tsconfig.base.json ./
COPY packages/shared-redis ./packages/shared-redis
COPY packages/shared-logger ./packages/shared-logger
COPY packages/shared-utils ./packages/shared-utils
COPY apps/ws-gateway ./apps/ws-gateway
RUN npm run build --workspace=packages/shared-redis && npm run build --workspace=packages/shared-logger && npm run build --workspace=packages/shared-utils && npm run build --workspace=apps/ws-gateway

FROM base AS runner
COPY --from=builder /app/apps/ws-gateway/dist ./dist
COPY --from=builder /app/apps/ws-gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "dist/index.js"]
