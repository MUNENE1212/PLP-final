/**
 * Messaging Socket Handler
 * Handles real-time messaging events: delivery status, read receipts, typing indicators
 *
 * @module socketHandlers/messaging.handler
 */

const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

/**
 * Register messaging socket handlers
 * @param {import('socket.io').Server} io - Socket.IO server instance
 */
function registerMessagingHandlers(io) {
  io.on('connection', (socket) => {
    // ===== MESSAGE DELIVERY STATUS =====

    /**
     * Handle message delivered event
     * Emitted when a message reaches the recipient's device
     */
    socket.on('message:delivered', async ({ messageId, conversationId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Update message status to delivered
        if (message.status === 'sent') {
          message.status = 'delivered';
          await message.save();

          // Notify the sender that message was delivered
          io.to(message.sender.toString()).emit('message:delivered', {
            messageId,
            conversationId,
            deliveredAt: new Date()
          });
        }
      } catch (error) {
        console.error('Error handling message:delivered:', error);
        socket.emit('error', { message: 'Failed to update delivery status' });
      }
    });

    /**
     * Handle message read event
     * Emitted when recipient opens/views the message
     */
    socket.on('message:read', async ({ messageId, conversationId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Check if user already read this message
        const alreadyRead = message.readBy.some(
          receipt => receipt.user.toString() === socket.userId
        );

        if (!alreadyRead) {
          // Add read receipt
          message.readBy.push({
            user: socket.userId,
            readAt: new Date()
          });

          // Update status to read if not already
          if (message.status !== 'read') {
            message.status = 'read';
          }

          await message.save();

          // Notify the sender that message was read
          io.to(message.sender.toString()).emit('message:read', {
            messageId,
            conversationId,
            readAt: new Date(),
            readBy: socket.userId
          });
        }
      } catch (error) {
        console.error('Error handling message:read:', error);
        socket.emit('error', { message: 'Failed to update read status' });
      }
    });

    /**
     * Handle mark all messages as read in conversation
     */
    socket.on('conversation:mark_read', async ({ conversationId }) => {
      try {
        // Verify user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        const isParticipant = conversation.participants.some(
          p => p.user.toString() === socket.userId
        );
        if (!isParticipant) {
          return socket.emit('error', { message: 'Not a participant' });
        }

        // Mark all unread messages as read
        const result = await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: socket.userId },
            'readBy.user': { $ne: socket.userId }
          },
          {
            $push: {
              readBy: {
                user: socket.userId,
                readAt: new Date()
              }
            },
            $set: { status: 'read' }
          }
        );

        // Update conversation unread count
        const participant = conversation.participants.find(
          p => p.user.toString() === socket.userId
        );
        if (participant) {
          participant.unreadCount = 0;
          participant.lastReadAt = new Date();
          await conversation.save();
        }

        // Notify message senders about read status
        const unreadMessages = await Message.find({
          conversation: conversationId,
          sender: { $ne: socket.userId },
          'readBy.user': { $ne: socket.userId }
        }).distinct('sender');

        unreadMessages.forEach(senderId => {
          io.to(senderId.toString()).emit('conversation:read', {
            conversationId,
            readBy: socket.userId,
            readAt: new Date()
          });
        });

        socket.emit('conversation:marked_read', {
          conversationId,
          updatedCount: result.modifiedCount
        });
      } catch (error) {
        console.error('Error handling conversation:mark_read:', error);
        socket.emit('error', { message: 'Failed to mark conversation as read' });
      }
    });

    // ===== TYPING INDICATORS =====

    /**
     * Handle typing start event
     */
    socket.on('typing:start', async ({ conversationId }) => {
      try {
        const conversation = await Conversation.findById(conversationId)
          .populate('participants.user', 'firstName lastName');

        if (!conversation) {
          return socket.emit('error', { message: 'Conversation not found' });
        }

        // Get user info for typing indicator
        const user = conversation.participants.find(
          p => p.user._id.toString() === socket.userId
        );

        if (user) {
          // Emit to all other participants in the conversation
          socket.to(`conversation:${conversationId}`).emit('typing:start', {
            conversationId,
            userId: socket.userId,
            userName: `${user.user.firstName} ${user.user.lastName}`
          });
        }
      } catch (error) {
        console.error('Error handling typing:start:', error);
      }
    });

    /**
     * Handle typing stop event
     */
    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        conversationId,
        userId: socket.userId
      });
    });

    // ===== MESSAGE REACTIONS =====

    /**
     * Handle message reaction
     */
    socket.on('message:react', async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
          r => r.user.toString() === socket.userId && r.emoji === emoji
        );

        if (existingReaction) {
          // Remove reaction (toggle)
          message.reactions = message.reactions.filter(
            r => !(r.user.toString() === socket.userId && r.emoji === emoji)
          );
        } else {
          // Remove any previous reaction from this user first
          message.reactions = message.reactions.filter(
            r => r.user.toString() !== socket.userId
          );
          // Add new reaction
          message.reactions.push({
            user: socket.userId,
            emoji,
            createdAt: new Date()
          });
        }

        await message.save();

        // Broadcast reaction update to conversation
        io.to(`conversation:${message.conversation}`).emit('message:reaction', {
          messageId,
          reactions: message.reactions,
          userId: socket.userId,
          emoji
        });
      } catch (error) {
        console.error('Error handling message:react:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // ===== MESSAGE DELETION =====

    /**
     * Handle message deleted event (broadcast to others)
     */
    socket.on('message:deleted', async ({ messageId, conversationId, deleteForEveryone }) => {
      try {
        if (deleteForEveryone) {
          // Broadcast deletion to all participants
          io.to(`conversation:${conversationId}`).emit('message:deleted', {
            messageId,
            conversationId,
            deletedBy: socket.userId
          });
        }
      } catch (error) {
        console.error('Error handling message:deleted:', error);
      }
    });

    // ===== MESSAGE EDITING =====

    /**
     * Handle message edited event
     */
    socket.on('message:edited', async ({ messageId, conversationId, newText }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          return socket.emit('error', { message: 'Message not found' });
        }

        // Verify sender
        if (message.sender.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Not authorized' });
        }

        // Edit message (this uses the model method)
        await message.edit(newText);

        // Broadcast edit to conversation
        io.to(`conversation:${conversationId}`).emit('message:edited', {
          messageId,
          conversationId,
          text: message.text,
          isEdited: true,
          editedAt: message.editedAt
        });
      } catch (error) {
        console.error('Error handling message:edited:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // ===== PRESENCE UPDATES =====

    /**
     * Handle user presence update for conversations
     */
    socket.on('presence:update', async ({ conversationId, status }) => {
      try {
        socket.to(`conversation:${conversationId}`).emit('presence:update', {
          userId: socket.userId,
          conversationId,
          status,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error handling presence:update:', error);
      }
    });

    // ===== VOICE NOTE EVENTS =====

    /**
     * Handle voice note upload start
     */
    socket.on('voice:upload_start', ({ conversationId, duration }) => {
      socket.to(`conversation:${conversationId}`).emit('voice:upload_start', {
        userId: socket.userId,
        conversationId,
        duration
      });
    });

    /**
     * Handle voice note upload complete
     */
    socket.on('voice:upload_complete', ({ conversationId, messageId }) => {
      socket.to(`conversation:${conversationId}`).emit('voice:upload_complete', {
        userId: socket.userId,
        conversationId,
        messageId
      });
    });
  });

  console.log('Messaging socket handlers registered');
}

module.exports = { registerMessagingHandlers };
