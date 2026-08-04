FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY . .
RUN npm install
RUN npx turbo run build --filter=@notification-system/api-gateway

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api-gateway ./apps/api-gateway
COPY --from=builder /app/packages ./packages
EXPOSE 3000
CMD ["node", "apps/api-gateway/dist/index.js"]
