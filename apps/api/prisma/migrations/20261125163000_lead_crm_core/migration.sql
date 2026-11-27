-- AlterEnum LeadStatus
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'TRIAL';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'ENROLLED';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'LOST';

-- CreateEnum LeadActivityType
DO $$ BEGIN
  CREATE TYPE "LeadActivityType" AS ENUM ('STATUS', 'ASSIGNEE', 'NOTE', 'CALL', 'CALLBACK', 'SYSTEM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- AlterTable Lead
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "phoneNorm" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "childName" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "nextContactAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "lostReason" TEXT;

-- Backfill phoneNorm: digits only
UPDATE "Lead"
SET "phoneNorm" = NULLIF(regexp_replace("phone", '[^0-9]', '', 'g'), '')
WHERE "phoneNorm" IS NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_phoneNorm_idx" ON "Lead"("phoneNorm");
CREATE INDEX IF NOT EXISTS "Lead_nextContactAt_idx" ON "Lead"("nextContactAt");

-- CreateTable LeadActivity
CREATE TABLE IF NOT EXISTS "LeadActivity" (
  "id" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "userId" TEXT,
  "type" "LeadActivityType" NOT NULL,
  "body" TEXT,
  "meta" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "LeadActivity_leadId_createdAt_idx" ON "LeadActivity"("leadId", "createdAt");
CREATE INDEX IF NOT EXISTS "LeadActivity_userId_idx" ON "LeadActivity"("userId");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadActivity_leadId_fkey') THEN
    ALTER TABLE "LeadActivity"
      ADD CONSTRAINT "LeadActivity_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES "Lead"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadActivity_userId_fkey') THEN
    ALTER TABLE "LeadActivity"
      ADD CONSTRAINT "LeadActivity_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
