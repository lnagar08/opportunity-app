const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');

// Reporting an Opportunity is Seeker-only — Givers own their own
// opportunities, so there's no legitimate "report this opportunity" action
// on that side. An opportunity doesn't need to have been applied to be
// reportable (browsing is enough), so this checks the opportunity exists,
// not that an Application ties the two together.
const resolveOpportunityReport = async (reporterId, reporterRole, targetId) => {
  if (reporterRole !== 'SEEKER') {
    throw new ApiError(403, 'Only Opportunity Seekers can report an opportunity');
  }
  const opportunity = await prisma.opportunity.findUnique({ where: { id: targetId } });
  if (!opportunity || opportunity.status === 'DELETED') {
    throw new ApiError(404, 'Reported opportunity not found');
  }
  return opportunity.giverId;
};

// Reporting a Message requires the reporter to be the RECEIVING party of
// that specific message — you can't report your own message, and you
// can't report a message from a thread you're not part of.
const resolveMessageReport = async (reporterId, targetId) => {
  const message = await prisma.message.findUnique({
    where: { id: targetId },
    include: { conversation: true },
  });
  if (!message) throw new ApiError(404, 'Reported message not found');

  const { conversation } = message;
  const isParticipant = conversation.userAId === reporterId || conversation.userBId === reporterId;
  if (!isParticipant) {
    throw new ApiError(403, 'You do not have access to this message');
  }
  if (message.senderId === reporterId) {
    throw new ApiError(400, 'You cannot report your own message');
  }

  return message.senderId;
};

const resolveConversationReport = async (reporterId, targetId) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: targetId } });
  if (!conversation) throw new ApiError(404, 'Conversation not found');

  const isParticipant = conversation.userAId === reporterId || conversation.userBId === reporterId;
  if (!isParticipant) {
    throw new ApiError(403, 'You do not have access to this conversation');
  }

  return conversation.userAId === reporterId ? conversation.userBId : conversation.userAId;
};

const createReport = async (reporterId, reporterRole, { targetType, targetId, reason }) => {
  let reportedUserId;

  if (targetType === 'OPPORTUNITY') {
    reportedUserId = await resolveOpportunityReport(reporterId, reporterRole, targetId);
  } else if (targetType === 'CONVERSATION') {
    reportedUserId = await resolveConversationReport(reporterId, targetId);
  } else {
    throw new ApiError(400, 'Invalid targetType');
  }

  return prisma.report.create({
    data: { reportedById: reporterId, targetType, targetId, reason, reportedUserId },
  });
};

const listMyReports = async (reportedById) => {
  return prisma.report.findMany({
    where: { reportedById },
    orderBy: { createdAt: 'desc' },
  });
};

module.exports = { createReport, listMyReports };