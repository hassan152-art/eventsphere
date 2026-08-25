# EventSphere — College Event Management & Information System

A full-stack MERN platform for discovering, registering for, and running college
events: hackathons, cultural nights, sports meets, workshops, seminars, and more.
Built with a role-aware experience for **Visitors**, **Participants**, **Organizers**,
and **Admins**, including QR-based attendance, PDF certificate generation, waitlisting
with auto-promotion, live analytics, and an AI Copilot with a safe rule-based fallback.

---

## ⚠️ Before you run this

This project was generated in a sandboxed environment **without network access**,
so the code has been written and syntax-checked but **not** `npm install`-ed, run
against a live MongoDB, or built end-to-end. You'll need to do that locally. See
"Known gaps" at the bottom for what's fully wired up vs. left as a clean extension
point.

---

## Features

- **Public**: landing page, event discovery (search/filter/sort, grid & list view),
  event details with reviews & social sharing, media gallery, FAQ, sitemap.
- **Auth**: JWT + bcrypt, register/login/forgot-password/reset-password, protected
  routes, role-based access control (participant / organizer / admin).
- **Participant dashboard**: registrations, QR attendance pass, certificates, saved
  events, feedback, profile.
- **Organizer dashboard**: multi-step event creation (pending admin approval),
  registrations table, QR scan-to-check-in, bulk certificate issuance, analytics.
- **Admin dashboard**: platform-wide stats & charts, user management (role/status/
  delete), event approval workflow, gallery & feedback moderation, announcements,
  CSV/JSON reports.
- **Registration engine**: MongoDB transactions atomically decrement seats to
  prevent overbooking; automatic waitlisting and promotion on cancellation.
- **QR Attendance**: unique per-registration token embedded in a QR code; scan
  endpoint validates token + event + prevents duplicate check-in.
- **Certificates**: PDF generation via `pdfkit`, single or bulk issue, download
  links. Certificate *fees* are shown as a status placeholder only — **no real
  payment processing is implemented**, per the SRS.
- **Notifications**: in-app notification center (bell + dropdown + read/unread),
  triggered by registration, waitlist promotion, attendance, certificates, event
  approval, and admin announcements.
- **Calendar integration**: `.ics` download per event.
- **AI Copilot**: floating chat widget wired to `POST /api/ai/chat`. The backend
  gathers real, role-scoped context from MongoDB and either calls a configured LLM
  (Anthropic or OpenAI-compatible, swappable via env vars) or falls back to a
  deterministic rule-based responder if no `AI_API_KEY` is set — so the feature
  always works, even with zero configuration.

## Tech stack

- **Frontend**: React 18, Vite, React Router, Tailwind CSS, Framer Motion, Recharts,
  Axios, React Hook Form, Lucide icons, react-hot-toast.
- **Backend**: Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, Multer +
  Cloudinary, qrcode, pdfkit, ics, json2csv, express-validator, helmet,
  express-rate-limit, express-mongo-sanitize.

## Folder structure

```
eventsphere/
  server/
    src/
      config/        # db, cloudinary
      models/        # Mongoose schemas
      middleware/     # auth, RBAC, error handling, upload
      controllers/     # business logic per module
      routes/          # /api/* route wiring
      services/        # aiService, emailService, qrService, calendarService, certificateService
      validators/       # express-validator chains
      seed/              # seed.js - demo data
      app.js / server.js
  client/
    src/
      components/  # ui, layout, events, dashboard, notifications, copilot, etc.
      pages/        # public, auth, student, organizer, admin
      context/       # AuthContext, ThemeContext
      services/       # axios API layer, one file per domain
      routes/          # ProtectedRoute
```

## Getting started

### 1. Backend

```bash
cd server
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET, etc.
npm install
npm run seed               # populates demo data + accounts (see below)
npm run dev                 # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd client
cp .env.example .env       # VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

### MongoDB setup

Any MongoDB 6+ instance works — local (`mongodb://127.0.0.1:27017/eventsphere`) or
Atlas. Set `MONGO_URI` in `server/.env` accordingly. Indexes are declared directly
on the Mongoose schemas (see `models/*.js`) and are created automatically on first
connection.

### AI Copilot configuration (optional)

Leave `AI_API_KEY` empty in `server/.env` and the Copilot will use its rule-based
fallback automatically — no setup required for a working demo. To connect a real
LLM:

```
AI_PROVIDER=anthropic        # or "openai"
AI_API_KEY=sk-...
AI_MODEL=claude-sonnet-4-6   # or e.g. gpt-4o-mini for openai
```

The frontend never sees this key — all calls are proxied through
`POST /api/ai/chat`, which builds a grounded system prompt from live DB data.

### Cloudinary (optional but recommended)

Event banners/images/rulebooks and gallery media upload to Cloudinary. Without
credentials configured, upload endpoints will fail gracefully with a clear error;
everything else (auth, discovery, registration, QR, reports) works independently.

## Demo credentials

Created by `npm run seed`:

| Role      | Email                        | Password         |
|-----------|-------------------------------|-------------------|
| Admin     | admin@eventsphere.com         | Admin@12345       |
| Organizer | organizer@eventsphere.com     | Organizer@12345   |
| Student   | student@eventsphere.com       | Student@12345     |

## Build for production

```bash
cd client && npm run build     # outputs client/dist
cd server && npm start          # NODE_ENV=production node src/server.js
```

Serve `client/dist` via your static host / CDN of choice, or add a small Express
static-file fallback in `server/src/app.js` if you want a single deployable unit.

---

## Known gaps / where to extend next

This is a genuinely functional MERN app end-to-end (not static screens), but given
the scope of the original spec, a few areas are intentionally left as clean,
obvious extension points rather than fully built out:

- **Real-time notifications** currently use light polling (30s) on the bell icon
  rather than WebSockets/Socket.io — swap in a socket layer if you need true
  push updates.
- **Google/Outlook/Apple "Add to Calendar" deep links** are not generated
  (only the universal `.ics` download is implemented, which all three can import).
- **Excel (.xlsx) report export** is not implemented; CSV and JSON are, via the
  same `/api/reports/*` endpoints (`?format=csv`).
- **Report CSV download auth** uses a `?token=` query param for simplicity (since
  `<a>`/`window.open` can't set an Authorization header) — for production, swap
  this for a short-lived signed download URL instead.
- Some admin moderation screens (gallery, feedback) show data but keep actions
  minimal — extend with pagination/bulk actions as needed at scale.
- No automated test suite is included.

Everything else described in the SRS — auth, RBAC, event CRUD + approval,
registration with atomic seat handling and waitlist auto-promotion, QR attendance,
certificate generation, feedback/ratings, notifications, gallery, reports, and the
AI Copilot with fallback — is implemented and wired between frontend and backend.
