/*
  Warnings:

  - You are about to drop the `CheatSheet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SoftwareLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "CheatSheet";

-- DropTable
DROP TABLE "SoftwareLink";
