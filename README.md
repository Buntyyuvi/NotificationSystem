# Notification System

A production-ready, real-time notification platform built on a Turborepo monorepo.
Ingests events via REST, routes them through per-user preferences/rate limits,
and delivers over WebSocket, email (SendGrid), push (Firebase Cloud Messaging),
and SMS (Twilio) — with persistent history, JWT auth, and reliable delivery
through a BullMQ retry queue with a dead-letter queue.

## Architecture

```
                        ┌──────────────────────┐
  POST /events  ──────▶ │   event-ingestor     │
  (web / curl)          │   (REST :3001)       │
                        └──────────┬───────────┘
                                   │ Kafka: notification-events
                        ┌──────────▼───────────┐
                        │   event-router       │
                        │ (prefs / presence /  │
                        │  rate-limit)         │
                        └──────────┬───────────┘
              ┌────────────────────┼────────────────────┐
              │                    │                    │
   Redis: notifications:websocket │                    │
              │                    │ Kafka: notification-routed
   ┌──────────▼───────────┐        │
   │     ws-gateway       │        │
   │  (socket.io :3002)   │        │
   └──────────┬───────────┘        │
              │                    │
              │          ┌─────────▼──────────┐
              │          │   delivery-service │  BullMQ Queue + DLQ
              │          │  (email/push/sms/  │
              │          │   websocket)       │
              │          └─────────┬──────────┘
              │                    │
   ┌──────────▼───────────┐        │
   │  browser / mobile    │        │
   └──────────────────────┘        │
                            ┌──────▼──────┐
                            │  Mongo +    │
                            │  Redis      │
                            └─────────────┘
```

### Services (Docker compose)

| Service            | Port   | Purpose                                             |
|--------------------|--------|-----------------------------------------------------|
| `web`              | 80     | Dashboard UI (nginx), served at `http://localhost`  |
| `api-gateway`      | 3000   | REST API: auth, preferences, devices, notifications |
| `event-ingestor`   | 3001   | Validates & publishes inbound events to Kafka       |
| `event-router`     | —      | Resolves prefs/presence/rate-limits, routes events  |
| `delivery-service` | —      | BullMQ worker: sends email/push/sms/websocket       |
| `ws-gateway`       | 3002   | Socket.IO gateway (real-time push to clients)       |
| `kafka` + `zookeeper` | 9092/29092 | Event bus                             |
| `redis`            | 6379   | Presence, pub/sub, rate limits, BullMQ backend      |
| `mongo`            | 27017  | Users, notifications, delivery logs                 |

## Quick start (Docker)

Requirements: Docker with Docker Compose.

```sh
cd my-turborepo
# fill in provider keys in .env (see table below)

docker compose -f infra/docker/docker-compose.yml up -d --build
```

Wait ~60s for Kafka to become ready (services auto-retry). Verify:

```sh
curl http://localhost/health          # web UI
curl http://localhost:3000/health     # api-gateway
curl http://localhost:3001/health     # event-ingestor
```

All 10 containers should report `Up`:

```sh
docker ps
```

### Local development

```sh
npm install
./node_modules/.bin/turbo run dev        # or: turbo run dev
```

> Note: use `./node_modules/.bin/turbo` — a bare `npx turbo` in this repo
> resolves a global turbo binary and can fail with "Could not resolve workspace".

## Environment variables

`apps/api-gateway/.env`:

| Variable           | Description                          |
|--------------------|--------------------------------------|
| `PORT`             | API port (default 3000)              |
| `JWT_SECRET`       | Secret for signing JWTs              |
| `MONGODB_URI`      | Mongo connection string              |

`apps/delivery-service/.env`:

| Variable               | Description                             |
|------------------------|-----------------------------------------|
| `SENDGRID_API_KEY`     | SendGrid key (email)                    |
| `SENDGRID_FROM_EMAIL`  | Verified sender address (email)         |
| `TWILIO_ACCOUNT_SID`   | Twilio account (SMS)                    |
| `TWILIO_AUTH_TOKEN`    | Twilio auth token (SMS)                 |
| `TWILIO_PHONE_NUMBER`  | Twilio sender number (SMS)              |
| `FIREBASE_PROJECT_ID`  | FCM project id (push)                   |
| `FIREBASE_CLIENT_EMAIL`| FCM service-account email (push)        |
| `FIREBASE_PRIVATE_KEY` | FCM private key (push; supports \n)     |
| `MONGODB_URI`          | Mongo connection string                 |
| `REDIS_URL`            | Redis connection string                 |
| `KAFKA_BROKERS`        | Kafka bootstrap brokers                 |

Channels are **skipped gracefully** (logged, marked delivered) when their key
is missing, so the stack runs even with no provider keys.

## API

### Auth

- `POST /auth/register` — `{ email, password }` → `{ user, token }`
- `POST /auth/login` — `{ email, password }` → `{ user, token }`
- `GET /auth/me` — current user (Bearer token)

### Notifications (Bearer token)

- `GET /notifications?page=&limit=&status=` — paginated history + unread meta
- `GET /notifications/unread-count`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`

### Preferences / devices (Bearer token)

- `GET /preferences`, `PUT /preferences` — enable/disable channels
- `POST /devices` — `{ token, platform }` register a device for FCM push

### Events (public)

- `POST /events` — `{ type, payload, userId, channels[], priority }` → `{ eventId }`

```sh
curl -X POST http://localhost:3001/events \
  -H "Content-Type: application/json" \
  -d '{"type":"price_drop","payload":{"product":"laptop","change":-20},
       "userId":"<userId>","channels":["websocket","email"],"priority":"high"}'
```

## Delivery pipeline

1. `event-ingestor` validates the event and publishes it to Kafka.
2. `event-router` intersects the requested channels with the user's
   preferences, filters websocket when the user is offline, applies
   per-channel rate limits, and publishes the routed event.
3. `delivery-service` enqueues the job on a BullMQ queue:
   - **4 attempts** with exponential backoff (5s → 10s → 20s).
   - On each failure the notification is marked `retrying` and a
     `DeliveryLog` entry is written per channel.
   - After the final attempt the job moves to the **dead-letter queue** and
     the notification is marked `failed` with `failedAt`.
   - Live WebSocket notifications are also published directly to Redis so
     connected clients get them instantly.
4. `ws-gateway` receives the Redis pub/sub message and emits
   `notification:new` to the user's Socket.IO room.
5. History is persisted idempotently in Mongo (upsert by `eventId`), with
   per-channel delivery attempts tracked on the notification document.

## Production readiness

- **Reliability**: BullMQ retries + dead-letter queue; Kafka/Redis connect
  retries with `restart: unless-stopped`; inline delivery fallback if
  enqueue fails.
- **Security**: bcrypt password hashing, JWT auth on REST and Socket.IO,
  401 on missing/invalid tokens, helmet, no secrets in client bundles.
- **Observability**: structured JSON logging per service, `/metrics`
  (Prometheus) on api-gateway and event-ingestor.
- **History**: paginated notifications API with read/unread tracking that
  survives page refresh (real Mongo persistence).

## Verification (Phase 6)

- `turbo run build --force`: 13/13 tasks pass.
- Full `docker compose up -d --build`: all 10 containers `Up`, all services
  connected (Mongo/Redis/Kafka) and consuming.
- Web `http://localhost` → 200; `api-gateway :3000/health` → ok;
  `event-ingestor :3001/health` → ok.
- Auth: register/login → JWT → `GET /auth/me` 200; no token / bad token → 401.
- Live push: Socket.IO client receives `notification:new`; event appears in
  history as `delivered`; unread badge counts and mark-all-read works.
- Failure path: email with invalid SendGrid key → 4 attempts (status
  `retrying`) → DLQ → status `failed`, `failedAt` set, 4 `DeliveryLog` rows.
