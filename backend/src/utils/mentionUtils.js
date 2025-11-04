const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * Extract @mentions from text
 * Matches @username patterns
 * @param {string} text - The text to parse
 * @returns {Array<string>} - Array of mentioned usernames (without @)
 */
exports.extractMentions = (text) => {
  if (!text) return [];

  // Match @username pattern (alphanumeric, underscore, hyphen)
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const matches = text.match(mentionRegex);

  if (!matches) return [];

  // Remove @ symbol and get unique usernames
  return [...new Set(matches.map(match => match.slice(1)))];
};

/**
 * Convert usernames to user IDs
 * @param {Array<string>} usernames - Array of usernames
 * @returns {Promise<Array<ObjectId>>} - Array of user ObjectIds
 */
exports.getUserIdsFromUsernames = async (usernames) => {
  if (!usernames || usernames.length === 0) return [];

  try {
    // Find users by username (assuming username field exists, otherwise use firstName/lastName)
    // First try exact username match
    const users = await User.find({
      username: { $in: usernames },
      deletedAt: null,
      status: 'active'
    }).select('_id');

    if (users.length > 0) {
      return users.map(user => user._id);
    }

    // Fallback: try to match firstName or lastName
    const nameUsers = await User.find({
      $or: [
        { firstName: { $in: usernames } },
        { lastName: { $in: usernames } }
      ],
      deletedAt: null,
      status: 'active'
    }).select('_id');

    return nameUsers.map(user => user._id);
  } catch (error) {
    console.error('Error getting user IDs from usernames:', error);
    return [];
  }
};

/**
 * Create mention notifications for mentioned users
 * @param {ObjectId} senderId - ID of user who mentioned others
 * @param {Array<ObjectId>} mentionedUserIds - IDs of mentioned users
 * @param {string} contentType - 'post' or 'comment'
 * @param {ObjectId} contentId - ID of the post or comment
 * @param {string} contentPreview - Preview text of the content
 */
exports.createMentionNotifications = async (senderId, mentionedUserIds, contentType, contentId, contentPreview) => {
  if (!mentionedUserIds || mentionedUserIds.length === 0) return;

  try {
    // Get sender info
    const sender = await User.findById(senderId).select('firstName lastName');
    if (!sender) return;

    const senderName = `${sender.firstName} ${sender.lastName}`;

    // Create notifications for each mentioned user (except the sender)
    const notifications = mentionedUserIds
      .filter(userId => userId.toString() !== senderId.toString())
      .map(userId => ({
        recipient: userId,
        sender: senderId,
        type: 'mention',
        category: 'social',
        title: `${senderName} mentioned you`,
        body: contentPreview.length > 100
          ? contentPreview.substring(0, 100) + '...'
          : contentPreview,
        relatedPost: contentType === 'post' ? contentId : null,
        actionData: {
          contentType,
          contentId: contentId.toString(),
          action: contentType === 'post' ? 'view_post' : 'view_post'
        },
        priority: 'normal'
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error creating mention notifications:', error);
  }
};

/**
 * Process mentions in text and return user IDs
 * @param {string} text - The text containing mentions
 * @returns {Promise<Array<ObjectId>>} - Array of mentioned user IDs
 */
exports.processMentions = async (text) => {
  const usernames = exports.extractMentions(text);
  if (usernames.length === 0) return [];

  const userIds = await exports.getUserIdsFromUsernames(usernames);
  return userIds;
};
