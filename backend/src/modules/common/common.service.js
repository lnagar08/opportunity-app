const bcrypt = require('bcrypt');
const prisma = require('../../config/db');
const { ApiError } = require('../../utils/apiResponse');
const { generateOtp, getOtpExpiry, sendOtpSms } = require('../../utils/otp');

const SALT_ROUNDS = 10;

// ---------------- MESSAGES ----------------

const getOrCreateConversation = async (userAId, userBId, applicationId = null) => {
  const [first, second] = [userAId, userBId].sort();

  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { userAId: first, userBId: second, applicationId },
      ],
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userAId: first, userBId: second, applicationId },
    });
  }
  return conversation;
};

const listConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    orderBy: { updatedAt: 'desc' },
    include: {
      userA: { select: { id: true, fullName: true, profilePhotoUrl: true } },
      userB: { select: { id: true, fullName: true, profilePhotoUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });
};

const sendMessage = async (senderId, { receiverId, text, applicationId }, mediaFiles = []) => {
  if (!text && mediaFiles.length === 0) {
    throw new ApiError(400, 'Message must contain text or at least one attachment');
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) throw new ApiError(404, 'Receiver not found');

  const conversation = await getOrCreateConversation(senderId, receiverId, applicationId || null);

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId,
      text: text || null,
      media: {
        create: mediaFiles.map((file) => ({
          ownerType: 'MESSAGE',
          type: file.type,
          url: file.url,
          fileName: file.fileName,
          sizeBytes: file.sizeBytes,
        })),
      },
    },
    include: { media: true },
  });

  await prisma.conversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });

  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: 'NEW_MESSAGE',
      title: 'New Message',
      body: text ? text.slice(0, 100) : 'Sent an attachment',
      data: { conversationId: conversation.id },
    },
  });

  return message;
};

const getMessages = async (userId, conversationId, { page = 1, limit = 30 }) => {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (conversation.userAId !== userId && conversation.userBId !== userId) {
    throw new ApiError(403, 'You do not have permission to view this conversation');
  }

  const [items, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      include: { media: true },
    }),
    prisma.message.count({ where: { conversationId } }),
  ]);

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  });

  return { items, total, page: Number(page), limit: Number(limit) };
};

// ---------------- NOTIFICATIONS ----------------

const listNotifications = async (userId, { page = 1, limit = 20 }) => {
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
    }),
    prisma.notification.count({ where: { userId } }),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

const markNotificationRead = async (userId, notificationId) => {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) {
    throw new ApiError(404, 'Notification not found');
  }
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
};

// ---------------- SETTINGS ----------------

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new ApiError(400, 'Current Password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return true;
};

const requestChangeMobile = async (userId, newMobileNumber) => {
  const existing = await prisma.user.findUnique({ where: { mobileNumber: newMobileNumber } });
  if (existing) throw new ApiError(409, 'Mobile Number is already in use');

  const otpCode = generateOtp();
  const expiresAt = getOtpExpiry();
  await prisma.otpVerification.create({
    data: { userId, mobileNumber: newMobileNumber, otpCode, purpose: 'CHANGE_MOBILE', expiresAt },
  });
  await sendOtpSms(newMobileNumber, otpCode);
  return true;
};

const confirmChangeMobile = async (userId, newMobileNumber, otp) => {
  const otpRecord = await prisma.otpVerification.findFirst({
    where: { userId, mobileNumber: newMobileNumber, otpCode: otp, purpose: 'CHANGE_MOBILE', isUsed: false },
    orderBy: { createdAt: 'desc' },
  });
  if (!otpRecord) throw new ApiError(400, 'Invalid OTP');
  if (otpRecord.expiresAt < new Date()) throw new ApiError(400, 'OTP has expired');

  await prisma.otpVerification.update({ where: { id: otpRecord.id }, data: { isUsed: true } });
  return prisma.user.update({ where: { id: userId }, data: { mobileNumber: newMobileNumber } });
};

const getNotificationPreference = async (userId) => {
  return prisma.notificationPreference.findUnique({ where: { userId } });
};

const updateNotificationPreference = async (userId, payload) => {
  return prisma.notificationPreference.upsert({
    where: { userId },
    update: payload,
    create: { userId, ...payload },
  });
};

module.exports = {
  listConversations,
  sendMessage,
  getMessages,
  listNotifications,
  markNotificationRead,
  changePassword,
  requestChangeMobile,
  confirmChangeMobile,
  getNotificationPreference,
  updateNotificationPreference,
};
