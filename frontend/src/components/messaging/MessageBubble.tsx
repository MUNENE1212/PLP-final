import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Message, User } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { useAppSelector } from '@/store/hooks';
import { getRoleStyles, UserRole } from '@/utils/roleColors';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onReact?: (emoji: string) => void;
  onDelete?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onReact,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const sender = typeof message.sender === 'object' ? message.sender : null;

  const handleAvatarClick = () => {
    if (sender && sender._id) {
      navigate(`/profile/${sender._id}`);
    }
  };

  const getSenderName = () => {
    if (!sender) return 'User';
    return `${sender.firstName} ${sender.lastName}`;
  };

  const getTimeDisplay = () => {
    const messageTime = new Date(message.createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(messageTime, 'h:mm a');
    } else if (diffInHours < 168) {
      return formatDistanceToNow(messageTime, { addSuffix: true });
    } else {
      return format(messageTime, 'MMM d, h:mm a');
    }
  };

  const getStatusIcon = () => {
    if (!isOwn) return null;

    switch (message.status) {
      case 'sending':
        return (
          <svg className="w-3 h-3 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'sent':
        return (
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
        );
      case 'delivered':
      case 'read':
        return (
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
            <path d="M18.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0" opacity="0.7"/>
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  // Get role-based styling for sender
  const roleStyles = sender?.role ? getRoleStyles(sender.role as UserRole) : null;

  if (message.isDeleted) {
    return (
      <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] px-4 py-2 rounded-lg bg-gray-100 text-gray-500 italic`}>
          This message was deleted
        </div>
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div className="flex justify-center mb-4">
        <div className="px-4 py-2 bg-gray-100 text-gray-600 dark:text-gray-400 text-sm rounded-full">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => {
        setShowOptions(false);
        setShowReactions(false);
      }}
    >
      {/* Avatar for other users */}
      {!isOwn && showAvatar && sender && (
        <div className="mr-2 flex-shrink-0 cursor-pointer" onClick={handleAvatarClick}>
          {sender.profilePicture ? (
            <img
              src={sender.profilePicture}
              alt={getSenderName()}
              className={cn(
                "w-8 h-8 rounded-full object-cover transition-all ring-2",
                roleStyles ? `${roleStyles.ring.replace('ring-', 'ring-')}/30 hover:${roleStyles.ring}` : 'ring-gray-200 hover:ring-primary-500'
              )}
              title={`View ${getSenderName()}'s profile`}
            />
          ) : (
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ring-2",
              roleStyles ? `${roleStyles.bgDark} ${roleStyles.text} ${roleStyles.ring.replace('ring-', 'ring-')}/30 hover:${roleStyles.ring}` : 'bg-primary text-white ring-gray-200 hover:ring-primary-500'
            )}>
              {sender.firstName?.[0]}{sender.lastName?.[0]}
            </div>
          )}
        </div>
      )}

      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender name for group chats */}
        {!isOwn && sender && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span
              className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-primary-600 transition-colors"
              onClick={handleAvatarClick}
              title={`View ${getSenderName()}'s profile`}
            >
              {getSenderName()}
            </span>
            {roleStyles && (
              <span className={cn("text-[10px]", roleStyles.badge)}>
                {roleStyles.emoji}
              </span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className="relative">
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwn
                ? 'bg-primary text-white rounded-br-none'
                : 'bg-gray-100 text-gray-900 rounded-bl-none'
            }`}
          >
            {/* Text content */}
            {message.text && (
              <p className="whitespace-pre-wrap break-words">{message.text}</p>
            )}

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index}>
                    {attachment.type === 'image' && (
                      <img
                        src={attachment.url}
                        alt="Attachment"
                        className="max-w-full rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => window.open(attachment.url, '_blank')}
                      />
                    )}
                    {attachment.type === 'document' && (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 p-2 rounded ${
                          isOwn ? 'bg-primary-dark' : 'bg-white'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-sm">{attachment.filename || 'Document'}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Edited indicator */}
            {message.isEdited && (
              <span className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'} ml-2`}>
                (edited)
              </span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {Object.entries(
                message.reactions.reduce((acc: Record<string, number>, r) => {
                  acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => (
                <span
                  key={emoji}
                  className="px-2 py-0.5 bg-white dark:bg-gray-800 border rounded-full text-xs cursor-pointer hover:bg-gray-50 dark:bg-gray-900"
                  onClick={() => onReact?.(emoji)}
                >
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}

          {/* Quick reactions popup */}
          {showReactions && (
            <div
              className={`absolute z-10 ${
                isOwn ? 'right-0' : 'left-0'
              } bottom-full mb-1 bg-white border rounded-lg shadow-lg p-2 flex gap-1`}
            >
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact?.(emoji);
                    setShowReactions(false);
                  }}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time and status */}
        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs text-gray-500">{getTimeDisplay()}</span>
          {getStatusIcon()}
        </div>
      </div>

      {/* Options menu */}
      {showOptions && (
        <div className={`flex items-center gap-1 ml-2 ${isOwn ? 'order-first mr-2 ml-0' : ''}`}>
          <button
            onClick={() => setShowReactions(!showReactions)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            title="React"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </button>

          {isOwn && (
            <button
              onClick={onDelete}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              title="Delete"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
