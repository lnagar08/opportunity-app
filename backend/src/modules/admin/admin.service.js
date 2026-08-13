const bcrypt = require('bcrypt');
const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');
const { notifyApplicantsOfClosure } = require('../../utils/notifications');
const { sendMail } = require('../../utils/mailer');
const { renderEmail, renderDetailsTable, escapeHtml } = require('../../utils/emailTemplates');

const SALT_ROUNDS = 10;

// ---------------- DASHBOARD ----------------

const getDashboardStats = async () => {
  const [
    totalSeekers, totalGivers, activeOpportunities, totalApplications,
    pendingCertificates, pendingReports, suspendedUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'SEEKER' } }),
    prisma.user.count({ where: { role: 'GIVER' } }),
    prisma.opportunity.count({ where: { status: 'ACTIVE' } }),
    prisma.application.count(),
    prisma.seekerProfile.count({ where: { certificateStatus: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { status: 'SUSPENDED' } }),
  ]);

  return {
    totalSeekers, totalGivers, activeOpportunities, totalApplications,
    pendingCertificates, pendingReports, suspendedUsers,
  };
};

// ---------------- USER MANAGEMENT (SEEKER / GIVER) ----------------

const listUsers = async (role, { page = 1, limit = 20, search, status, certificateStatus }) => {
  const where = { role };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { mobileNumber: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role === 'SEEKER' && certificateStatus) {
    where.seekerProfile = { certificateStatus };
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: role === 'SEEKER'
        ? { seekerProfile: { include: { disabilityType: true } } }
        : { giverProfile: true, _count: { select: { opportunities: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getUserDetails = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      seekerProfile: {
        include: {
          disabilityType: true, education: true, experience: true,
          skills: true, awards: true, certifications: true, portfolioItems: true,
        },
      },
      giverProfile: true,
      opportunities: { select: { id: true, title: true, status: true, createdAt: true } },
      applications: { select: { id: true, status: true, appliedAt: true } },
    },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateUserStatus = async (userId, status) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found');

  const updated = await prisma.user.update({ where: { id: userId }, data: { status } });

  await prisma.notification.create({
    data: {
      userId,
      type: 'GENERAL',
      title: 'Account Status Updated',
      body: `Your account status has been changed to ${status}`,
      data: { status },
    },
  });

  return updated;
};

const reviewCertificate = async (userId, certificateStatus, rejectReason) => {
  const profile = await prisma.seekerProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, 'Seeker profile not found');

  const updated = await prisma.seekerProfile.update({
    where: { userId },
    data: {
      certificateStatus,
      certificateRejectReason: certificateStatus === 'REJECTED' ? rejectReason : null,
    },
  });

  await prisma.notification.create({
    data: {
      userId,
      type: certificateStatus === 'APPROVED' ? 'CERTIFICATE_APPROVED' : 'CERTIFICATE_REJECTED',
      title: certificateStatus === 'APPROVED' ? 'Certificate Approved' : 'Certificate Rejected',
      body: certificateStatus === 'APPROVED'
        ? 'Your Disability Certificate has been approved.'
        : `Your Disability Certificate was rejected: ${rejectReason}`,
      data: { certificateStatus },
    },
  });

  return updated;
};

// ---------------- OPPORTUNITY MODERATION ----------------

const listAllOpportunities = async ({ page = 1, limit = 20, status, search }) => {
  const where = {status: { not: 'DELETED' }};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: {
        giver: { select: { id: true, fullName: true, mobileNumber: true } },
        _count: { select: { applications: true } },
      },
    }),
    prisma.opportunity.count({ where }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getOpportunityDetails = async (opportunityId) => {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      giver: { select: { id: true, fullName: true, mobileNumber: true, email: true } },
      categories: { include: { category: true } },
      media: true,
      _count: { select: { applications: true } },
    },
  });
  if (!opportunity) throw new ApiError(404, 'Opportunity not found');
  return opportunity;
};

const closeOpportunity = async (opportunityId) => {
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) throw new ApiError(404, 'Opportunity not found');
  const updated = await prisma.opportunity.update({ where: { id: opportunityId }, data: { status: 'CLOSED' } });
  await notifyApplicantsOfClosure(opportunityId); 
  return updated;
};

const deleteOpportunity = async (opportunityId) => {
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) throw new ApiError(404, 'Opportunity not found');
  return prisma.opportunity.update({ where: { id: opportunityId }, data: { status: 'DELETED' } });
};

// ---------------- MASTER DATA: DISABILITY TYPES ----------------

const listDisabilityTypes = async () => prisma.disabilityType.findMany({ orderBy: { name: 'asc' } });

const createDisabilityType = async (payload) => {
  const existing = await prisma.disabilityType.findUnique({ where: { name: payload.name } });
  if (existing) throw new ApiError(409, 'Disability Type with this name already exists');
  return prisma.disabilityType.create({ data: { name: payload.name, isActive: payload.isActive ?? true } });
};

const updateDisabilityType = async (id, payload) => {
  const existing = await prisma.disabilityType.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Disability Type not found');
  return prisma.disabilityType.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
    },
  });
};

const deleteDisabilityType = async (id) => {
  const existing = await prisma.disabilityType.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Disability Type not found');
  return prisma.disabilityType.update({ where: { id }, data: { isActive: false } });
};

// ---------------- MASTER DATA: CATEGORIES ----------------

const listCategories = async () => prisma.category.findMany({ orderBy: { name: 'asc' } });

const createCategory = async (payload) => {
  const existing = await prisma.category.findUnique({ where: { name: payload.name } });
  if (existing) throw new ApiError(409, 'Category with this name already exists');
  return prisma.category.create({ data: { name: payload.name, isActive: payload.isActive ?? true } });
};

const updateCategory = async (id, payload) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Category not found');
  return prisma.category.update({
    where: { id },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
    },
  });
};

const deleteCategory = async (id) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Category not found');
  return prisma.category.update({ where: { id }, data: { isActive: false } });
};

// ---------------- ADMIN MANAGEMENT (SUPER ADMIN) ----------------

const listAdmins = async () => prisma.admin.findMany({
  select: { id: true, fullName: true, email: true, isSuperAdmin: true, createdAt: true },
  orderBy: { createdAt: 'desc' },
});

const createAdmin = async (payload) => {
  const existing = await prisma.admin.findUnique({ where: { email: payload.email } });
  if (existing) throw new ApiError(409, 'An Admin with this Email already exists');

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const admin = await prisma.admin.create({
    data: {
      fullName: payload.fullName,
      email: payload.email,
      passwordHash,
      isSuperAdmin: payload.isSuperAdmin === true || payload.isSuperAdmin === 'true',
    },
  });
  return admin;
};

// Reports — target resolution + suspend-in-one-call

// NEW helper
const resolveReportTarget = async (targetType, targetId) => {
  if (targetType === 'USER') {
    return prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, fullName: true, role: true, status: true },
    });
  }
  if (targetType === 'OPPORTUNITY') {
    return prisma.opportunity.findUnique({
      where: { id: targetId },
      select: { id: true, title: true, description: true, status: true, giverId: true },
    });
  }
  if (targetType === 'MESSAGE') {
    return prisma.message.findUnique({
      where: { id: targetId },
      select: { id: true, text: true, senderId: true, conversationId: true, createdAt: true },
    });
  }
  return null;
};

// ---------------- REPORTS & MODERATION ----------------

const listReports = async ({ page = 1, limit = 20, status, targetType }) => {
  const where = { ...(status && { status }), ...(targetType && { targetType }) };

  const [rawItems, total] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: {
        reportedBy: { select: { id: true, fullName: true, role: true } },
        reportedUser: { select: { id: true, fullName: true, role: true } },
      },
    }),
    prisma.report.count({ where }),
  ]);

  // NEW — resolve each report's actual target content
  const items = await Promise.all(
    rawItems.map(async (report) => ({
      ...report,
      target: await resolveReportTarget(report.targetType, report.targetId),
    }))
  );

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getReportDetails = async (reportId) => {
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reportedBy: { select: { id: true, fullName: true, role: true, mobileNumber: true } },
      reportedUser: { select: { id: true, fullName: true, role: true, mobileNumber: true } },
    },
  });
  if (!report) throw new ApiError(404, 'Report not found');

  const target = await resolveReportTarget(report.targetType, report.targetId); // NEW
  return { ...report, target }; // NEW
};

const updateReportStatus = async (reportId, status, adminNote, suspendReportedUser) => {
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new ApiError(404, 'Report not found');

  await prisma.report.update({
    where: { id: reportId },
    data: { status, ...(adminNote !== undefined && { adminNote }) },
  });

  if (suspendReportedUser) {
    if (!report.reportedUserId) {
      throw new ApiError(400, 'This report has no associated user to suspend');
    }
    await prisma.user.update({ where: { id: report.reportedUserId }, data: { status: 'SUSPENDED' } });
    await prisma.notification.create({
      data: {
        userId: report.reportedUserId,
        type: 'GENERAL',
        title: 'Account Suspended',
        body: 'Your account has been suspended following a review of a reported issue.',
        data: { reportId },
      },
    });
  }

  // Return the same full shape as getReportDetails/listReports, not the
  // bare row prisma.report.update() gives back.
  return getReportDetails(reportId);
};


// ---------------- OPPORTUNITY INVITES (manual email invite) ----------------
 
// Eligible = approved-certificate, active Seekers who haven't already
// applied to this opportunity (an invite is redundant once they've
// already applied). `alreadyInvited` is surfaced per-row so the Admin UI
// can grey out / relabel the button instead of allowing silent re-sends.
const listInviteCandidates = async (opportunityId, { page = 1, limit = 20, search }) => {
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity) throw new ApiError(404, 'Opportunity not found');
 
  const where = {
    role: 'SEEKER',
    status: 'ACTIVE',
    seekerProfile: { certificateStatus: 'APPROVED' },
    applications: { none: { opportunityId } },
    ...(search && {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }),
  };
 
  const [users, total, invited] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      select: {
        id: true, fullName: true, email: true, city: true, state: true, profilePhotoUrl: true,
        seekerProfile: { select: { bio: true, disabilityType: { select: { name: true } } } },
      },
    }),
    prisma.user.count({ where }),
    prisma.opportunityInvite.findMany({ where: { opportunityId }, select: { seekerId: true } }),
  ]);
 
  const invitedIds = new Set(invited.map((i) => i.seekerId));
  const items = users.map((u) => ({ ...u, alreadyInvited: invitedIds.has(u.id) }));
 
  return { items, total, page: Number(page), limit: Number(limit) };
};

// Builds the invite email body — structured, technical presentation of
// the opportunity (not just a truncated description dump) so the seeker
// can gauge fit before opening the app: work mode, budget, location, and
// categories laid out as labeled fields via renderDetailsTable.
const buildInviteEmailHtml = (opportunity, seeker) => {
  const budgetDisplay =
    opportunity.budgetType === 'FIXED' && opportunity.budgetAmount
      ? `₹${opportunity.budgetAmount} (Fixed)`
      : 'Negotiable';
 
  const locationDisplay = opportunity.city
    ? `${opportunity.city}${opportunity.state ? `, ${opportunity.state}` : ''}`
    : null;
 
  const categoryDisplay = opportunity.categories?.map((c) => c.category.name).join(', ') || null;
 
  const descriptionSnippet =
    opportunity.description.length > 400
      ? `${opportunity.description.slice(0, 400)}…`
      : opportunity.description;
 
  const opportunityUrl = `${(process.env.PUBLIC_APP_URL || '').replace(/\/+$/, '')}/opportunities/${opportunity.id}`;
 
  const bodyHtml = `
    <p>Hi ${escapeHtml(seeker.fullName)},</p>
    <p>
      Based on your profile, our team identified the following opportunity as a potential match.
      We encourage you to review the details below and apply directly through the app.
    </p>
 
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; margin-top:20px;">
      <tr>
        <td style="padding:16px; background-color:#F9FAFB; border:1px solid #E5E7EB; border-radius:6px;">
          <p style="margin:0 0 8px; font-size:16px; font-weight:600; color:#1F2937;">
            ${escapeHtml(opportunity.title)}
          </p>
          <p style="margin:0; font-size:13px; line-height:20px; color:#374151;">
            ${escapeHtml(descriptionSnippet)}
          </p>
          ${renderDetailsTable([
            { label: 'Work Mode', value: opportunity.workMode },
            { label: 'Budget', value: budgetDisplay },
            { label: 'Location', value: locationDisplay },
            { label: 'Category', value: categoryDisplay },
            { label: 'Opportunity ID', value: opportunity.id },
          ])}
        </td>
      </tr>
    </table>
 
    <p style="margin-top:20px;">
      If you're interested, open the Opportunity App and navigate to this listing to submit your application.
      Applications are reviewed directly by the Opportunity Giver.
    </p>
  `;
 
  return renderEmail({
    preheader: `You've been invited to apply for ${opportunity.title}`,
    title: 'You have a new opportunity invitation',
    bodyHtml,
    cta: opportunityUrl ? { label: 'View Opportunity', url: opportunityUrl } : undefined,
    footerNote: 'This invitation was sent by an administrator based on your profile eligibility.',
  });
};

const inviteSeekerToOpportunity = async (opportunityId, seekerId, adminId) => {
  const [opportunity, seeker] = await Promise.all([
    prisma.opportunity.findUnique({ where: { id: opportunityId } }),
    prisma.user.findUnique({ where: { id: seekerId } }),
  ]);
  if (!opportunity) throw new ApiError(404, 'Opportunity not found');
  if (!seeker || seeker.role !== 'SEEKER') throw new ApiError(404, 'Seeker not found');
  if (!seeker.email) throw new ApiError(400, 'This seeker has no email on file to invite');
 
  await sendMail({
    to: seeker.email,
    subject: `Opportunity Invitation: ${opportunity.title}`,
    html: buildInviteEmailHtml(opportunity, seeker),
  });
  
  const invite = await prisma.opportunityInvite.upsert({
    where: { opportunityId_seekerId: { opportunityId, seekerId } },
    update: { invitedByAdminId: adminId, emailSentAt: new Date() }, // allows a deliberate re-send
    create: { opportunityId, seekerId, invitedByAdminId: adminId },
  });
 
  await prisma.notification.create({
    data: {
      userId: seekerId,
      type: 'GENERAL',
      title: 'You have an invite',
      body: `You've been invited to apply for "${opportunity.title}".`,
      data: { opportunityId },
    },
  });
 
  return invite;
};

module.exports = {
  getDashboardStats,
  listUsers,
  getUserDetails,
  updateUserStatus,
  reviewCertificate,
  listAllOpportunities,
  getOpportunityDetails,
  closeOpportunity,
  deleteOpportunity,
  listDisabilityTypes, createDisabilityType, updateDisabilityType, deleteDisabilityType,
  listCategories, createCategory, updateCategory, deleteCategory,
  listReports, getReportDetails, updateReportStatus,
  listAdmins, createAdmin,
  listInviteCandidates, inviteSeekerToOpportunity,
};
