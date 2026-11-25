-- CreateEnum
CREATE TYPE "SiteSectionKey" AS ENUM ('CATALOG', 'NEWS', 'REVIEW', 'GALLERY', 'COACHES');

-- AlterTable: SiteSection.key MediaType → SiteSectionKey
ALTER TABLE "SiteSection" DROP CONSTRAINT "SiteSection_pkey";

ALTER TABLE "SiteSection"
  ALTER COLUMN "key" TYPE "SiteSectionKey"
  USING ("key"::text::"SiteSectionKey");

ALTER TABLE "SiteSection" ADD CONSTRAINT "SiteSection_pkey" PRIMARY KEY ("key");

-- Seed coaches section (enabled by default, like other sections)
INSERT INTO "SiteSection" ("key", "enabled", "updatedAt")
VALUES ('COACHES', true, CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
