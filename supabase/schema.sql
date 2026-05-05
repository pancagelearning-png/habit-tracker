-- ============================================================
-- Habit Tracker — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users ──────────────────────────────────────────────────
-- We manage our own users table (independent of Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── Categories ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  color      VARCHAR(7)   NOT NULL DEFAULT '#6C63FF',
  icon       VARCHAR(50),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- ── Habits ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habits (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID         REFERENCES categories(id) ON DELETE SET NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  frequency   VARCHAR(20)  NOT NULL DEFAULT 'daily'
                           CHECK (frequency IN ('daily', 'weekly', 'custom')),
  -- target_days: array of weekday numbers 1=Mon … 7=Sun
  target_days INTEGER[]    NOT NULL DEFAULT '{1,2,3,4,5,6,7}',
  color       VARCHAR(7)   NOT NULL DEFAULT '#6C63FF',
  icon        VARCHAR(50),
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id    ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_is_active  ON habits(is_active);

-- ── Habit Logs ─────────────────────────────────────────────
-- One row per habit per calendar day (UNIQUE enforces toggle-on/off)
CREATE TABLE IF NOT EXISTS habit_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id     UUID        NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  completed_at DATE        NOT NULL DEFAULT CURRENT_DATE,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (habit_id, completed_at)
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id      ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id     ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_completed_at ON habit_logs(completed_at);

-- ── Tasks ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  UUID         REFERENCES categories(id) ON DELETE SET NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  due_date     DATE,
  priority     VARCHAR(10)  NOT NULL DEFAULT 'medium'
                            CHECK (priority IN ('low', 'medium', 'high')),
  is_completed BOOLEAN      NOT NULL DEFAULT FALSE,
  is_archived  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id      ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date     ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_is_archived  ON tasks(is_archived);

-- Migration for existing deployments:
-- ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;
-- CREATE INDEX IF NOT EXISTS idx_tasks_is_archived ON tasks(is_archived);

-- ── Task Logs ──────────────────────────────────────────────
-- Audit trail for task state changes
CREATE TABLE IF NOT EXISTS task_logs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID        NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action     VARCHAR(20) NOT NULL CHECK (action IN ('completed', 'uncompleted', 'updated', 'created')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_task_logs_task_id ON task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_logs_user_id ON task_logs(user_id);

-- ── Row Level Security (optional but recommended) ──────────
-- Disable RLS since we use service-role key and validate user_id in app code.
-- If you want RLS, enable below and create policies.

-- ALTER TABLE users        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE habits        ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE habit_logs    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE task_logs     ENABLE ROW LEVEL SECURITY;
