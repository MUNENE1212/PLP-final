const express = require('express');
const { body } = require('express-validator');
const {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  addReply,
  deleteComment,
  sharePost,
  toggleBookmark,
  getBookmarkedPosts,
  toggleCommentLike
} = require('../controllers/post.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

// Public/optional auth routes
router.get('/', optionalAuth, getPosts);
router.get('/bookmarked', protect, getBookmarkedPosts);
router.get('/:id', optionalAuth, getPost);

// Protected routes
router.post(
  '/',
  protect,
  [
    body('type')
      .isIn(['text', 'image', 'video', 'portfolio', 'tip', 'question'])
      .withMessage('Valid post type is required'),
    body('caption').optional().trim(),
    validate
  ],
  createPost
);

router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

router.post('/:id/like', protect, toggleLike);
router.post('/:id/share', protect, sharePost);
router.post('/:id/bookmark', protect, toggleBookmark);

router.post(
  '/:id/comment',
  protect,
  [
    body('text').trim().notEmpty().withMessage('Comment text is required'),
    validate
  ],
  addComment
);

router.post(
  '/:id/comment/:commentId/reply',
  protect,
  [
    body('text').trim().notEmpty().withMessage('Reply text is required'),
    validate
  ],
  addReply
);

router.post('/:id/comment/:commentId/like', protect, toggleCommentLike);

router.delete('/:id/comment/:commentId', protect, deleteComment);

module.exports = router;
