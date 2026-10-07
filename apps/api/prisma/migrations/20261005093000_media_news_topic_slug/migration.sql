-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN "topic" TEXT,
ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MediaItem_slug_key" ON "MediaItem"("slug");
