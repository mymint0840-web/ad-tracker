-- Soft-delete column for users table.
-- Nullable; null = active, timestamp = soft-deleted at that moment.
ALTER TABLE "users" ADD COLUMN "deletedAt" TIMESTAMP(3);
