const express = require('express');
const { body } = require('express-validator');
const {
  createConversation,
  getConversations,
  getConversation,
  updateSettings,
  addParticipant,
  removeParticipant
} = require('../controllers/conversation.controller');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', protect, getConversations);

router.post(
  '/',
  protect,
  [
    body('type')
      .isIn(['direct', 'group', 'booking', 'support'])
      .withMessage('Valid conversation type is required'),
    body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
    validate
  ],
  createConversation
);

router.get('/:id', protect, getConversation);

router.put('/:id/settings', protect, updateSettings);

router.post(
  '/:id/participants',
  protect,
  [
    body('userId').isMongoId().withMessage('Valid user ID is required'),
    validate
  ],
  addParticipant
);

router.delete('/:id/participants/:userId', protect, removeParticipant);

module.exports = router;
