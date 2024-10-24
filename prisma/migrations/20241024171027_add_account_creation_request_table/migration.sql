-- CreateEnum
CREATE TYPE "AccountRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "AccountCreationRequest" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "idCardFrontPhoto" TEXT NOT NULL,
    "idCardBackPhoto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "AccountRequestStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "AccountCreationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountCreationRequest_phoneNumber_key" ON "AccountCreationRequest"("phoneNumber");

-- CreateIndex
CREATE INDEX "AccountCreationRequest_phoneNumber_idx" ON "AccountCreationRequest"("phoneNumber");
