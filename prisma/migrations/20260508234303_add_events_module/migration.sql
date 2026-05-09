-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PLANNED', 'ONGOING', 'FINISHED', 'CANCELED');

-- CreateEnum
CREATE TYPE "TransactionKind" AS ENUM ('EXPENSE', 'INCOME');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'EVENT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'EVENT_EDITED';
ALTER TYPE "AuditAction" ADD VALUE 'EVENT_REMOVED';
ALTER TYPE "AuditAction" ADD VALUE 'EVENT_TRANSACTION_ADDED';
ALTER TYPE "AuditAction" ADD VALUE 'EVENT_TRANSACTION_REMOVED';

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PLANNED',
    "campaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventTransaction" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "kind" "TransactionKind" NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_campaignId_eventDate_idx" ON "Event"("campaignId", "eventDate");

-- CreateIndex
CREATE INDEX "EventTransaction_eventId_occurredAt_idx" ON "EventTransaction"("eventId", "occurredAt");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTransaction" ADD CONSTRAINT "EventTransaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
