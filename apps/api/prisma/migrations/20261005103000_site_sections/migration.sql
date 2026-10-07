-- CreateTable
CREATE TABLE "SiteSection" (
    "key" "MediaType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSection_pkey" PRIMARY KEY ("key")
);

-- Seed default rows
INSERT INTO "SiteSection" ("key", "enabled", "updatedAt") VALUES
  ('CATALOG', true, CURRENT_TIMESTAMP),
  ('NEWS', true, CURRENT_TIMESTAMP),
  ('REVIEW', true, CURRENT_TIMESTAMP);
