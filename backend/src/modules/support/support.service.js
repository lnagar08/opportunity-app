const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');
const { sendMail } = require('../../utils/mailer');

const CATEGORY_LABELS = {
  GENERAL_INQUIRY: 'General Inquiry',
  TECHNICAL_ISSUE: 'Technical Issue',
  REPORT_A_PROBLEM: 'Report a Problem',
};

// ---------------- USER (Seeker / Giver) ----------------

const submitSupportMessage = async (userId, { category, message }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { fullName: true, email: true, mobileNumber: true, role: true },
  });

  const supportMessage = await prisma.supportMessage.create({
    data: { userId, category, message },
  });

  // Fire-and-forget: emailing must never delay or fail the API response.
  // sendMail() already catches its own errors, so this is just belt-and-braces.
  notifySupportTeam(supportMessage, user).catch(() => {});
  if (user.email) {
    sendUserConfirmation(supportMessage, user).catch(() => {});
  }

  return supportMessage;
};

const notifySupportTeam = async (supportMessage, user) => {
  const supportTeamEmail = process.env.SUPPORT_TEAM_EMAIL;
  if (!supportTeamEmail) {
    console.warn('[support] SUPPORT_TEAM_EMAIL is not set — skipping support team notification email');
    return;
  }

  await sendMail({
    to: supportTeamEmail,
    subject: `[Support] New ${CATEGORY_LABELS[supportMessage.category]} — ${user.fullName}`,
    replyTo: user.email || undefined,
    html: `
      <p>A new Contact Support message was submitted.</p>
      <table cellpadding="6" style="border-collapse:collapse">
        <tr><td><strong>From</strong></td><td>${user.fullName} (${user.role})</td></tr>
        <tr><td><strong>Email</strong></td><td>${user.email || '—'}</td></tr>
        <tr><td><strong>Mobile</strong></td><td>${user.mobileNumber}</td></tr>
        <tr><td><strong>Category</strong></td><td>${CATEGORY_LABELS[supportMessage.category]}</td></tr>
        <tr><td valign="top"><strong>Message</strong></td><td>${escapeHtml(supportMessage.message).replace(/\n/g, '<br/>')}</td></tr>
      </table>
      <p>Ticket ID: ${supportMessage.id}</p>
    `,
  });
};

const sendUserConfirmation = async (supportMessage, user) => {
  await sendMail({
    to: user.email,
    subject: 'We received your message',
    html: `
      <p>Hi ${user.fullName},</p>
      <p>Thanks for reaching out. We've received your ${CATEGORY_LABELS[supportMessage.category]} request and our support team will get back to you shortly.</p>
      <p><strong>Your message:</strong><br/>${escapeHtml(supportMessage.message).replace(/\n/g, '<br/>')}</p>
      <p>Reference ID: ${supportMessage.id}</p>
    `,
  });
};

const escapeHtml = (str) =>
  str.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

const listMySupportMessages = async (userId, { page = 1, limit = 20 }) => {
  const where = { userId };
  const [items, total] = await Promise.all([
    prisma.supportMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
    }),
    prisma.supportMessage.count({ where }),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

// ---------------- ADMIN ----------------

const listSupportMessages = async ({ page = 1, limit = 20, status, category }) => {
  const where = { ...(status && { status }), ...(category && { category }) };

  const [items, total] = await Promise.all([
    prisma.supportMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: { user: { select: { id: true, fullName: true, role: true, mobileNumber: true, email: true } } },
    }),
    prisma.supportMessage.count({ where }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getSupportMessageDetails = async (id) => {
  const message = await prisma.supportMessage.findUnique({
    where: { id },
    include: { user: { select: { id: true, fullName: true, role: true, mobileNumber: true, email: true } } },
  });
  if (!message) throw new ApiError(404, 'Support message not found');
  return message;
};

const updateSupportMessageStatus = async (id, status) => {
  const message = await prisma.supportMessage.findUnique({ where: { id } });
  if (!message) throw new ApiError(404, 'Support message not found');
  return prisma.supportMessage.update({ where: { id }, data: { status } });
};

module.exports = {
  submitSupportMessage,
  listMySupportMessages,
  listSupportMessages,
  getSupportMessageDetails,
  updateSupportMessageStatus,
};
