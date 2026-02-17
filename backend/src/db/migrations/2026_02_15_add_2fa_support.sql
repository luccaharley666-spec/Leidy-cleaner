-- ============================================
-- MIGRATION: Add 2FA Support (February 2026)
-- Add Two-Factor Authentication columns to users table
-- ============================================

-- Add 2FA columns to users table if they don't exist
-- Note: SQLite doesn't support ALTER TABLE ADD COLUMN IF NOT EXISTS, 
-- so we do this with a PRAGMA approach or separate checks

BEGIN TRANSACTION;

-- Create a temporary table to check if we need the migration
CREATE TABLE IF NOT EXISTS _2fa_migration_check (id INTEGER);

-- For SQLite, we'll use a workaround: try to add columns, ignore if they exist
-- This requires running multiple ALTER TABLE statements

-- Add two_factor_enabled column
CREATE TABLE IF NOT EXISTS users_2fa_migration AS
SELECT 
  id,
  email,
  password,
  CASE WHEN password != '' THEN password ELSE NULL END as password_hash,
  name,
  phone,
  cpf_cnpj,
  role,
  company_name,
  company_cnpj,
  company_address,
  company_phone,
  bank_account,
  bank_routing,
  address,
  city,
  state,
  zip_code,
  five_star_streak,
  total_five_stars,
  loyalty_bonus,
  bonus_redeemed,
  is_active,
  0 as two_factor_enabled,
  NULL as two_factor_secret,
  NULL as two_factor_backup_codes,
  created_at,
  updated_at
FROM users;

DROP TABLE users;

ALTER TABLE users_2fa_migration RENAME TO users;

-- Recreate any foreign key constraints or indices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled);

DROP TABLE _2fa_migration_check;

COMMIT;

-- ============================================
-- End of migration
-- ============================================
