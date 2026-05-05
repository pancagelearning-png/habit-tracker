# Habit Tracker

A full-stack habit and task tracker with a dark mobile-first UI.

**Stack:** React + Vite · Fastify · Supabase PostgreSQL · JWT Auth

---

## Project Structure

```
habit-tracker/
├── frontend/           React + Vite app (port 5173)
│   └── src/
│       ├── screens/    LoginScreen, SignupScreen, TodayScreen, CalendarScreen,
│       │               AddScreen, StatsScreen, ProfileScreen
│       ├── components/ BottomNavbar, HabitCard, TaskCard, ProtectedRoute
│       ├── hooks/      useAuth
│       ├── services/   api, habits, tasks, categories
│       └── utils/      helpers
├── backend/            Fastify API (port 3000)
│   ├── routes/         auth, habits, tasks, categories  → /api/v1/*
│   ├── controllers/    authController, habitsController, tasksController, categoriesController
│   ├── schemas/        Fastify JSON schemas for request validation
│   └── plugins/        cors, jwt
└── supabase/
    └── schema.sql      Run once to create all tables
```

---

## 1. Database Setup (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`.
3. From **Project Settings → API**, copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Backend Setup

```bash
cd backend
cp .env.example .env       # then fill in your values
npm install
npm run dev                # starts on http://localhost:3000
```

### Required `.env` values

| Variable                  | Description                                  |
|---------------------------|----------------------------------------------|
| `PORT`                    | Server port (default `3000`)                 |
| `FRONTEND_URL`            | CORS allowed origin (default `http://localhost:5173`) |
| `SUPABASE_URL`            | Your Supabase project URL                    |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bypasses RLS)            |
| `JWT_SECRET`              | Random secret ≥ 32 chars                     |

### API Routes

All routes are prefixed with `/api/v1`.

| Method | Path                     | Auth | Description               |
|--------|--------------------------|------|---------------------------|
| POST   | `/auth/signup`           | —    | Create account            |
| POST   | `/auth/login`            | —    | Login, returns JWT        |
| GET    | `/auth/me`               | ✓    | Current user              |
| GET    | `/habits`                | ✓    | All habits                |
| GET    | `/habits/today`          | ✓    | Today's habits + completed|
| GET    | `/habits/stats`          | ✓    | Completion stats          |
| POST   | `/habits`                | ✓    | Create habit              |
| PUT    | `/habits/:id`            | ✓    | Update habit              |
| DELETE | `/habits/:id`            | ✓    | Archive habit             |
| POST   | `/habits/:id/log`        | ✓    | Toggle completion         |
| GET    | `/habits/:id/logs`       | ✓    | Completion history        |
| GET    | `/tasks`                 | ✓    | All tasks (filterable)    |
| POST   | `/tasks`                 | ✓    | Create task               |
| PUT    | `/tasks/:id`             | ✓    | Update / complete task    |
| DELETE | `/tasks/:id`             | ✓    | Delete task               |
| GET    | `/categories`            | ✓    | All categories            |
| POST   | `/categories`            | ✓    | Create category           |
| DELETE | `/categories/:id`        | ✓    | Delete category           |

---

## 3. Frontend Setup

```bash
cd frontend
cp .env.example .env       # set VITE_API_URL if backend is not on localhost:3000
npm install
npm run dev                # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:3000`, so you can
leave `VITE_API_URL` unset during local development.

---

## 4. Running Both Locally

Open two terminal tabs:

```bash
# Tab 1 — backend
cd backend && npm run dev

# Tab 2 — frontend
cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 5. Production Build

```bash
# Build frontend static files
cd frontend && npm run build

# Serve backend (use a process manager like pm2 or fly.io)
cd backend && npm start
```

---

## Features

- **Today** — progress ring, habit checklist, tasks due today
- **Calendar** — monthly grid showing completion history
- **Add** — create habits (daily/custom days, color picker) or tasks (priority, due date)
- **Stats** — completion rate bars per habit across 7 / 30 / 90 days
- **Profile** — user info, manage categories, sign out
- JWT stored in `localStorage`, all protected routes redirect to `/login`
- Toggle habit completion (tap to check/uncheck)
