import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMessages,
  sendMessage,
  markAsRead,
  addReaction,
  deleteMessage,
} from '@/store/slices/messagingSlice';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Conversation } from '@/types';

interface ChatWindowProps {
  conversation: Conversation | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation }) => {
  const dispatch = useAppDispatch();
  const { messages, isLoadingMessages, isSending, pagination } = useAppSelector(
    (state) => state.messaging
  );
  const { user } = useAppSelector((state) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation) {
      // Fetch messages for this conversation
      dispatch(fetchMessages({ conversationId: conversation._id, page: 1 }));

      // Mark messages as read
      dispatch(markAsRead(conversation._id));
    }
  }, [conversation, dispatch]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (data: { text?: string; type: 'text' }) => {
    if (!conversation || !data.text) return;

    await dispatch(
      sendMessage({
        conversation: conversation._id,
        type: data.type,
        text: data.text,
      })
    );

    scrollToBottom();
  };

  const handleReact = (messageId: string, emoji: string) => {
    dispatch(addReaction({ messageId, emoji }));
  };

  const handleDeleteMessage = (messageId: string, forEveryone: boolean = false) => {
    dispatch(deleteMessage({ messageId, forEveryone }));
  };

  const getOtherParticipantName = (): string => {
    if (!conversation) return '';

    if (conversation.name) return conversation.name;

    if (conversation.type === 'booking') {
      const bookingId = typeof conversation.booking === 'string'
        ? conversation.booking
        : conversation.booking?._id || '';
      return `Booking #${bookingId.slice(-6)}`;
    }

    // For direct conversations, would show other participant's name
    // This requires populated participant data
    return 'Conversation';
  };

  const loadMoreMessages = () => {
    if (conversation && pagination.hasMore && !isLoadingMessages) {
      dispatch(
        fetchMessages({
          conversationId: conversation._id,
          page: pagination.currentPage + 1,
        })
      );
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
        <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
        <p className="text-center">Choose a conversation from the list to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Conversation Avatar/Icon */}
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
              {conversation.type === 'booking' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/>
                </svg>
              ) : (
                getOtherParticipantName()[0]
              )}
            </div>

            {/* Conversation Info */}
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">{getOtherParticipantName()}</h2>
              <div className="flex items-center gap-2">
                {conversation.type === 'booking' && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Booking
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {conversation.settings.allowCalls && (
              <>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Voice call">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </button>
                <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="Video call">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </button>
              </>
            )}

            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" title="More options">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {/* Load More Button */}
        {pagination.hasMore && !isLoadingMessages && (
          <div className="text-center mb-4">
            <button
              onClick={loadMoreMessages}
              className="px-4 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg hover:bg-gray-50 dark:bg-gray-900 transition-colors"
            >
              Load older messages
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoadingMessages && pagination.currentPage === 1 && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Messages */}
        {!isLoadingMessages && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            <p>No messages yet</p>
            <p className="text-sm mt-1">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isOwn = typeof message.sender === 'object'
                ? message.sender._id === user?._id
                : message.sender === user?._id;

              const showAvatar = index === 0 ||
                (typeof messages[index - 1].sender === 'object' && typeof message.sender === 'object'
                  ? (messages[index - 1].sender as any)._id !== (message.sender as any)._id
                  : messages[index - 1].sender !== message.sender);

              return (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  onReact={(emoji) => handleReact(message._id, emoji)}
                  onDelete={() => handleDeleteMessage(message._id, false)}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isSending || conversation.settings.onlyAdminsCanSend}
        placeholder={
          conversation.settings.onlyAdminsCanSend
            ? 'Only admins can send messages'
            : 'Type a message...'
        }
      />
    </div>
  );
};

export default ChatWindow;
