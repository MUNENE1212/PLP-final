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

    // Fetch more posts than needed to allow for pro boosting
    const fetchLimit = parseInt(limit) * 3;

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName profilePicture role rating subscription')
      .sort(sort)
      .limit(fetchLimit);

    const total = await Post.countDocuments(query);

    // Calculate engagement score and apply pro boost
    const postsWithScores = posts.map(post => {
      // Calculate base engagement score
      const likesWeight = 3;
      const commentsWeight = 5;
      const sharesWeight = 10;
      const viewsWeight = 0.1;
      const recencyBonus = Math.max(0, 100 - ((Date.now() - post.createdAt) / (1000 * 60 * 60 * 24))); // Decay over 100 days

      const engagementScore =
        (post.engagement.likes.length * likesWeight) +
        (post.comments.length * commentsWeight) +
        (post.sharesCount * sharesWeight) +
        (post.engagement.views * viewsWeight) +
        recencyBonus;

      // Apply pro boost
      let finalScore = engagementScore;
      let boostApplied = false;
      let boostMultiplier = 1.0;

      if (post.author && post.author.subscription) {
        const { plan, status, endDate, features } = post.author.subscription;
        const isActive = status === 'active';
        const notExpired = !endDate || new Date(endDate) > new Date();
        const hasBoostedPosts = features && features.boostedPosts;

        if (isActive && notExpired && hasBoostedPosts) {
          boostApplied = true;
          if (plan === 'premium') {
            boostMultiplier = 2.0; // 100% boost for premium
          } else if (plan === 'pro') {
            boostMultiplier = 1.5; // 50% boost for pro
          }
          finalScore = engagementScore * boostMultiplier;
        }
      }

      return {
        post,
        engagementScore,
        finalScore,
        boostApplied,
        boostMultiplier
      };
    });

    // Sort by final score
    postsWithScores.sort((a, b) => b.finalScore - a.finalScore);

    // Apply pagination after scoring
    const paginatedScores = postsWithScores.slice(skip, skip + parseInt(limit));

    // Add isLiked and isBookmarked flags for authenticated users
    const userId = req.user?.id;
    const postsWithFlags = paginatedScores.map(({ post, boostApplied, boostMultiplier }) => {
      const postObj = post.toObject();
      if (userId) {
        postObj.isLiked = post.engagement.likes.some(id => id.toString() === userId);
        postObj.isBookmarked = post.bookmarks.some(id => id.toString() === userId);
      } else {
        postObj.isLiked = false;
        postObj.isBookmarked = false;
      }
      postObj.likesCount = post.engagement.likes.length;
      postObj.commentsCount = post.comments.length;
      postObj.sharesCount = post.sharesCount;
      postObj.views = post.engagement.views;
      postObj.isBoosted = boostApplied;
      postObj.boostLevel = boostMultiplier > 1.0 ? (boostMultiplier === 2.0 ? 'premium' : 'pro') : null;
      return postObj;
    });

    res.status(200).json({
      success: true,
      count: postsWithFlags.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      posts: postsWithFlags
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
      comment: post.comments[post.comments.length - 1],
      commentsCount: post.comments.length
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
      message: 'Comment deleted successfully',
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
};

/**
 * @desc    Share post
 * @route   POST /api/v1/posts/:id/share
 * @access  Private
 */
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.share(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Post shared successfully',
      sharesCount: post.sharesCount
    });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing post'
    });
  }
};

/**
 * @desc    Toggle bookmark on post
 * @route   POST /api/v1/posts/:id/bookmark
 * @access  Private
 */
exports.toggleBookmark = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const isBookmarked = post.bookmarks.includes(req.user.id);

    if (isBookmarked) {
      await post.unbookmark(req.user.id);
    } else {
      await post.bookmark(req.user.id);
    }

    res.status(200).json({
      success: true,
      message: isBookmarked ? 'Bookmark removed' : 'Post bookmarked',
      bookmarked: !isBookmarked,
      bookmarksCount: post.bookmarksCount
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling bookmark'
    });
  }
};
