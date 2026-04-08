-- Rollback: 20260406124752_init
-- WARNING: This drops ALL tables — use only for full reset

-- 1. Drop foreign keys
ALTER TABLE "stock_logs" DROP CONSTRAINT IF EXISTS "stock_logs_productId_fkey";
ALTER TABLE "entries" DROP CONSTRAINT IF EXISTS "entries_createdById_fkey";
ALTER TABLE "entries" DROP CONSTRAINT IF EXISTS "entries_productId_fkey";
ALTER TABLE "entries" DROP CONSTRAINT IF EXISTS "entries_accountId_fkey";

-- 2. Drop indexes
DROP INDEX IF EXISTS "stock_logs_productId_idx";
DROP INDEX IF EXISTS "entries_date_productId_idx";
DROP INDEX IF EXISTS "entries_date_accountId_idx";
DROP INDEX IF EXISTS "entries_productId_idx";
DROP INDEX IF EXISTS "entries_accountId_idx";
DROP INDEX IF EXISTS "entries_date_idx";
DROP INDEX IF EXISTS "ad_accounts_name_key";
DROP INDEX IF EXISTS "users_email_key";

-- 3. Drop tables (order matters — children first)
DROP TABLE IF EXISTS "daily_targets";
DROP TABLE IF EXISTS "stock_logs";
DROP TABLE IF EXISTS "entries";
DROP TABLE IF EXISTS "products";
DROP TABLE IF EXISTS "ad_accounts";
DROP TABLE IF EXISTS "users";

-- 4. Drop enum
DROP TYPE IF EXISTS "Role";

-- 5. Remove from Prisma migration history
DELETE FROM "_prisma_migrations" WHERE "migration_name" = '20260406124752_init';
