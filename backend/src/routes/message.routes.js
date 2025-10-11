const express = require('express');
const { body } = require('express-validator');
const {
  sendMessage,
  getMessages,
  markAsRead,
  deleteMessage,
  deleteMessageForEveryone,
  addReaction
} = require('../controllers/message.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', protect, getMessages);

router.post(
  '/',
  protect,
  [
    body('conversation').isMongoId().withMessage('Valid conversation ID is required'),
    body('type')
      .isIn(['text', 'image', 'video', 'audio', 'document', 'location', 'booking', 'voice_call', 'video_call'])
      .withMessage('Valid message type is required'),
    validate
  ],
  sendMessage
);

router.put('/mark-read', protect, markAsRead);

// Delete for self
router.delete('/:id', protect, deleteMessage);

// Delete for everyone (must be before /:id/reaction to avoid route conflict)
router.delete('/:id/everyone', protect, deleteMessageForEveryone);

router.post(
  '/:id/reaction',
  protect,
  [
    body('emoji').notEmpty().withMessage('Emoji is required'),
    validate
  ],
  addReaction
);

module.exports = router;
