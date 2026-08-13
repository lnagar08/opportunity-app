const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');
const { sendMail } = require('../../utils/mailer');
const { renderEmail, renderDetailsTable, escapeHtml } = require('../../utils/emailTemplates');

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

  const bodyHtml = `
    <p>A new Contact Support message was submitted and requires review.</p>
    ${renderDetailsTable([
      { label: 'Submitted By', value: `${user.fullName} (${user.role})` },
      { label: 'Email', value: user.email || '—' },
      { label: 'Mobile', value: user.mobileNumber },
      { label: 'Category', value: CATEGORY_LABELS[supportMessage.category] },
      { label: 'Ticket ID', value: supportMessage.id },
    ])}
    <p style="margin-top:16px; font-weight:600;">Message</p>
    <p style="margin:4px 0 0; padding:12px; background-color:#F9FAFB; border:1px solid #E5E7EB; border-radius:6px; white-space:pre-line;">${escapeHtml(supportMessage.message)}</p>
  `;

  await sendMail({
    to: supportTeamEmail,
    subject: `[Support] New ${CATEGORY_LABELS[supportMessage.category]} — ${user.fullName}`,
    replyTo: user.email || undefined,
    html: renderEmail({
      preheader: `New ${CATEGORY_LABELS[supportMessage.category]} ticket from ${user.fullName}`,
      title: 'New Support Ticket',
      bodyHtml,
    }),
  });
};

const sendUserConfirmation = async (supportMessage, user) => {
  const bodyHtml = `
    <p>Hi ${escapeHtml(user.fullName)},</p>
    <p>
      Thanks for reaching out. We've received your <strong>${CATEGORY_LABELS[supportMessage.category]}</strong>
      request and our support team will get back to you shortly.
    </p>
    ${renderDetailsTable([{ label: 'Reference ID', value: supportMessage.id }])}
    <p style="margin-top:16px; font-weight:600;">Your Message</p>
    <p style="margin:4px 0 0; padding:12px; background-color:#F9FAFB; border:1px solid #E5E7EB; border-radius:6px; white-space:pre-line;">${escapeHtml(supportMessage.message)}</p>
  `;

  await sendMail({
    to: user.email,
    subject: 'We received your message',
    html: renderEmail({
      preheader: 'We received your support request and will respond shortly.',
      title: 'We received your message',
      bodyHtml,
      footerNote: 'Keep this email for your records — you can reference the ID above in any follow-up.',
    }),
  });
};

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
