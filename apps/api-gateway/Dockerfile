FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-db/package.json ./packages/shared-db/
COPY packages/shared-logger/package.json ./packages/shared-logger/
COPY packages/shared-utils/package.json ./packages/shared-utils/
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared-types/node_modules ./packages/shared-types/node_modules
COPY --from=deps /app/packages/shared-db/node_modules ./packages/shared-db/node_modules
COPY --from=deps /app/packages/shared-logger/node_modules ./packages/shared-logger/node_modules
COPY --from=deps /app/packages/shared-utils/node_modules ./packages/shared-utils/node_modules
COPY tsconfig.base.json ./
COPY packages/shared-types ./packages/shared-types
COPY packages/shared-db ./packages/shared-db
COPY packages/shared-logger ./packages/shared-logger
COPY packages/shared-utils ./packages/shared-utils
COPY apps/api-gateway ./apps/api-gateway
RUN npm run build --workspace=packages/shared-types && npm run build --workspace=packages/shared-db && npm run build --workspace=packages/shared-logger && npm run build --workspace=packages/shared-utils && npm run build --workspace=apps/api-gateway

FROM base AS runner
COPY --from=builder /app/apps/api-gateway/dist ./dist
COPY --from=builder /app/apps/api-gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
