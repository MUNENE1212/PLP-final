import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Send,
  Trash2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  toggleLike,
  addComment,
  sharePost,
  toggleBookmark,
  deletePost,
  Post,
} from '@/store/slices/postSlice';
import { cn } from '@/lib/utils';
import { timeAgo } from '@/lib/utils';
import { formatRating } from '@/utils/rating';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  // Early return if post author is not populated
  if (!post.author || typeof post.author !== 'object' || !post.author._id) {
    console.error('Post author is not properly populated:', post);
    return null;
  }

  const isOwnPost = user?._id === post.author._id;

  const handleLike = async () => {
    await dispatch(toggleLike(post._id));
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const result = await dispatch(addComment({ postId: post._id, text: commentText }));
    if (addComment.fulfilled.match(result)) {
      setCommentText('');
    }
  };

  const handleShare = async () => {
    await dispatch(sharePost(post._id));
  };

  const handleBookmark = async () => {
    await dispatch(toggleBookmark(post._id));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await dispatch(deletePost(post._id));
    }
  };

  const getProfilePicture = (author: any) => {
    if (!author) return 'https://ui-avatars.com/api/?name=User&background=random';
    return author.profilePicture || `https://ui-avatars.com/api/?name=${author.firstName || 'User'}+${author.lastName || ''}&background=random`;
  };

  const getPostTypeColor = () => {
    const colors: Record<string, string> = {
      text: 'text-gray-600',
      question: 'text-purple-600',
      tip: 'text-yellow-600',
      portfolio: 'text-green-600',
      achievement: 'text-blue-600',
      image: 'text-blue-600',
      video: 'text-red-600',
    };
    return colors[post.type] || colors.text;
  };

  const getPostTypeIcon = () => {
    const icons: Record<string, string> = {
      text: '📝',
      question: '❓',
      tip: '💡',
      portfolio: '🎨',
      achievement: '🏆',
      image: '🖼️',
      video: '🎥',
    };
    return icons[post.type] || icons.text;
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-gray-800 shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between p-3 sm:p-4">
        <div className="flex space-x-2 sm:space-x-3 flex-1 min-w-0">
          <Link to={`/profile/${post.author._id}`} className="flex-shrink-0">
            <img
              src={getProfilePicture(post.author)}
              alt={post.author.firstName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-gray-100 cursor-pointer hover:ring-primary-500 transition-all"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Link to={`/profile/${post.author._id}`}>
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors cursor-pointer truncate">
                  {post.author.firstName} {post.author.lastName}
                </h3>
              </Link>
              {post.author.rating && post.author.rating.count > 0 && (
                <span className="flex items-center text-xs sm:text-sm text-yellow-600 flex-shrink-0">
                  ⭐ {formatRating(post.author.rating)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-amber-500">
              <span className="capitalize">{post.author.role}</span>
              <span>•</span>
              <span>{timeAgo(post.createdAt)}</span>
              {post.type !== 'text' && (
                <>
                  <span>•</span>
                  <span className={cn('flex items-center space-x-1', getPostTypeColor())}>
                    <span>{getPostTypeIcon()}</span>
                    <span className="capitalize">{post.type}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-400"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg">
              {isOwnPost ? (
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Post</span>
                </button>
              ) : (
                <button className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900">
                  <span>Report Post</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 pb-3">
        <p className="whitespace-pre-wrap text-sm sm:text-base text-gray-800 dark:text-gray-200">{post.caption}</p>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-sm text-primary-600 hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className={cn(
          'grid gap-1',
          post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
        )}>
          {post.media.map((media, index) => (
            <div key={index} className="relative aspect-square overflow-hidden">
              {media.type === 'image' ? (
                <img
                  src={media.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <video
                  src={media.url}
                  poster={media.thumbnail}
                  controls
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span>{post.likesCount} likes</span>
          <span>{post.commentsCount} comments</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span className="hidden sm:inline">{post.sharesCount} shares</span>
          <span>{post.views} views</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around border-t border-gray-100 dark:border-gray-700 px-2 sm:px-4 py-2">
        <button
          onClick={handleLike}
          className={cn(
            'flex flex-1 items-center justify-center space-x-1 sm:space-x-2 rounded-lg py-2 text-xs sm:text-sm font-medium transition-colors',
            post.isLiked
              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          <Heart className={cn('h-4 w-4 sm:h-5 sm:w-5', post.isLiked && 'fill-current')} />
          <span className="hidden sm:inline">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex flex-1 items-center justify-center space-x-1 sm:space-x-2 rounded-lg py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center space-x-1 sm:space-x-2 rounded-lg py-2 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button
          onClick={handleBookmark}
          className={cn(
            'flex flex-1 items-center justify-center space-x-1 sm:space-x-2 rounded-lg py-2 text-xs sm:text-sm font-medium transition-colors',
            post.isBookmarked
              ? 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          <Bookmark className={cn('h-4 w-4 sm:h-5 sm:w-5', post.isBookmarked && 'fill-current')} />
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-3 sm:px-4 py-3">
          {/* Comment Form */}
          <form onSubmit={handleComment} className="mb-4 flex space-x-2">
            <img
              src={getProfilePicture(user)}
              alt={user?.firstName}
              className="h-8 w-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 sm:px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="rounded-full bg-primary-600 p-2 text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments.map((comment) => {
              // Safety check: Ensure comment.user is populated
              if (!comment.user || typeof comment.user !== 'object' || !comment.user._id) {
                return null;
              }

              return (
                <div key={comment._id} className="flex space-x-2">
                  <Link to={`/profile/${comment.user._id}`}>
                    <img
                      src={getProfilePicture(comment.user)}
                      alt={comment.user.firstName}
                      className="h-8 w-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="rounded-lg bg-gray-50 dark:bg-gray-900 px-3 py-2">
                      <Link to={`/profile/${comment.user._id}`}>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors cursor-pointer">
                          {comment.user.firstName} {comment.user.lastName}
                        </p>
                      </Link>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</p>
                    </div>
                    <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                      <span>{timeAgo(comment.createdAt)}</span>
                      <button className="hover:underline">Like</button>
                      <button className="hover:underline">Reply</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
