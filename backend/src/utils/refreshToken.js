const crypto = require('crypto');
const prisma = require('../config/db');

const REFRESH_TOKEN_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS || '30', 10);

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const generateRefreshToken = async ({ userId, adminId }) => {
  const rawToken = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { tokenHash: hashToken(rawToken), userId: userId || null, adminId: adminId || null, expiresAt },
  });

  return rawToken; // raw value goes to the client; only the hash is stored
};

// Verifies + rotates in one step: the presented token is revoked and a new
// one is issued, chained via replacedByTokenId. Rotation means a stolen
// token can only be replayed once before the legitimate owner's next
// refresh (or a reuse-detection check) invalidates the chain.
const rotateRefreshToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!existing || existing.revokedAt || existing.expiresAt < new Date()) {
    return null;
  }

  const newRawToken = await generateRefreshToken({ userId: existing.userId, adminId: existing.adminId });
  const newToken = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(newRawToken) } });

  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date(), replacedByTokenId: newToken.id },
  });

  return { rawToken: newRawToken, userId: existing.userId, adminId: existing.adminId };
};

const revokeRefreshToken = async (rawToken) => {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

const revokeAllRefreshTokensFor = async ({ userId, adminId }) => {
  await prisma.refreshToken.updateMany({
    where: { ...(userId && { userId }), ...(adminId && { adminId }), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

module.exports = { generateRefreshToken, rotateRefreshToken, revokeRefreshToken, revokeAllRefreshTokensFor };