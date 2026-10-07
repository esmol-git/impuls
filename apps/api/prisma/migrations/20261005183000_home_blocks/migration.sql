-- CreateTable
CREATE TABLE "HomeBlock" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeBlock_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "HomeBlock_sortOrder_idx" ON "HomeBlock"("sortOrder");
