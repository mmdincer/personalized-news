-- Migration: 002_create_user_preferences_table.sql
-- Description: Creates user_preferences table for storing user news preferences
-- Author: Personalized News Feed Project
-- Date: 2025-01-05
-- Version: 1.0.0

-- Create user_preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  categories JSONB DEFAULT '["general", "technology"]'::jsonb NOT NULL,
  country VARCHAR(2) DEFAULT 'tr' NOT NULL CHECK (country IN ('tr', 'us', 'de', 'fr', 'es')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_country ON user_preferences(country);

-- Create GIN index on categories for JSONB queries (optional, for advanced filtering)
CREATE INDEX idx_user_preferences_categories ON user_preferences USING GIN(categories);

-- Add comment to table
COMMENT ON TABLE user_preferences IS 'User news preferences (categories and country)';
COMMENT ON COLUMN user_preferences.id IS 'Unique preference identifier (UUID)';
COMMENT ON COLUMN user_preferences.user_id IS 'Reference to users table (one-to-one)';
COMMENT ON COLUMN user_preferences.categories IS 'JSONB array of selected news categories (default: ["general", "technology"])';
COMMENT ON COLUMN user_preferences.country IS 'Preferred country code for news source and UI language (tr, us, de, fr, es)';
COMMENT ON COLUMN user_preferences.created_at IS 'Preference creation timestamp';
COMMENT ON COLUMN user_preferences.updated_at IS 'Last update timestamp';

-- Add constraint for valid categories (check function)
CREATE OR REPLACE FUNCTION validate_categories(categories JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if categories is a valid JSONB array
  IF jsonb_typeof(categories) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Check if all categories are valid (empty array is allowed)
  IF jsonb_array_length(categories) = 0 THEN
    RETURN TRUE;
  END IF;

  -- Check each category against allowed values
  FOR i IN 0..jsonb_array_length(categories)-1 LOOP
    IF NOT (categories->>i IN ('business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology')) THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add check constraint using the validation function
ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_categories_valid
CHECK (validate_categories(categories));

-- Create trigger to auto-update updated_at timestamp
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
-- IMPORTANT: This project uses CUSTOM JWT authentication, NOT Supabase Auth
-- Therefore, we do NOT use auth.users table or auth.uid() function
-- All authentication is handled by backend JWT tokens
-- 
-- RLS is handled at application level (backend middleware) rather than database level
-- Backend validates JWT tokens and ensures users can only access their own data
-- 
-- If you want to enable RLS at database level, you would need to:
-- 1. Create a function that validates JWT tokens (complex, not recommended)
-- 2. Or disable RLS and rely on backend middleware (current approach - recommended)
--
-- For production, RLS can be enabled but policies should be permissive
-- since backend handles all authorization via JWT middleware
--
-- ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY user_preferences_service_role_access ON user_preferences FOR ALL USING (true);
--
-- Note: Service role key bypasses RLS, which is what we use in backend
-- This is secure because:
-- 1. Service role key is NEVER exposed to frontend
-- 2. Backend validates JWT tokens before database queries
-- 3. Backend ensures users can only access their own data
