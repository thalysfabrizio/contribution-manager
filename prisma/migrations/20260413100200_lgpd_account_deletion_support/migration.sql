-- DropForeignKey (existing FKs that need new cascade/setnull behavior)
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_ownerId_fkey";
ALTER TABLE "CampaignMember" DROP CONSTRAINT "CampaignMember_userId_fkey";
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_campaignId_fkey";

-- AlterTable: AuditLog.userId becomes nullable and gains actorEmailHash
ALTER TABLE "AuditLog" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "AuditLog" ADD COLUMN "actorEmailHash" TEXT;

-- Recreate foreign keys with LGPD-friendly cascade behavior
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CampaignMember" ADD CONSTRAINT "CampaignMember_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_campaignId_fkey"
  FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
