-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'GALLERY';

-- Seed site section for gallery visibility toggle
INSERT INTO "SiteSection" ("key", "enabled", "updatedAt")
VALUES ('GALLERY', true, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
