const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');

// Report.reportedUserId is who the report is actually "about" — for a
// direct USER report that's the target itself; for OPPORTUNITY/MESSAGE
// reports it's derived from the owner (giver / sender), so Admins can
// still filter/suspend by person regardless of what was reported.
const resolveReportedUserId = async (targetType, targetId) => {
  if (targetType === 'USER') {
    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) throw new ApiError(404, 'Reported user not found');
    return user.id;
  }

  if (targetType === 'OPPORTUNITY') {
    const opportunity = await prisma.opportunity.findUnique({ where: { id: targetId } });
    if (!opportunity) throw new ApiError(404, 'Reported opportunity not found');
    return opportunity.giverId;
  }

  if (targetType === 'MESSAGE') {
    const message = await prisma.message.findUnique({ where: { id: targetId } });
    if (!message) throw new ApiError(404, 'Reported message not found');
    return message.senderId;
  }

  throw new ApiError(400, 'Invalid targetType');
};

const createReport = async (reportedById, { targetType, targetId, reason }) => {
  const reportedUserId = await resolveReportedUserId(targetType, targetId);

  if (reportedUserId === reportedById) {
    throw new ApiError(400, 'You cannot report yourself');
  }

  return prisma.report.create({
    data: { reportedById, targetType, targetId, reason, reportedUserId },
  });
};

const listMyReports = async (reportedById) => {
  return prisma.report.findMany({
    where: { reportedById },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = { createReport, listMyReports };