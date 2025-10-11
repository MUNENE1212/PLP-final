const express = require('express');
const { body } = require('express-validator');
const {
  createNotification,
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getPreferences,
  updatePreferences
} = require('../controllers/notification.controller');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Preferences routes
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);

// Mark all as read (before :id route)
router.put('/mark-all-read', protect, markAllAsRead);

// Clear read notifications
router.delete('/clear-read', protect, clearReadNotifications);

// Get all notifications
router.get('/', protect, getNotifications);

// Create notification (admin only)
router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('recipient').isMongoId().withMessage('Valid recipient ID is required'),
    body('type').notEmpty().withMessage('Notification type is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    validate
  ],
  createNotification
);

// Single notification operations
router.get('/:id', protect, getNotification);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
