-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN "category" TEXT;

-- CreateEnum
CREATE TYPE "TaxonomyKind" AS ENUM ('NEWS_TOPIC', 'CATALOG_CATEGORY');

-- CreateTable
CREATE TABLE "Taxonomy" (
    "id" TEXT NOT NULL,
    "kind" "TaxonomyKind" NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Taxonomy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Taxonomy_kind_sortOrder_idx" ON "Taxonomy"("kind", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Taxonomy_kind_name_key" ON "Taxonomy"("kind", "name");

-- Seed default news topics (from previous hardcoded list)
INSERT INTO "Taxonomy" ("id", "kind", "name", "sortOrder", "updatedAt") VALUES
  ('tax_news_events', 'NEWS_TOPIC', 'События', 0, CURRENT_TIMESTAMP),
  ('tax_news_tournaments', 'NEWS_TOPIC', 'Турниры', 1, CURRENT_TIMESTAMP),
  ('tax_news_school', 'NEWS_TOPIC', 'Школа', 2, CURRENT_TIMESTAMP),
  ('tax_news_announcements', 'NEWS_TOPIC', 'Анонсы', 3, CURRENT_TIMESTAMP);

-- Seed default catalog categories
INSERT INTO "Taxonomy" ("id", "kind", "name", "sortOrder", "updatedAt") VALUES
  ('tax_cat_kit', 'CATALOG_CATEGORY', 'Форма', 0, CURRENT_TIMESTAMP),
  ('tax_cat_gear', 'CATALOG_CATEGORY', 'Экипировка', 1, CURRENT_TIMESTAMP),
  ('tax_cat_accessories', 'CATALOG_CATEGORY', 'Аксессуары', 2, CURRENT_TIMESTAMP);
