-- V0.4__OAuth_Support.sql
-- Add OAuth2 authentication support to users table

-- Add auth_provider column with default value LOCAL
ALTER TABLE users ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';

-- Add provider_id column for OAuth provider's unique user ID
ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);

-- Make password nullable (OAuth users don't have passwords)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Create index for auth_provider and provider_id lookups
CREATE INDEX idx_users_provider ON users(auth_provider, provider_id);

-- Create unique index to ensure provider_id is unique per provider (when not null)
CREATE UNIQUE INDEX idx_users_provider_id ON users(auth_provider, provider_id) WHERE provider_id IS NOT NULL;
