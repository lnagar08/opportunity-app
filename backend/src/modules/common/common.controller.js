const { success } = require('../../utils/apiResponse');
const service = require('./common.service');
const { toFileUrl } = require('../../utils/fileUrl');

const mapUploadedFile = (req, file) => {
  const mimeToType = (mime) => {
    if (mime.startsWith('image/')) return 'IMAGE';
    if (mime.startsWith('audio/')) return 'AUDIO';
    if (mime.startsWith('video/')) return 'VIDEO';
    return 'PDF';
  };
  return {
    type: mimeToType(file.mimetype),
    url: toFileUrl(req, file.filename),
    fileName: file.originalname,
    sizeBytes: file.size,
  };
};

const listConversations = async (req, res, next) => {
  try {
    const data = await service.listConversations(req.user.id);
    return success(res, 200, 'Conversations fetched successfully', data);
  } catch (err) { next(err); }
};

const sendMessage = async (req, res, next) => {
  try {
    const mediaFiles = (req.files || []).map((file) => mapUploadedFile(req, file));
    const message = await service.sendMessage(req.user.id, req.body, mediaFiles);
    return success(res, 201, 'Message sent successfully', message);
  } catch (err) { next(err); }
};

const getMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const data = await service.getMessages(req.user.id, req.params.conversationId, { page, limit });
    return success(res, 200, 'Messages fetched successfully', data);
  } catch (err) { next(err); }
};

const listNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const data = await service.listNotifications(req.user.id, { page, limit });
    return success(res, 200, 'Notifications fetched successfully', data);
  } catch (err) { next(err); }
};

const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await service.markNotificationRead(req.user.id, req.params.id);
    return success(res, 200, 'Notification marked as read', notification);
  } catch (err) { next(err); }
};

const markNotificationsRead = async (req, res, next) => {
  try {
    const data = await service.markNotificationsRead(req.user.id, req.body.notificationIds);
    return success(res, 200, 'Notifications marked as read', data);
  } catch (err) { next(err); }
};

const markAllNotificationsRead = async (req, res, next) => {
  try {
    const data = await service.markAllNotificationsRead(req.user.id);
    return success(res, 200, 'All notifications marked as read', data);
  } catch (err) { next(err); }
};

const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const data = await service.getUnreadNotificationCount(req.user.id);
    return success(res, 200, 'Unread count fetched successfully', data);
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    await service.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    return success(res, 200, 'Password changed successfully');
  } catch (err) { next(err); }
};

const requestChangeMobile = async (req, res, next) => {
  try {
    await service.requestChangeMobile(req.user.id, req.body.newMobileNumber);
    return success(res, 200, 'OTP sent to new Mobile Number');
  } catch (err) { next(err); }
};

const confirmChangeMobile = async (req, res, next) => {
  try {
    const user = await service.confirmChangeMobile(req.user.id, req.body.newMobileNumber, req.body.otp);
    return success(res, 200, 'Mobile Number updated successfully', {
      id: user.id, mobileNumber: user.mobileNumber,
    });
  } catch (err) { next(err); }
};

const getNotificationPreference = async (req, res, next) => {
  try {
    const pref = await service.getNotificationPreference(req.user.id);
    return success(res, 200, 'Notification preferences fetched successfully', pref);
  } catch (err) { next(err); }
};

const updateNotificationPreference = async (req, res, next) => {
  try {
    const pref = await service.updateNotificationPreference(req.user.id, req.body);
    return success(res, 200, 'Notification preferences updated successfully', pref);
  } catch (err) { next(err); }
};

const getUnreadMessageCount = async (req, res, next) => {
  try {
    const data = await service.getUnreadMessageCount(req.user.id);
    return success(res, 200, 'Unread message count fetched successfully', data);
  } catch (err) { next(err); }
};

module.exports = {
  listConversations,
  sendMessage,
  getMessages,
  getUnreadMessageCount,
  listNotifications,
  markNotificationRead,
  markNotificationsRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  changePassword,
  requestChangeMobile,
  confirmChangeMobile,
  getNotificationPreference,
  updateNotificationPreference,
};