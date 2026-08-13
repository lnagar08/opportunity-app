-- CreateTable
CREATE TABLE "opportunity_invites" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "invitedByAdminId" TEXT NOT NULL,
    "emailSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opportunity_invites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_invites_opportunityId_seekerId_key" ON "opportunity_invites"("opportunityId", "seekerId");

-- AddForeignKey
ALTER TABLE "opportunity_invites" ADD CONSTRAINT "opportunity_invites_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_invites" ADD CONSTRAINT "opportunity_invites_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_invites" ADD CONSTRAINT "opportunity_invites_invitedByAdminId_fkey" FOREIGN KEY ("invitedByAdminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
