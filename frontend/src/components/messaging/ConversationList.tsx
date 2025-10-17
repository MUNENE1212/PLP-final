import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchConversations, setCurrentConversation } from '@/store/slices/messagingSlice';
import { Conversation, User } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  onSelectConversation?: (conversation: Conversation) => void;
  filterBookingsOnly?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
  filterBookingsOnly = false
}) => {
  const dispatch = useAppDispatch();
  const { conversations, isLoadingConversations, currentConversation } = useAppSelector(
    (state) => state.messaging
  );
  const { user } = useAppSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchConversations({ status: 'active' }));
  }, [dispatch]);

  const getOtherParticipant = (conversation: Conversation): User | null => {
    if (conversation.type === 'group') return null;

    // Find participant that is not the current user
    const otherParticipantSettings = conversation.participants.find(
      (p) => p.user !== user?._id
    );

    // For simplified version, return null. In production, need to populate user data
    return null;
  };

  const getConversationTitle = (conversation: Conversation): string => {
    if (conversation.name) return conversation.name;

    if (conversation.type === 'booking' && conversation.booking) {
      const bookingId = typeof conversation.booking === 'string'
        ? conversation.booking
        : conversation.booking._id;
      return `Booking #${bookingId.slice(-6)}`;
    }

    // For direct conversations, would show other participant's name
    return 'Conversation';
  };

  const getLastMessagePreview = (conversation: Conversation): string => {
    const lastMessage = conversation.lastMessage;

    if (!lastMessage) return 'No messages yet';

    if (typeof lastMessage === 'string') return 'New message';

    if (lastMessage.type === 'text') {
      return lastMessage.text || '';
    }

    return `[${lastMessage.type}]`;
  };

  const getUnreadCount = (conversation: Conversation): number => {
    const userParticipant = conversation.participants.find(
      (p) => p.user === user?._id
    );
    return userParticipant?.unreadCount || 0;
  };

  const filteredConversations = conversations.filter((conv) => {
    // Filter by booking-only if enabled
    if (filterBookingsOnly && conv.type !== 'booking') return false;

    // Filter by search query
    if (searchQuery) {
      const title = getConversationTitle(conv).toLowerCase();
      return title.includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch(setCurrentConversation(conversation));
    onSelectConversation?.(conversation);
  };

  if (isLoadingConversations) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-3">Messages</h2>

        {/* Search */}
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <svg
              className="w-16 h-16 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-center">
              {filterBookingsOnly
                ? 'No booking conversations yet'
                : searchQuery
                ? 'No conversations found'
                : 'No conversations yet'}
            </p>
            <p className="text-sm text-center mt-1">
              {filterBookingsOnly
                ? 'Start a booking to message with technicians'
                : 'Send a message to start a conversation'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conversation) => {
              const isActive = currentConversation?._id === conversation._id;
              const unreadCount = getUnreadCount(conversation);
              const title = getConversationTitle(conversation);
              const preview = getLastMessagePreview(conversation);
              const timeAgo = conversation.lastMessageAt
                ? formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })
                : '';

              return (
                <div
                  key={conversation._id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-primary/5 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Title and Badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {title}
                        </h3>
                        {conversation.type === 'booking' && (
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                            Booking
                          </span>
                        )}
                      </div>

                      {/* Last Message Preview */}
                      <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                        {preview}
                      </p>
                    </div>

                    {/* Time and Unread Count */}
                    <div className="flex flex-col items-end ml-3">
                      <span className="text-xs text-gray-500 mb-1">{timeAgo}</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full min-w-[20px] text-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
