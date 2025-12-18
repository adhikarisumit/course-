-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isFrozen" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CheatSheet" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheatSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftwareLink" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoftwareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheatSheet_category_idx" ON "CheatSheet"("category");

-- CreateIndex
CREATE INDEX "CheatSheet_isActive_idx" ON "CheatSheet"("isActive");

-- CreateIndex
CREATE INDEX "SoftwareLink_category_idx" ON "SoftwareLink"("category");

-- CreateIndex
CREATE INDEX "SoftwareLink_isActive_idx" ON "SoftwareLink"("isActive");
