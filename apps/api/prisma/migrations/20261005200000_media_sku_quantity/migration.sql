-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN "sku" TEXT,
ADD COLUMN "quantity" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "MediaItem_sku_key" ON "MediaItem"("sku");
