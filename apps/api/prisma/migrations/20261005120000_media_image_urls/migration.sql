-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill gallery from cover image
UPDATE "MediaItem"
SET "imageUrls" = ARRAY["imageUrl"]
WHERE "imageUrl" IS NOT NULL
  AND "imageUrl" <> ''
  AND cardinality("imageUrls") = 0;
