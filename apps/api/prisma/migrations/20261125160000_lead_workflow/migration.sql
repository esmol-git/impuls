-- AlterEnum
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'PROCESSED';

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "assigneeId" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "handledAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "note" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_assigneeId_status_idx" ON "Lead"("assigneeId", "status");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Lead_assigneeId_fkey'
  ) THEN
    ALTER TABLE "Lead"
      ADD CONSTRAINT "Lead_assigneeId_fkey"
      FOREIGN KEY ("assigneeId") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
