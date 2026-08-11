const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');

// URL-friendly slug <-> Prisma enum value. Keeps the public API readable
// (/content-pages/privacy-policy) while the DB stores a fixed enum.
const SLUG_TO_ENUM = {
  'terms-and-conditions': 'TERMS_AND_CONDITIONS',
  'privacy-policy': 'PRIVACY_POLICY',
};

const DEFAULT_TITLES = {
  TERMS_AND_CONDITIONS: 'Terms & Conditions',
  PRIVACY_POLICY: 'Privacy Policy',
};

const toEnumSlug = (slug) => {
  const enumSlug = SLUG_TO_ENUM[slug];
  if (!enumSlug) throw new ApiError(404, 'Content page not found');
  return enumSlug;
};

// Public: returns the page, auto-creating an empty placeholder the first
// time it's requested so the app never gets a 404 for a page it must show.
const getContentPage = async (slug) => {
  const enumSlug = toEnumSlug(slug);

  const page = await prisma.contentPage.upsert({
    where: { slug: enumSlug },
    update: {},
    create: { slug: enumSlug, title: DEFAULT_TITLES[enumSlug], content: '' },
  });

  return page;
};

const listContentPages = async () => {
	return prisma.contentPage.findMany({
		orderBy: { slug: 'asc' },
		include: { updatedByAdmin: { select: { id: true, fullName: true } } },
	});
};

const updateContentPage = async (slug, adminId, payload) => {
  const enumSlug = toEnumSlug(slug);

  const page = await prisma.contentPage.upsert({
    where: { slug: enumSlug },
    update: {
      title: payload.title,
      content: payload.content,
      updatedByAdminId: adminId,
    },
    create: {
      slug: enumSlug,
      title: payload.title,
      content: payload.content,
      updatedByAdminId: adminId,
    },
  });

  return page;
};

module.exports = { getContentPage, listContentPages, updateContentPage };
