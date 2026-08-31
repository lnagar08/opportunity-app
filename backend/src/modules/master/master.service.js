const prisma = require('../../config/db');

// Only active records are exposed publicly — these back dropdown/select
// fields in the mobile app (Seeker registration, Opportunity category picker,
// Search filters, etc). Inactive records are still visible to Admins via
// /api/v1/admin/master/* so historical data referencing them stays intact.

const listDisabilityTypes = async () => {
  return prisma.disabilityType.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
};

const listCategories = async () => {
  return prisma.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
};

const listStates = async () => {
  return prisma.state.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true },
    orderBy: { name: 'asc' },
  });
};

const listCities = async (stateId) => {
  return prisma.city.findMany({
    where: { isActive: true, ...(stateId && { stateId }) },
    select: { id: true, name: true, stateId: true },
    orderBy: { name: 'asc' },
  });
};

module.exports = { listDisabilityTypes, listCategories, listStates, listCities };
