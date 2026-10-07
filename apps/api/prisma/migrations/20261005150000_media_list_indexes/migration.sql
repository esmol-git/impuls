-- CreateIndex
CREATE INDEX "MediaItem_type_createdAt_idx" ON "MediaItem"("type", "createdAt");

-- CreateIndex
CREATE INDEX "MediaItem_type_category_idx" ON "MediaItem"("type", "category");

-- CreateIndex
CREATE INDEX "MediaItem_type_topic_idx" ON "MediaItem"("type", "topic");

-- Expression index for catalog effective price sorts/filters
CREATE INDEX "MediaItem_catalog_effective_price_idx"
ON "MediaItem" (COALESCE("salePrice", price))
WHERE type = 'CATALOG' AND published = true AND COALESCE("salePrice", price) IS NOT NULL;
