-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN "publishAt" TIMESTAMP(3),
ADD COLUMN "unpublishAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MediaItem_type_published_publishAt_unpublishAt_idx" ON "MediaItem"("type", "published", "publishAt", "unpublishAt");
