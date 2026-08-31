const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');
const { notifyApplicantsOfClosure } = require('../../utils/notifications');

// ---------------- PROFILE ----------------

const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { giverProfile: true },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

const updateMyProfile = async (userId, payload, profilePhotoUrl) => {
  const { fullName, email, city, state, organizationName } = payload;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(city && { city }),
      ...(state && { state }),
      ...(profilePhotoUrl && { profilePhotoUrl }),
      giverProfile: {
        update: {
          ...(organizationName !== undefined && { organizationName }),
        },
      },
    },
    include: { giverProfile: true },
  });

  return user;
};

// ---------------- DASHBOARD ----------------

const getDashboard = async (giverId) => {
  const [activeOpportunities, recentApplications] = await Promise.all([
    prisma.opportunity.findMany({
      where: { giverId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.application.findMany({
      where: { opportunity: { giverId } },
      orderBy: { appliedAt: 'desc' },
      take: 10,
      include: {
        opportunity: { select: { id: true, title: true } },
        seeker: { select: { id: true, fullName: true, profilePhotoUrl: true } },
      },
    }),
  ]);

  return { activeOpportunities, recentApplications };
};

// ---------------- OPPORTUNITIES ----------------

const ensureOpportunityOwnership = async (opportunityId, giverId) => {
  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity || opportunity.status === 'DELETED') {
    throw new ApiError(404, 'Opportunity not found');
  }
  if (opportunity.giverId !== giverId) {
    throw new ApiError(403, 'You do not have permission to access this opportunity');
  }
  return opportunity;
};

const createOpportunity = async (giverId, payload, mediaFiles = []) => {
  const {
    title, description, categoryIds, budgetType, budgetAmount,
    workMode, city, state, latitude, longitude, opportunityDate, opportunityTime,
  } = payload;

  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  if (categories.length !== categoryIds.length) {
    throw new ApiError(400, 'One or more Category IDs are invalid');
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      giverId,
      title,
      description,
      budgetType,
      budgetAmount: budgetType === 'FIXED' ? budgetAmount : null,
      workMode,
      city: city || null,
      state: state || null,
      latitude: parseFloat(latitude)?? null,
      longitude: parseFloat(longitude) ?? null,
      opportunityDate: opportunityDate ? new Date(opportunityDate) : null,
      opportunityTime: opportunityTime || null,
      status: 'ACTIVE',
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
      media: {
        create: mediaFiles.map((file) => ({
          ownerType: 'OPPORTUNITY',
          type: file.type,
          url: file.url,
          fileName: file.fileName,
          sizeBytes: file.sizeBytes,
        })),
      },
    },
    include: { categories: { include: { category: true } }, media: true },
  });

  return opportunity;
};

const updateOpportunity = async (giverId, opportunityId, payload, mediaFiles = []) => {
  await ensureOpportunityOwnership(opportunityId, giverId);

  const {
    title, description, categoryIds, budgetType, budgetAmount,
    workMode, city, state, latitude, longitude, opportunityDate, opportunityTime,
  } = payload;

  if (categoryIds) {
    const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
    if (categories.length !== categoryIds.length) {
      throw new ApiError(400, 'One or more Category IDs are invalid');
    }
    await prisma.opportunityCategory.deleteMany({ where: { opportunityId } });
  }

  const updated = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(budgetType && { budgetType }),
      ...(budgetAmount !== undefined && { budgetAmount }),
      ...(workMode && { workMode }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(opportunityDate && { opportunityDate: new Date(opportunityDate) }),
      ...(opportunityTime && { opportunityTime }),
      ...(categoryIds && {
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      }),
      // Additive, matching create semantics — new files are appended to
      // the existing gallery, not a wholesale replace. Removing a specific
      // item is a separate call (see removeOpportunityMedia below), since
      // a single multipart PUT can't express "keep these, drop those, add
      // these" without a much messier payload contract.
      ...(mediaFiles.length > 0 && {
        media: {
          create: mediaFiles.map((file) => ({
            ownerType: 'OPPORTUNITY',
            type: file.type,
            url: file.url,
            fileName: file.fileName,
            sizeBytes: file.sizeBytes,
          })),
        },
      }),
    },
    include: { categories: { include: { category: true } }, media: true },
  });

  return updated;
};

const removeOpportunityMedia = async (giverId, opportunityId, mediaId) => {
  await ensureOpportunityOwnership(opportunityId, giverId);

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media || media.opportunityId !== opportunityId) {
    throw new ApiError(404, 'Media item not found on this opportunity');
  }

  await prisma.media.delete({ where: { id: mediaId } });
  return { id: mediaId };
};

const listMyOpportunities = async (giverId, { page = 1, limit = 20, status }) => {
  const where = { giverId, ...(status ? { status } : { status: { not: 'DELETED' } }) };

  const [items, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: {
        _count: { select: { applications: true } },
      },
    }),
    prisma.opportunity.count({ where }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getOpportunityDetails = async (giverId, opportunityId) => {
  await ensureOpportunityOwnership(opportunityId, giverId);

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      categories: { include: { category: true } },
      media: true,
      _count: { select: { applications: true } },
    },
  });

  return opportunity;
};

const closeOpportunity = async (giverId, opportunityId) => {
  await ensureOpportunityOwnership(opportunityId, giverId);
  const opportunity = await prisma.opportunity.update({
    where: { id: opportunityId },
    data: { status: 'CLOSED' },
  });
  await notifyApplicantsOfClosure(opportunityId);
  return opportunity;
};

const deleteOpportunity = async (giverId, opportunityId) => {
  await ensureOpportunityOwnership(opportunityId, giverId);
  return prisma.opportunity.update({
    where: { id: opportunityId },
    data: { status: 'DELETED' },
  });
};

// ---------------- APPLICATIONS RECEIVED ----------------

const listApplicationsForOpportunity = async (giverId, opportunityId, { page = 1, limit = 20 }) => {
  await ensureOpportunityOwnership(opportunityId, giverId);

  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where: { opportunityId },
      orderBy: { appliedAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: {
        seeker: { select: { id: true, fullName: true, profilePhotoUrl: true } },
        seekerProfile: {
          include: { skills: true, experience: true },
        },
      },
    }),
    prisma.application.count({ where: { opportunityId } }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getApplicantProfile = async (giverId, applicationId) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      opportunity: true,
      seeker: { select: { id: true, fullName: true, profilePhotoUrl: true, city: true, state: true } },
      seekerProfile: {
        include: {
          education: true,
          experience: true,
          skills: true,
          awards: true,
          certifications: true,
          portfolioItems: { include: { media: true } },
        },
      },
      media: true,
    },
  });

  if (!application) throw new ApiError(404, 'Application not found');
  if (application.opportunity.giverId !== giverId) {
    throw new ApiError(403, 'You do not have permission to view this application');
  }

  return application;
};

const updateApplicationStatus = async (giverId, applicationId, status) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { opportunity: true },
  });
  if (!application) throw new ApiError(404, 'Application not found');
  if (application.opportunity.giverId !== giverId) {
    throw new ApiError(403, 'You do not have permission to update this application');
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  await prisma.notification.create({
    data: {
      userId: application.seekerId,
      type: 'APPLICATION_STATUS_CHANGED',
      title: 'Application Status Updated',
      body: `Your application status changed to ${status}`,
      data: { applicationId, status },
    },
  });

  return updated;
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getDashboard,
  createOpportunity,
  updateOpportunity,
  removeOpportunityMedia,
  listMyOpportunities,
  getOpportunityDetails,
  closeOpportunity,
  deleteOpportunity,
  listApplicationsForOpportunity,
  getApplicantProfile,
  updateApplicationStatus,
};
