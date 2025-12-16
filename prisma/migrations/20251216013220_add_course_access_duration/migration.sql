-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "videoUrl" TEXT,
    "price" REAL NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "level" TEXT,
    "duration" TEXT,
    "accessDurationMonths" INTEGER NOT NULL DEFAULT 6,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Course" ("category", "createdAt", "description", "duration", "id", "image", "isPaid", "isPublished", "level", "price", "title", "updatedAt", "videoUrl") SELECT "category", "createdAt", "description", "duration", "id", "image", "isPaid", "isPublished", "level", "price", "title", "updatedAt", "videoUrl" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
