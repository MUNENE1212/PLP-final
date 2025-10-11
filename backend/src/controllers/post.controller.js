const Post = require('../models/Post');
const User = require('../models/User');

/**
 * @desc    Create a new post
 * @route   POST /api/v1/posts
 * @access  Private
 */
exports.createPost = async (req, res) => {
  try {
    const { type, caption, media, hashtags, portfolioDetails, visibility } = req.body;

    const post = await Post.create({
      author: req.user.id,
      type,
      caption,
      media: media || [],
      hashtags: hashtags || [],
      portfolioDetails,
      visibility: visibility || 'public',
      status: 'published'
    });

    await post.populate('author', 'firstName lastName profilePicture role');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message
    });
  }
};

/**
 * @desc    Get all posts (feed)
 * @route   GET /api/v1/posts
 * @access  Public
 */
exports.getPosts = async (req, res) => {
  try {
    const { type, author, hashtag, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = { status: 'published', visibility: 'public' };

    if (type) query.type = type;
    if (author) query.author = author;
    if (hashtag) query.hashtags = hashtag;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName profilePicture role rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts'
    });
  }
};

/**
 * @desc    Get single post
 * @route   GET /api/v1/posts/:id
 * @access  Public
 */
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'firstName lastName profilePicture role rating')
      .populate('comments.user', 'firstName lastName profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment views
    post.engagement.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching post'
    });
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/v1/posts/:id
 * @access  Private
 */
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    const { caption, media, hashtags, visibility } = req.body;

    if (caption) post.caption = caption;
    if (media) post.media = media;
    if (hashtags) post.hashtags = hashtags;
    if (visibility) post.visibility = visibility;

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating post'
    });
  }
};

/**
 * @desc    Delete post (soft delete for everyone)
 * @route   DELETE /api/v1/posts/:id
 * @access  Private
 */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    // Soft delete - mark as deleted but keep in database
    await post.deletePost(req.user.id, req.body.reason);

    // TODO: Emit socket.io event to notify followers
    // TODO: Remove from feeds

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post'
    });
  }
};

/**
 * @desc    Like/Unlike post
 * @route   POST /api/v1/posts/:id/like
 * @access  Private
 */
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isLiked = post.engagement.likes.includes(req.user.id);

    if (isLiked) {
      post.engagement.likes = post.engagement.likes.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      post.engagement.likes.push(req.user.id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      isLiked: !isLiked,
      likesCount: post.engagement.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling like'
    });
  }
};

/**
 * @desc    Add comment to post
 * @route   POST /api/v1/posts/:id/comment
 * @access  Private
 */
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    post.comments.push({
      user: req.user.id,
      text,
      timestamp: new Date()
    });

    await post.save();

    await post.populate('comments.user', 'firstName lastName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/v1/posts/:id/comment/:commentId
 * @access  Private
 */
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
};
