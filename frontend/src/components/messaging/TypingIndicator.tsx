/**
 * TypingIndicator Component
 *
 * Shows when another user is typing in the conversation.
 * Displays animated dots with the user's name.
 *
 * @module components/messaging/TypingIndicator
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  userName?: string;
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName = 'Someone',
  className,
}) => {
  return (
    <div className={cn(
      'flex items-center gap-2 px-4 py-2 text-sm',
      'text-gray-500 dark:text-gray-400',
      className
    )}>
      {/* Animated dots */}
      <div className="flex items-center gap-1">
        <span
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '600ms' }}
        />
        <span
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: '150ms', animationDuration: '600ms' }}
        />
        <span
          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: '300ms', animationDuration: '600ms' }}
        />
      </div>

      {/* User name */}
      <span className="italic">
        {userName} is typing...
      </span>
    </div>
  );
};

export default TypingIndicator;
