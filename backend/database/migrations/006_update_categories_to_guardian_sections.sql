-- Migration: 006_update_categories_to_guardian_sections.sql
-- Description: Updates categories to Guardian API sections
-- Author: Personalized News Feed Project
-- Date: 2026-01-06
-- Version: 1.0.0
-- This migration updates the default categories and validation constraint
-- to use Guardian API section IDs instead of NewsAPI categories

-- STEP 1: Drop old constraints and validation function FIRST
-- This allows us to update data without constraint violations
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS check_valid_categories;
ALTER TABLE user_preferences DROP CONSTRAINT IF EXISTS user_preferences_categories_valid;

-- Drop the old validation function if it exists
DROP FUNCTION IF EXISTS validate_categories(JSONB);

-- STEP 2: Update existing users' categories
-- Map old categories to new Guardian sections:
-- 'general' -> 'news'
-- 'entertainment' -> 'culture'
-- 'health' -> 'society'
-- 'sports' -> 'sport'
UPDATE user_preferences
SET categories = (
  SELECT jsonb_agg(
    CASE 
      WHEN value = '"general"' THEN '"news"'
      WHEN value = '"entertainment"' THEN '"culture"'
      WHEN value = '"health"' THEN '"society"'
      WHEN value = '"sports"' THEN '"sport"'
      ELSE value
    END
  )
  FROM jsonb_array_elements(categories)
)
WHERE categories::text LIKE '%"general"%' 
   OR categories::text LIKE '%"entertainment"%'
   OR categories::text LIKE '%"health"%'
   OR categories::text LIKE '%"sports"%';

-- STEP 3: Update default categories
ALTER TABLE user_preferences 
ALTER COLUMN categories SET DEFAULT '["news", "technology"]'::jsonb;

-- STEP 4: Create new validation function for Guardian API sections
CREATE OR REPLACE FUNCTION validate_categories(categories JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  allowed_categories TEXT[] := ARRAY[
    'business', 'technology', 'science', 'sport', 'culture', 'news',
    'world', 'politics', 'environment', 'society', 'lifeandstyle',
    'food', 'travel', 'fashion', 'books', 'music', 'film', 'games',
    'education', 'media'
  ];
  category_value TEXT;
BEGIN
  -- Check if categories is a valid JSONB array
  IF jsonb_typeof(categories) != 'array' THEN
    RETURN FALSE;
  END IF;

  -- Check if array is not empty
  IF jsonb_array_length(categories) = 0 THEN
    RETURN FALSE;
  END IF;

  -- Check if array length is within limit (max 20)
  IF jsonb_array_length(categories) > 20 THEN
    RETURN FALSE;
  END IF;

  -- Check each category against allowed values
  FOR i IN 0..jsonb_array_length(categories)-1 LOOP
    category_value := categories->>i;
    IF NOT (category_value = ANY(allowed_categories)) THEN
      RETURN FALSE;
    END IF;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- STEP 5: Add new constraint using the validation function
ALTER TABLE user_preferences
ADD CONSTRAINT user_preferences_categories_valid
CHECK (validate_categories(categories));

-- STEP 6: Update table comment
COMMENT ON COLUMN user_preferences.categories IS 'JSONB array of selected news categories from Guardian API sections (default: ["news", "technology"])';
