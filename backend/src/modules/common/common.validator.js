const { body, param } = require('express-validator');

const sendMessageValidator = [
  body('receiverId')
    .notEmpty().withMessage('Receiver ID is required')
    .isUUID().withMessage('Receiver ID must be a valid UUID'),

  body('text')
    .optional({ checkFalsy: true })
    .isLength({ max: 2000 }).withMessage('Message text must be under 2000 characters'),

  body('applicationId')
    .optional({ checkFalsy: true })
    .isUUID().withMessage('Application ID must be a valid UUID'),
];

const conversationIdParamValidator = [
  param('conversationId').isUUID().withMessage('Invalid Conversation ID'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current Password is required'),
  body('newPassword')
    .notEmpty().withMessage('New Password is required')
    .isLength({ min: 8 }).withMessage('New Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New Password must contain at least one number'),
  body('confirmNewPassword')
    .notEmpty().withMessage('Confirm New Password is required')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Confirm New Password must match New Password'),
];

const changeMobileValidator = [
  body('newMobileNumber')
    .trim()
    .notEmpty().withMessage('New Mobile Number is required')
    .matches(/^[0-9]{10}$/).withMessage('New Mobile Number must be a valid 10-digit number'),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const markNotificationsReadValidator = [
  body('notificationIds')
    .isArray({ min: 1 }).withMessage('notificationIds must be a non-empty array'),
  body('notificationIds.*')
    .isUUID().withMessage('Each notification ID must be a valid UUID'),
];

const notificationPreferenceValidator = [
  body('pushEnabled').optional().isBoolean().withMessage('pushEnabled must be boolean'),
  body('emailEnabled').optional().isBoolean().withMessage('emailEnabled must be boolean'),
  body('newApplicationEnabled').optional().isBoolean().withMessage('newApplicationEnabled must be boolean'),
  body('newMessageEnabled').optional().isBoolean().withMessage('newMessageEnabled must be boolean'),
  body('opportunityUpdatesEnabled').optional().isBoolean().withMessage('opportunityUpdatesEnabled must be boolean'),
];

module.exports = {
  sendMessageValidator,
  conversationIdParamValidator,
  changePasswordValidator,
  changeMobileValidator,
  markNotificationsReadValidator,
  notificationPreferenceValidator,
};