-- Migration: 008_add_article_details_to_saved_articles.sql
-- Description: Adds article details columns to saved_articles table for full article content storage
-- Author: Personalized News Feed Project
-- Date: 2026-01-06
-- Version: 1.0.0

-- Add new columns for article details
ALTER TABLE saved_articles
  ADD COLUMN IF NOT EXISTS article_description TEXT,
  ADD COLUMN IF NOT EXISTS article_content TEXT,
  ADD COLUMN IF NOT EXISTS article_source_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS article_published_at TIMESTAMP WITH TIME ZONE;

-- Create index on article_published_at for sorting
CREATE INDEX IF NOT EXISTS idx_saved_articles_published_at ON saved_articles(article_published_at DESC);

-- Add comments to new columns
COMMENT ON COLUMN saved_articles.article_description IS 'Short description/trail text of the article';
COMMENT ON COLUMN saved_articles.article_content IS 'Full article content/body text';
COMMENT ON COLUMN saved_articles.article_source_name IS 'Source name (e.g., The Guardian, section name)';
COMMENT ON COLUMN saved_articles.article_published_at IS 'Original publication date of the article';

