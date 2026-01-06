-- Migration: 004_remove_country_column.sql
-- Description: Removes country column from user_preferences table to simplify to single language (English) support
-- Author: Personalized News Feed Project
-- Date: 2026-01-06
-- Version: 1.0.0

-- Remove country index
DROP INDEX IF EXISTS idx_user_preferences_country;

-- Remove country column
ALTER TABLE user_preferences DROP COLUMN IF EXISTS country;

-- Update table comment
COMMENT ON TABLE user_preferences IS 'User news preferences (categories only)';
COMMENT ON COLUMN user_preferences.categories IS 'JSONB array of selected news categories (default: ["general", "technology"])';

