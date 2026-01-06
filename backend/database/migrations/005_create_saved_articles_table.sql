-- Migration: 005_create_saved_articles_table.sql
-- Description: Creates saved_articles table for storing user saved articles
-- Author: Personalized News Feed Project
-- Date: 2026-01-06
-- Version: 1.0.0

-- Create saved_articles table
CREATE TABLE saved_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  article_url VARCHAR(500) NOT NULL,
  article_title VARCHAR(500) NOT NULL,
  article_image_url VARCHAR(500),
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, article_url)
);

-- Create indexes for performance
CREATE INDEX idx_saved_articles_user_id ON saved_articles(user_id);
CREATE INDEX idx_saved_articles_saved_at ON saved_articles(saved_at DESC);

-- Add comment to table
COMMENT ON TABLE saved_articles IS 'User saved articles for later reading';
COMMENT ON COLUMN saved_articles.id IS 'Unique saved article identifier (UUID)';
COMMENT ON COLUMN saved_articles.user_id IS 'Reference to users table (foreign key)';
COMMENT ON COLUMN saved_articles.article_url IS 'URL of the saved article (unique per user, combined with user_id)';
COMMENT ON COLUMN saved_articles.article_title IS 'Title of the saved article';
COMMENT ON COLUMN saved_articles.article_image_url IS 'Image URL of the saved article (optional)';
COMMENT ON COLUMN saved_articles.saved_at IS 'Timestamp when article was saved';

