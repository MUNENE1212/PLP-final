import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addMessage, updateMessageStatus, updateMessageReaction, fetchConversations } from '@/store/slices/messagingSlice';
import socketService from '@/services/socket';
import { Message } from '@/types';

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { currentConversation } = useAppSelector((state) => state.messaging);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect socket
      socketService.connect(user._id);

      // Set up message listeners
      const handleNewMessage = (message: Message) => {
        console.log('New message received:', message);
        dispatch(addMessage(message));

        // Refresh conversations list to update unread counts
        dispatch(fetchConversations({ status: 'active' }));
      };

      const handleMessageDelivered = (data: { messageId: string; userId: string }) => {
        dispatch(updateMessageStatus({ messageId: data.messageId, status: 'delivered' }));
      };

      const handleMessageRead = (data: { messageId: string; userId: string }) => {
        dispatch(updateMessageStatus({ messageId: data.messageId, status: 'read' }));
      };

      const handleMessageReaction = (data: { messageId: string; reactions: any[] }) => {
        dispatch(updateMessageReaction(data));
      };

      const handleMessageDeleted = (data: { messageId: string; conversationId: string }) => {
        console.log('Message deleted:', data);
        // Handle message deletion
      };

      // Register event listeners
      socketService.onNewMessage(handleNewMessage);
      socketService.onMessageDelivered(handleMessageDelivered);
      socketService.onMessageRead(handleMessageRead);
      socketService.onMessageReaction(handleMessageReaction);
      socketService.onMessageDeleted(handleMessageDeleted);

      // Cleanup on unmount or logout
      return () => {
        socketService.offNewMessage(handleNewMessage);
        socketService.off('message:delivered', handleMessageDelivered);
        socketService.off('message:read', handleMessageRead);
        socketService.off('message:reaction', handleMessageReaction);
        socketService.off('message:deleted', handleMessageDeleted);
      };
    } else {
      // Disconnect socket when not authenticated
      socketService.disconnect();
    }
  }, [isAuthenticated, user, dispatch]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (currentConversation && socketService.isConnected()) {
      socketService.joinConversation(currentConversation._id);

      return () => {
        socketService.leaveConversation(currentConversation._id);
      };
    }
  }, [currentConversation]);

  return {
    isConnected: socketService.isConnected(),
    socket: socketService,
  };
};
