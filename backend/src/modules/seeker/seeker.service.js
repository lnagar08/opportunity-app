const { Prisma } = require('@prisma/client');
const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');

// ---------------- PROFILE ----------------

const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      seekerProfile: {
        include: {
          disabilityType: true,
          education: true,
          experience: true,
          skills: true,
          awards: true,
          certifications: true,
          portfolioItems: { include: { media: true } },
        },
      },
    },
  });
  if (!user) throw new ApiError(404, 'User not found');

  return { ...user, profileCompletionPercentage: computeProfileCompletionPercentage(user) };
};

// Screen 17 (My Profile) leads with "Profile Completion" as a display
// item — isProfileCompleted alone is a binary flag set once by the
// Complete Profile action and never revisited, so it can't reflect how
// filled-out the profile actually is afterward (e.g. someone who
// completed the mandatory minimum but never added Education/Skills/etc).
// This computes a live 0-100 score across mandatory + optional sections
// each time the profile is fetched, purely for display — it never
// gates anything (isProfileCompleted still does that).
const PROFILE_COMPLETION_WEIGHTS = {
  photo: 15,
  bio: 15,
  education: 12,
  experience: 12,
  skills: 12,
  awards: 8,
  certifications: 8,
  portfolio: 8,
  certificateApproved: 10,
};

const computeProfileCompletionPercentage = (user) => {
  const profile = user.seekerProfile;
  if (!profile) return 0;

  let score = 0;
  if (user.profilePhotoUrl) score += PROFILE_COMPLETION_WEIGHTS.photo;
  if (profile.bio) score += PROFILE_COMPLETION_WEIGHTS.bio;
  if (profile.education?.length) score += PROFILE_COMPLETION_WEIGHTS.education;
  if (profile.experience?.length) score += PROFILE_COMPLETION_WEIGHTS.experience;
  if (profile.skills?.length) score += PROFILE_COMPLETION_WEIGHTS.skills;
  if (profile.awards?.length) score += PROFILE_COMPLETION_WEIGHTS.awards;
  if (profile.certifications?.length) score += PROFILE_COMPLETION_WEIGHTS.certifications;
  if (profile.portfolioItems?.length) score += PROFILE_COMPLETION_WEIGHTS.portfolio;
  if (profile.certificateStatus === 'APPROVED') score += PROFILE_COMPLETION_WEIGHTS.certificateApproved;

  return Math.min(100, score);
};

const getSeekerProfileId = async (userId) => {
  const profile = await prisma.seekerProfile.findUnique({ where: { userId } });
  if (!profile) throw new ApiError(404, 'Seeker profile not found');
  return profile.id;
};

const updateMyProfile = async (userId, payload, profilePhotoUrl) => {
  const { fullName, city, state, bio, availableForRemote, willingToTravel } = payload;

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(fullName && { fullName }),
      ...(city && { city }),
      ...(state && { state }),
      ...(profilePhotoUrl && { profilePhotoUrl }),
      seekerProfile: {
        update: {
          ...(bio !== undefined && { bio }),
          ...(availableForRemote !== undefined && {
            availableForRemote: availableForRemote === true || availableForRemote === 'true',
          }),
          ...(willingToTravel !== undefined && {
            willingToTravel: willingToTravel === true || willingToTravel === 'true',
          }),
        },
      },
    },
    include: { seekerProfile: true },
  });

  return user;
};

// "Complete Profile" action (Screen 8) - marks isProfileCompleted true once mandatory fields exist
const completeProfile = async (userId, payload, profilePhotoUrl) => {
  const { bio, availableForRemote, willingToTravel } = payload;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { seekerProfile: true },
  });
  if (!existing || !existing.seekerProfile) throw new ApiError(404, 'Seeker profile not found');

  const finalPhoto = profilePhotoUrl || existing.profilePhotoUrl;
  if (!finalPhoto) {
    throw new ApiError(422, 'Profile Photo is required to complete your profile');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(profilePhotoUrl && { profilePhotoUrl }),
      seekerProfile: {
        update: {
          bio,
          availableForRemote: availableForRemote === true || availableForRemote === 'true',
          willingToTravel: willingToTravel === true || willingToTravel === 'true',
          isProfileCompleted: true,
        },
      },
    },
    include: { seekerProfile: true },
  });

  return user;
};

// ---------------- EDUCATION ----------------

const addEducation = async (userId, payload) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  return prisma.education.create({ data: { seekerProfileId, ...normalizeYears(payload) } });
};

const normalizeYears = (payload) => ({
  ...payload,
  startYear: payload.startYear !== undefined ? Number(payload.startYear) : undefined,
  endYear: payload.endYear !== undefined && payload.endYear !== '' ? Number(payload.endYear) : null,
  currentlyStudying: payload.currentlyStudying === true || payload.currentlyStudying === 'true',
});

const ensureOwnedEducation = async (userId, id) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  const record = await prisma.education.findUnique({ where: { id } });
  if (!record || record.seekerProfileId !== seekerProfileId) {
    throw new ApiError(404, 'Education record not found');
  }
  return record;
};

const updateEducation = async (userId, id, payload) => {
  await ensureOwnedEducation(userId, id);
  return prisma.education.update({ where: { id }, data: normalizeYears(payload) });
};

const deleteEducation = async (userId, id) => {
  await ensureOwnedEducation(userId, id);
  return prisma.education.delete({ where: { id } });
};

// ---------------- EXPERIENCE ----------------

const normalizeExperience = (payload) => ({
  ...payload,
  startDate: payload.startDate ? new Date(payload.startDate) : undefined,
  endDate: payload.endDate ? new Date(payload.endDate) : null,
  currentlyWorking: payload.currentlyWorking === true || payload.currentlyWorking === 'true',
  fresher: payload.fresher === true || payload.fresher === 'true',
});

const addExperience = async (userId, payload) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  return prisma.experience.create({ data: { seekerProfileId, ...normalizeExperience(payload) } });
};

const ensureOwnedExperience = async (userId, id) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  const record = await prisma.experience.findUnique({ where: { id } });
  if (!record || record.seekerProfileId !== seekerProfileId) {
    throw new ApiError(404, 'Experience record not found');
  }
  return record;
};

const updateExperience = async (userId, id, payload) => {
  await ensureOwnedExperience(userId, id);
  return prisma.experience.update({ where: { id }, data: normalizeExperience(payload) });
};

const deleteExperience = async (userId, id) => {
  await ensureOwnedExperience(userId, id);
  return prisma.experience.delete({ where: { id } });
};

// ---------------- SKILLS ----------------

const addSkill = async (userId, payload) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  return prisma.seekerSkill.create({ data: { seekerProfileId, skillName: payload.skillName } });
};

const ensureOwnedSkill = async (userId, id) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  const record = await prisma.seekerSkill.findUnique({ where: { id } });
  if (!record || record.seekerProfileId !== seekerProfileId) {
    throw new ApiError(404, 'Skill record not found');
  }
  return record;
};

const updateSkill = async (userId, id, payload) => {
  await ensureOwnedSkill(userId, id);
  return prisma.seekerSkill.update({ where: { id }, data: { skillName: payload.skillName } });
};

const deleteSkill = async (userId, id) => {
  await ensureOwnedSkill(userId, id);
  return prisma.seekerSkill.delete({ where: { id } });
};

// ---------------- AWARDS ----------------

const addAward = async (userId, payload) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  return prisma.award.create({
    data: { seekerProfileId, awardName: payload.awardName, organization: payload.organization || null, year: Number(payload.year) },
  });
};

const ensureOwnedAward = async (userId, id) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  const record = await prisma.award.findUnique({ where: { id } });
  if (!record || record.seekerProfileId !== seekerProfileId) {
    throw new ApiError(404, 'Award record not found');
  }
  return record;
};

const updateAward = async (userId, id, payload) => {
  await ensureOwnedAward(userId, id);
  return prisma.award.update({
    where: { id },
    data: {
      ...(payload.awardName && { awardName: payload.awardName }),
      ...(payload.organization !== undefined && { organization: payload.organization }),
      ...(payload.year !== undefined && { year: Number(payload.year) }),
    },
  });
};

const deleteAward = async (userId, id) => {
  await ensureOwnedAward(userId, id);
  return prisma.award.delete({ where: { id } });
};

// ---------------- CERTIFICATIONS ----------------

const addCertification = async (userId, payload) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  return prisma.certification.create({
    data: {
      seekerProfileId,
      certificationName: payload.certificationName,
      issuedBy: payload.issuedBy || null,
      date: new Date(payload.date),
    },
  });
};

const ensureOwnedCertification = async (userId, id) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  const record = await prisma.certification.findUnique({ where: { id } });
  if (!record || record.seekerProfileId !== seekerProfileId) {
    throw new ApiError(404, 'Certification record not found');
  }
  return record;
};

const updateCertification = async (userId, id, payload) => {
  await ensureOwnedCertification(userId, id);
  return prisma.certification.update({
    where: { id },
    data: {
      ...(payload.certificationName && { certificationName: payload.certificationName }),
      ...(payload.issuedBy !== undefined && { issuedBy: payload.issuedBy }),
      ...(payload.date && { date: new Date(payload.date) }),
    },
  });
};

const deleteCertification = async (userId, id) => {
  await ensureOwnedCertification(userId, id);
  return prisma.certification.delete({ where: { id } });
};

// ---------------- PORTFOLIO ----------------

const addPortfolio = async (userId, payload, mediaFiles = []) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  return prisma.portfolio.create({
    data: {
      seekerProfileId,
      title: payload.title,
      description: payload.description || null,
      media: {
        create: mediaFiles.map((file) => ({
          ownerType: 'PORTFOLIO',
          type: file.type,
          url: file.url,
          fileName: file.fileName,
          sizeBytes: file.sizeBytes,
        })),
      },
    },
    include: { media: true },
  });
};

const ensureOwnedPortfolio = async (userId, id) => {
  const seekerProfileId = await getSeekerProfileId(userId);
  const record = await prisma.portfolio.findUnique({ where: { id } });
  if (!record || record.seekerProfileId !== seekerProfileId) {
    throw new ApiError(404, 'Portfolio item not found');
  }
  return record;
};

const updatePortfolio = async (userId, id, payload, mediaFiles = []) => {
  await ensureOwnedPortfolio(userId, id);
  return prisma.portfolio.update({
    where: { id },
    data: {
      ...(payload.title && { title: payload.title }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(mediaFiles.length > 0 && {
        media: {
          create: mediaFiles.map((file) => ({
            ownerType: 'PORTFOLIO',
            type: file.type,
            url: file.url,
            fileName: file.fileName,
            sizeBytes: file.sizeBytes,
          })),
        },
      }),
    },
    include: { media: true },
  });
};

const deletePortfolio = async (userId, id) => {
  await ensureOwnedPortfolio(userId, id);
  return prisma.portfolio.delete({ where: { id } });
};

const deletePortfolioMedia = async (userId, portfolioId, mediaId) => {
  await ensureOwnedPortfolio(userId, portfolioId);

  const media = await prisma.media.findUnique({ where: { id: mediaId } });
  if (!media || media.portfolioId !== portfolioId) {
    throw new ApiError(404, 'Media item not found on this portfolio entry');
  }

  await prisma.media.delete({ where: { id: mediaId } });
  return { id: mediaId };
};

// ---------------- HOME ----------------

const getHome = async (userId) => {
  const profile = await prisma.seekerProfile.findUnique({ where: { userId } });

  const [latest, nearby, recommended] = await Promise.all([
    prisma.opportunity.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { categories: { include: { category: true } } },
    }),
    profile && profile.city
      ? prisma.opportunity.findMany({
          where: { status: 'ACTIVE', city: profile.city },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : Promise.resolve([]),
    profile
      ? prisma.opportunity.findMany({
          where: {
            status: 'ACTIVE',
            ...(profile.availableForRemote && { workMode: 'REMOTE' }),
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  return { latestOpportunities: latest, nearbyOpportunities: nearby, recommendedOpportunities: recommended };
};

// ---------------- SEARCH / DETAILS ----------------

// Only ONSITE/HYBRID opportunities carry latitude/longitude, so radius
// search naturally excludes REMOTE listings (they have no location to
// measure distance from).
const searchOpportunitiesByRadius = async ({
  keyword, categoryId, budgetMin, budgetMax, datePosted, workMode,
  radiusKm, lat, lng, page, limit,
}) => {
  const conditions = [
    Prisma.sql`o.status = 'ACTIVE'`,
    Prisma.sql`o.latitude IS NOT NULL`,
    Prisma.sql`o.longitude IS NOT NULL`,
  ];

  if (keyword) {
    conditions.push(Prisma.sql`(o.title ILIKE ${`%${keyword}%`} OR o.description ILIKE ${`%${keyword}%`})`);
  }
  if (workMode) {
    conditions.push(Prisma.sql`o."workMode" = ${workMode}::"WorkMode"`);
  }
  if (budgetMin) {
    conditions.push(Prisma.sql`o."budgetAmount" >= ${Number(budgetMin)}`);
  }
  if (budgetMax) {
    conditions.push(Prisma.sql`o."budgetAmount" <= ${Number(budgetMax)}`);
  }
  if (datePosted) {
    const since = buildDatePostedFilter(datePosted);
    if (since) {
      conditions.push(Prisma.sql`o."createdAt" >= ${since}`);
    }
  }
  if (categoryId) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM opportunity_categories oc
      WHERE oc."opportunityId" = o.id AND oc."categoryId" = ${categoryId}
    )`);
  }

  const whereClause = Prisma.join(conditions, ' AND ');

  // Haversine formula — great-circle distance in km between (lat,lng) and each row.
  const distanceExpr = Prisma.sql`(
    6371 * acos(
      LEAST(1, GREATEST(-1,
        cos(radians(${lat})) * cos(radians(o.latitude)) * cos(radians(o.longitude) - radians(${lng}))
        + sin(radians(${lat})) * sin(radians(o.latitude))
      ))
    )
  )`;

  const rows = await prisma.$queryRaw`
    SELECT o.id, ${distanceExpr} AS distance_km
    FROM opportunities o
    WHERE ${whereClause} AND ${distanceExpr} <= ${radiusKm}
    ORDER BY distance_km ASC
    LIMIT ${limit} OFFSET ${(page - 1) * limit}
  `;

  const countRows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS count
    FROM opportunities o
    WHERE ${whereClause} AND ${distanceExpr} <= ${radiusKm}
  `;
  const total = countRows[0]?.count || 0;

  const ids = rows.map((r) => r.id);
  if (ids.length === 0) {
    return { items: [], total, page, limit };
  }

  const opportunities = await prisma.opportunity.findMany({
    where: { id: { in: ids } },
    include: { categories: { include: { category: true } }, giver: { select: { fullName: true, giverProfile: true } } },
  });
  const byId = new Map(opportunities.map((o) => [o.id, o]));

  // Raw query already sorted by distance — re-attach that order + the
  // computed distance, since `findMany({ where: { id: { in }}})` does not
  // preserve input order.
  const items = rows
    .map((r) => {
      const opp = byId.get(r.id);
      return opp ? { ...opp, distanceKm: Number(r.distance_km) } : null;
    })
    .filter(Boolean);

  return { items, total, page, limit };
};

// datePosted accepts either a relative bucket ('24h' | '7d' | '30d') or an
// exact date ('YYYY-MM-DD') meaning "posted on or after that calendar
// date" — used by both the normal and radius search branches, so it's
// factored out once instead of duplicated.
const buildDatePostedFilter = (datePosted) => {
  if (!datePosted) return null;

  const hoursMap = { '24h': 24, '7d': 24 * 7, '30d': 24 * 30 };
  if (hoursMap[datePosted]) {
    return new Date(Date.now() - hoursMap[datePosted] * 60 * 60 * 1000);
  }

  // Exact date string — start of that day, local server time
  const parsed = new Date(`${datePosted}T00:00:00`);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const searchOpportunities = async (filters) => {
  const {
    keyword, categoryId, budgetMin, budgetMax, datePosted,
    workMode, radiusKm, lat, lng, page = 1, limit = 20,
  } = filters;

  const hasRadius = radiusKm !== undefined && lat !== undefined && lng !== undefined;

  // ---- Radius search: needs distance math (Haversine), which Prisma's
  // query builder can't express, so this branch uses a raw SQL query. ----
  if (hasRadius) {
    return searchOpportunitiesByRadius({
      keyword, categoryId, budgetMin, budgetMax, datePosted, workMode,
      radiusKm: Number(radiusKm), lat: Number(lat), lng: Number(lng),
      page: Number(page), limit: Number(limit),
    });
  }

  const where = { status: 'ACTIVE' };

  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
    ];
  }
  if (categoryId) {
    where.categories = { some: { categoryId } };
  }
  if (budgetMin || budgetMax) {
    where.budgetAmount = {
      ...(budgetMin && { gte: Number(budgetMin) }),
      ...(budgetMax && { lte: Number(budgetMax) }),
    };
  }
  if (workMode) {
    where.workMode = workMode;
  }
  if (datePosted) {
    const since = buildDatePostedFilter(datePosted);
    if (since) where.createdAt = { gte: since };
  }

  const [items, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: { categories: { include: { category: true } }, giver: { select: { fullName: true, giverProfile: true } } },
    }),
    prisma.opportunity.count({ where }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getOpportunityDetails = async (userId, opportunityId) => {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      categories: { include: { category: true } },
      media: true,
      giver: { select: { id: true, fullName: true, giverProfile: true } },
    },
  });
  if (!opportunity || opportunity.status === 'DELETED') {
    throw new ApiError(404, 'Opportunity not found');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { seekerProfile: true },
  });

  const alreadyApplied = await prisma.application.findUnique({
    where: { opportunityId_seekerId: { opportunityId, seekerId: userId } },
  }).catch(() => null);

  const eligibility = {
    mobileVerified: user.isMobileVerified,
    profileCompleted: Boolean(user.seekerProfile?.isProfileCompleted),
    certificateApproved: user.seekerProfile?.certificateStatus === 'APPROVED',
    alreadyApplied: Boolean(alreadyApplied),
  };
  eligibility.canApply =
    eligibility.mobileVerified &&
    eligibility.profileCompleted &&
    eligibility.certificateApproved &&
    !eligibility.alreadyApplied &&
    opportunity.status === 'ACTIVE';

  return { opportunity, eligibility };
};

// ---------------- APPLY ----------------

const applyToOpportunity = async (userId, opportunityId, payload, mediaFiles = []) => {
  if (mediaFiles.length > 5) {
    throw new ApiError(422, 'Maximum 5 attachments are allowed');
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { seekerProfile: true } });
  if (!user.isMobileVerified) throw new ApiError(403, 'Mobile Number must be verified to apply');
  if (!user.seekerProfile?.isProfileCompleted) throw new ApiError(403, 'Please complete your profile before applying');
  if (user.seekerProfile.certificateStatus !== 'APPROVED') {
    throw new ApiError(403, 'Your Disability Certificate must be approved before applying');
  }

  const opportunity = await prisma.opportunity.findUnique({ where: { id: opportunityId } });
  if (!opportunity || opportunity.status !== 'ACTIVE') {
    throw new ApiError(404, 'Opportunity is not available for applications');
  }

  const existing = await prisma.application.findUnique({
    where: { opportunityId_seekerId: { opportunityId, seekerId: userId } },
  }).catch(() => null);
  if (existing) {
    throw new ApiError(409, 'You have already applied to this opportunity');
  }

  const application = await prisma.application.create({
    data: {
      opportunityId,
      seekerId: userId,
      seekerProfileId: user.seekerProfile.id,
      proposal: payload.proposal,
      proposedBudget: payload.proposedBudget || null,
      questions: payload.questions || null,
      media: {
        create: mediaFiles.map((file) => ({
          ownerType: 'APPLICATION',
          type: file.type,
          url: file.url,
          fileName: file.fileName,
          sizeBytes: file.sizeBytes,
        })),
      },
    },
    include: { media: true },
  });

  await prisma.notification.create({
    data: {
      userId: opportunity.giverId,
      type: 'NEW_APPLICATION',
      title: 'New Application Received',
      body: `${user.fullName} applied to "${opportunity.title}"`,
      data: { applicationId: application.id, opportunityId },
    },
  });

  return application;
};

// ---------------- MY APPLICATIONS ----------------

const listMyApplications = async (userId, { page = 1, limit = 20, status }) => {
  const where = { seekerId: userId, ...(status && { status }) };

  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { appliedAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: { opportunity: { select: { id: true, title: true, budgetType: true, budgetAmount: true } } },
    }),
    prisma.application.count({ where }),
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
};

const getApplicationDetails = async (userId, applicationId) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      opportunity: {
        include: {
          giver: {
            select: {
              id: true,
              fullName: true,
              profilePhotoUrl: true,
              giverProfile: { select: { organizationName: true } },
            },
          },
        },
      },
      media: true,
    },
  });
  if (!application || application.seekerId !== userId) {
    throw new ApiError(404, 'Application not found');
  }

  const [userAId, userBId] = [userId, application.opportunity.giverId].sort();
  const conversation = await prisma.conversation.findFirst({
    where: { userAId, userBId, applicationId: application.id },
    select: { id: true },
  });

  return {
    ...application,
    conversationId: conversation?.id ?? null,
    hasConversation: Boolean(conversation),
  };
};

const withdrawApplication = async (userId, applicationId) => {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application || application.seekerId !== userId) {
    throw new ApiError(404, 'Application not found');
  }
  if (application.status !== 'PENDING' && application.status !== 'SHORTLISTED') {
    throw new ApiError(400, `Cannot withdraw an application with status ${application.status}`);
  }
  return prisma.application.update({ where: { id: applicationId }, data: { status: 'WITHDRAWN' } });
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  completeProfile,
  addEducation, updateEducation, deleteEducation,
  addExperience, updateExperience, deleteExperience,
  addSkill, updateSkill, deleteSkill,
  addAward, updateAward, deleteAward,
  addCertification, updateCertification, deleteCertification,
  addPortfolio, updatePortfolio, deletePortfolio, deletePortfolioMedia,
  getHome,
  searchOpportunities,
  getOpportunityDetails,
  applyToOpportunity,
  listMyApplications,
  getApplicationDetails,
  withdrawApplication,
};
