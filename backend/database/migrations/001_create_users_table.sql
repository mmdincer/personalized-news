-- Migration: 001_create_users_table.sql
-- Description: Creates users table for authentication
-- Author: Personalized News Feed Project
-- Date: 2025-01-05
-- Version: 1.0.0

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Add comment to table
COMMENT ON TABLE users IS 'User accounts for authentication';
COMMENT ON COLUMN users.id IS 'Unique user identifier (UUID)';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.name IS 'User full name';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password (cost factor: 10)';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.updated_at IS 'Last update timestamp';

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
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
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY users_service_role_access ON users FOR ALL USING (true);
--
-- Note: Service role key bypasses RLS, which is what we use in backend
-- This is secure because:
-- 1. Service role key is NEVER exposed to frontend
-- 2. Backend validates JWT tokens before database queries
-- 3. Backend ensures users can only access their own data
