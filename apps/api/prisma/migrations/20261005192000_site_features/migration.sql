-- CreateTable
CREATE TABLE "SiteFeature" (
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteFeature_pkey" PRIMARY KEY ("key")
);
