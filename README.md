# Tution Management

A dark, mobile-responsive **tuition / coaching management system** (MERN). Enroll students from **Nursery through Class 12** subject-by-subject, auto-calculate fees, track how much you collect each month and how much yearly income is still pending, watch each student's **subscription days remaining**, and send fee reminders to parents over **WhatsApp or SMS**.

---

## Features

- **Subject-wise enrollment** — Nursery to Class 12. Each student's monthly fee = class base fee + the add-on fee of every subject they take. Fees are snapshotted at enrollment.
- **Fee & income tracking** — expected monthly revenue, collected this month, pending this month, and **pending yearly income** at a glance.
- **Subscription monitoring** — monthly / quarterly / half-yearly / annual plans, with live **days remaining** and active / expiring / expired buckets.
- **Reminders** — nudge parents before a plan lapses via **WhatsApp Cloud API** or an SMS adapter. When a channel isn't configured, messages are *simulated* and still logged so you can trial the flow.
- **Dashboard** — KPIs plus collection-trend, students-by-class, and subscription-mix charts.
- **Dark, responsive UI** — works on phones (sidebar collapses to a drawer) and desktops.

---

## Tech stack

| Layer     | Tech                                                                 |
|-----------|----------------------------------------------------------------------|
| Frontend  | React 18, Vite 5, React Router 6, Recharts, Axios, lucide-react      |
| Backend   | Node.js, Express 4, Mongoose 8 (ESM)                                 |
| Database  | MongoDB (local, or **MongoDB Atlas**)                                |
| Deploy    | Single multi-stage **Docker** image (API + built client in one)      |

---

## Project structure

```
vidyasetu/
├── client/                 # React + Vite front-end
│   └── src/
│       ├── api/            # axios client + endpoint helpers
│       ├── components/     # ui primitives, layout, charts, modals
│       ├── context/        # settings provider
│       ├── hooks/          # useApi
│       ├── lib/            # constants + formatting
│       └── pages/          # Dashboard, Students, Fees, Payments, Reminders, Settings
├── server/                 # Express + Mongoose API
│   └── src/
│       ├── config/         # env.js, db.js (MongoDB connection)
│       ├── controllers/    # route handlers
│       ├── middleware/     # 404 + error handler
│       ├── models/         # ClassPlan, Subject, Student, Payment, ReminderLog, Settings
│       ├── routes/         # /api/* routers
│       ├── services/       # messaging (whatsapp, sms)
│       ├── utils/          # fees, subscription math, currency, dates
│       ├── seed/           # demo data seeder
│       ├── app.js          # Express app (serves the built client in production)
│       └── server.js       # entry point (connects DB, then listens)
├── Dockerfile              # multi-stage build → one runnable image
├── docker-compose.yml      # run on your server (points at Atlas)
└── package.json            # root scripts (concurrently runs client + server)
```

---

## Prerequisites

- **Node.js ≥ 18** (Node 20 LTS recommended) and npm — for local development.
- A **MongoDB** database — either local MongoDB, or a free **MongoDB Atlas** cluster (recommended for a server).
- **Docker** (with Compose v2) — only if you want to deploy with containers.

---

## Quick start (local development)

```bash
# 1. Install all dependencies (root, server, client)
npm run install:all

# 2. Configure the server
cp server/.env.example server/.env
#    → open server/.env and set MONGODB_URI (local or Atlas)

# 3. (optional) Load demo data — classes, subjects, students, payments
npm run seed

# 4. Start the API (:5000) and client dev server (:5173) together
npm run dev
```

Then open **http://localhost:5173**. During development the Vite dev server proxies `/api` calls to the Express server on port 5000, so there are no CORS headaches.

---

## Setting up MongoDB Atlas

Atlas is MongoDB's managed cloud database and is the easiest way to run Tution Management on a server.

1. **Create a cluster** — sign in at <https://cloud.mongodb.com>, create a project, and deploy a cluster (the free **M0** tier is fine to start).
2. **Create a database user** — *Database Access ▸ Add New Database User*. Choose password authentication, give it a username (e.g. `vidyasetu_app`) and a strong password, and grant **Read and write to any database** (or scope it to the `vidyasetu` db).
3. **Allow network access** — *Network Access ▸ Add IP Address*. Add your server's public IP. To allow from anywhere (less secure, handy for testing) use `0.0.0.0/0`.
4. **Get the connection string** — *Database ▸ Connect ▸ Drivers*, and copy the string. It looks like:
   ```
   mongodb+srv://vidyasetu_app:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. **Finish the URI** — replace `<db_password>` with your user's password, and insert the database name `vidyasetu` right before the `?`:
   ```
   MONGODB_URI=mongodb+srv://vidyasetu_app:yourpassword@cluster0.abcde.mongodb.net/vidyasetu?retryWrites=true&w=majority&appName=Cluster0
   ```
   Put that line in `server/.env`.

> **Password tip:** if your password contains special characters, URL-encode them — e.g. `@` → `%40`, `#` → `%23`, `/` → `%2F`, `:` → `%3A`.

TLS and automatic retries are carried by the `mongodb+srv` string itself, so no extra configuration is needed. On first connect the app builds its indexes automatically; set `MONGO_AUTO_INDEX=false` if you ever need to manage indexes manually on a very large database.

Seed Atlas with demo data (optional) once the URI is set:

```bash
npm run seed
```

---

## Environment variables

All live in `server/.env` (copy from `server/.env.example`).

| Variable                 | Default                                   | Purpose |
|--------------------------|-------------------------------------------|---------|
| `PORT`                   | `5000`                                    | API / server port |
| `NODE_ENV`               | `development`                             | Use `production` for the built app / Docker |
| `CLIENT_URL`             | `http://localhost:5173`                   | Allowed CORS origin. Not needed when one container serves both; use `*` to allow any origin |
| `CLIENT_STATIC_DIR`      | *(auto-detect)*                           | Absolute path to the built client. The Docker image sets this up; you normally leave it blank |
| `MONGODB_URI`            | `mongodb://127.0.0.1:27017/vidyasetu`     | **MongoDB connection string** (local or Atlas) |
| `MONGO_AUTO_INDEX`       | `true`                                    | Build indexes on startup; set `false` on very large collections |
| `INSTITUTE_NAME`         | `Tution Management`                       | Shown across the UI |
| `DEFAULT_COUNTRY_CODE`   | `91`                                      | Prepended to 10-digit phone numbers when messaging |
| `WHATSAPP_TOKEN`         | *(blank)*                                 | WhatsApp Cloud API access token |
| `WHATSAPP_PHONE_NUMBER_ID` | *(blank)*                               | WhatsApp Cloud API phone number ID |
| `WHATSAPP_API_VERSION`   | `v20.0`                                   | Graph API version |
| `WHATSAPP_TEMPLATE_NAME` | *(blank)*                                 | Approved template name (blank = plain text within the 24h window) |
| `WHATSAPP_TEMPLATE_LANG` | `en`                                      | Template language code |
| `SMS_PROVIDER`           | *(blank)*                                 | SMS provider key (wire up in `services/messaging/sms.js`) |
| `SMS_API_KEY`            | *(blank)*                                 | SMS provider API key |
| `SMS_SENDER_ID`          | *(blank)*                                 | SMS sender ID |

> Any messaging credential left blank means that channel is **simulated** — reminders are logged but not actually delivered, so the app is fully usable before you wire up a provider.

### Configuring WhatsApp Cloud API

Create a Meta app at <https://developers.facebook.com>, add the **WhatsApp** product, and from *API Setup* copy the **temporary/permanent access token** and **phone number ID** into `WHATSAPP_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID`. For production sending outside the 24-hour customer-service window, create and get approval for a message **template**, then set `WHATSAPP_TEMPLATE_NAME` (and `WHATSAPP_TEMPLATE_LANG`).

---

## Deploying with Docker

The included `Dockerfile` is multi-stage: it builds the React client, installs only production server dependencies, and produces one slim image (runs as a non-root user, with a `/api/health` healthcheck) that serves **both the API and the compiled front-end** on a single port. MongoDB stays external (Atlas), so no database container is required.

```bash
# 1. Point the app at your database
cp server/.env.example server/.env
#    → set MONGODB_URI to your Atlas connection string, and NODE_ENV=production

# 2. Build and start in the background
docker compose up -d --build

# 3. (first run, optional) load demo data inside the container
docker compose run --rm app npm run seed

# 4. Tail logs / check status
docker compose logs -f app
```

The app is now on **http://<your-server>:5000** — the same origin serves the UI and the `/api` endpoints.

Common operations:

```bash
docker compose down                 # stop and remove the container
docker compose up -d --build        # rebuild & restart after code changes
docker compose ps                   # container + health status
```

**Without Compose**, if you prefer plain Docker:

```bash
docker build -t vidyasetu:latest .
docker run -d --name vidyasetu -p 5000:5000 --env-file server/.env \
  -e NODE_ENV=production vidyasetu:latest
```

**Prefer a local MongoDB container instead of Atlas?** Uncomment the `mongo` service (and the `volumes` block) at the bottom of `docker-compose.yml`, then set `MONGODB_URI=mongodb://mongo:27017/vidyasetu` in `server/.env`.

**Reverse proxy / HTTPS:** put Nginx, Caddy, or Traefik in front of port 5000 to terminate TLS and serve on 80/443. Since the client talks to `/api` on its own origin, no extra client configuration is needed.

---

## npm scripts

Run from the repository root:

| Script                 | What it does |
|------------------------|--------------|
| `npm run install:all`  | Install root, server, and client dependencies |
| `npm run dev`          | Run API + client dev server together (via `concurrently`) |
| `npm run dev:server`   | API only, with nodemon reload |
| `npm run dev:client`   | Vite dev server only |
| `npm run build`        | Build the client to `client/dist` |
| `npm start`            | Start the API (serves `client/dist` if it exists) |
| `npm run seed`         | Reset and load demo data into MongoDB |
| `npm run lint`         | Lint the client |

---

## API overview

Base path: `/api`

| Resource      | Endpoints |
|---------------|-----------|
| `GET /health` | Liveness check |
| `students`    | `GET / POST /`, `GET / PUT / DELETE /:id` |
| `classes`     | `GET / POST /`, `PUT / DELETE /:id` |
| `subjects`    | `GET / POST /`, `PUT / DELETE /:id` |
| `payments`    | `GET / POST /` (filter by student/method/date), `DELETE /:id` |
| `dashboard`   | `GET /summary`, `GET /charts`, `GET /expiring` |
| `reminders`   | `GET /` (log), `POST /send` |
| `settings`    | `GET /`, `PUT /` |

---

## Notes

- **Data model:** a student's `monthlyFee` is fixed at enrollment as `class.baseMonthlyFee + Σ subject.addOnFee`, so later fee changes don't retroactively alter existing students.
- **Currency:** defaults to INR with `en-IN` formatting; changeable in **Settings**.
- **Deleting a class or subject** that's still assigned to students is blocked to protect historical records.

---

© Tushar 2026
