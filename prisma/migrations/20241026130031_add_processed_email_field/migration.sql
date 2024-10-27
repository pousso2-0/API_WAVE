/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `AccountCreationRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AccountCreationRequest" ADD COLUMN     "email" TEXT,
ADD COLUMN     "processed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "AccountCreationRequest_email_key" ON "AccountCreationRequest"("email");
