-- CreateTable
CREATE TABLE "PromoBanner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "badgeText" TEXT,
    "linkUrl" TEXT,
    "linkText" TEXT,
    "backgroundColor" TEXT DEFAULT '#ef4444',
    "textColor" TEXT DEFAULT '#ffffff',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoBanner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PromoBanner_isActive_idx" ON "PromoBanner"("isActive");

-- CreateIndex
CREATE INDEX "PromoBanner_startDate_endDate_idx" ON "PromoBanner"("startDate", "endDate");
