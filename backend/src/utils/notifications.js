const prisma = require('../config/db');

// Screen 26 lists "Opportunity Closed" as a notification type — fires
// whenever an opportunity transitions to CLOSED, whether the Giver closed
// it themselves or an Admin closed it during moderation. Only applicants
// still in an active-ish state (PENDING/SHORTLISTED) are notified —
// someone already REJECTED/WITHDRAWN doesn't need a "this closed" ping,
// and ACCEPTED applicants presumably already know via the Giver directly.
const notifyApplicantsOfClosure = async (opportunityId) => {
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) return;

  const applications = await prisma.application.findMany({
    where: { opportunityId, status: { in: ['PENDING', 'SHORTLISTED'] } },
    select: { seekerId: true },
  });

  if (applications.length === 0) return;

  await prisma.notification.createMany({
    data: applications.map(({ seekerId }) => ({
      userId: seekerId,
      type: 'OPPORTUNITY_CLOSED',
      title: 'Opportunity Closed',
      body: `"${opportunity.title}" has been closed and is no longer accepting applications.`,
      data: { opportunityId },
    })),
  });
};

module.exports = { notifyApplicantsOfClosure };