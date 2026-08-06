const express = require('express');
const router = express.Router();

const controller = require('./common.controller');
const validate = require('../../middleware/validate.middleware');
const upload = require('../../middleware/upload.middleware');
const { authenticate } = require('../../middleware/auth.middleware');
const {
  sendMessageValidator,
  conversationIdParamValidator,
  changePasswordValidator,
  changeMobileValidator,
  notificationPreferenceValidator,
} = require('./common.validator');
const { param } = require('express-validator');

router.use(authenticate);

// Screen 15/24/16: Messages / Chat
router.get('/conversations', controller.listConversations);
router.post(
  '/messages',
  upload.array('attachments', 5),
  sendMessageValidator,
  validate,
  controller.sendMessage
);
router.get(
  '/conversations/:conversationId/messages',
  conversationIdParamValidator,
  validate,
  controller.getMessages
);

// Screen 26: Notifications
router.get('/notifications', controller.listNotifications);
router.patch(
  '/notifications/:id/read',
  param('id').isUUID().withMessage('Invalid Notification ID'),
  validate,
  controller.markNotificationRead
);

// Screen 27: Settings
router.put('/settings/password', changePasswordValidator, validate, controller.changePassword);
router.post(
  '/settings/mobile/request-otp',
  changeMobileValidator[0],
  validate,
  controller.requestChangeMobile
);
router.put('/settings/mobile', changeMobileValidator, validate, controller.confirmChangeMobile);
router.get('/settings/notification-preferences', controller.getNotificationPreference);
router.put(
  '/settings/notification-preferences',
  notificationPreferenceValidator,
  validate,
  controller.updateNotificationPreference
);

module.exports = router;
