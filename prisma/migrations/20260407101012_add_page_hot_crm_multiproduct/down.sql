-- Rollback: 20260407101012_add_page_hot_crm_multiproduct
-- Reverses: Page model, HOT sales, CRM fields, multi-product per entry

-- 1. Drop foreign keys first
ALTER TABLE "entry_products" DROP CONSTRAINT IF EXISTS "entry_products_productId_fkey";
ALTER TABLE "entry_products" DROP CONSTRAINT IF EXISTS "entry_products_entryId_fkey";
ALTER TABLE "entries" DROP CONSTRAINT IF EXISTS "entries_crmProductId_fkey";
ALTER TABLE "entries" DROP CONSTRAINT IF EXISTS "entries_pageId_fkey";

-- 2. Drop indexes
DROP INDEX IF EXISTS "entries_pageId_idx";
DROP INDEX IF EXISTS "entry_products_entryId_productId_key";
DROP INDEX IF EXISTS "entry_products_productId_idx";
DROP INDEX IF EXISTS "entry_products_entryId_idx";
DROP INDEX IF EXISTS "pages_name_key";

-- 3. Drop new tables
DROP TABLE IF EXISTS "entry_products";
DROP TABLE IF EXISTS "pages";

-- 4. Remove added columns from entries
ALTER TABLE "entries" DROP COLUMN IF EXISTS "pageId";
ALTER TABLE "entries" DROP COLUMN IF EXISTS "hotSales";
ALTER TABLE "entries" DROP COLUMN IF EXISTS "crmProductId";
ALTER TABLE "entries" DROP COLUMN IF EXISTS "crmOrders";

-- 5. Mark migration as rolled back in Prisma
DELETE FROM "_prisma_migrations" WHERE "migration_name" = '20260407101012_add_page_hot_crm_multiproduct';
