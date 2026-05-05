-- Add is_default column to categories table if it doesn't already exist
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;
