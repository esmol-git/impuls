-- AlterTable
ALTER TABLE "MediaItem" ADD COLUMN     "body" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "discount" INTEGER,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "salePrice" INTEGER,
ALTER COLUMN "title" SET DEFAULT '';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'MANAGER';
