/*
  Warnings:

  - You are about to drop the `GoogleAuth` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GoogleAuth" DROP CONSTRAINT "GoogleAuth_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT;

-- DropTable
DROP TABLE "GoogleAuth";
