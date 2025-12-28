import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X } from 'lucide-react';
import { useVoiceSearch } from '@/hooks/useVoiceSearch';
import { cn } from '@/lib/utils';

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceSearchButton = ({
  onResult,
  placeholder = "Tap to speak...",
  className
}: VoiceSearchButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceSearch({
    onResult: (result) => {
      onResult(result);
      setIsExpanded(false);
    }
  });

  const handleToggle = () => {
    if (!isSupported) {
      alert('Voice search is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      setIsExpanded(true);
      startListening();
    }
  };

  const handleClose = () => {
    if (isListening) {
      stopListening();
    }
    setIsExpanded(false);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Voice Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className={cn(
          'relative p-4 rounded-full transition-all shadow-lg',
          isListening
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-primary-500 hover:bg-primary-600'
        )}
        aria-label={isListening ? 'Stop listening' : 'Start voice search'}
      >
        {isListening ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}

        {/* Ripple effect when listening */}
        {isListening && (
          <>
            <motion.div
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-red-500 opacity-50"
            />
            <motion.div
              animate={{ scale: [1, 2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="absolute inset-0 rounded-full bg-red-500 opacity-30"
            />
          </>
        )}
      </motion.button>

      {/* Transcript Display */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-4 w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl p-4 border border-neutral-200 dark:border-neutral-800 z-50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'p-2 rounded-full',
                  isListening
                    ? 'bg-red-100 dark:bg-red-900'
                    : 'bg-primary-100 dark:bg-primary-900'
                )}>
                  <Mic className={cn(
                    'h-4 w-4',
                    isListening
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-primary-600 dark:text-primary-400'
                  )} />
                </div>
                <div>
                  <p className="font-medium text-sm text-neutral-900 dark:text-white">
                    {isListening ? 'Listening...' : 'Voice Search'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isListening ? 'Speak now' : 'Tap microphone to start'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            </div>

            {transcript ? (
              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">{transcript}</p>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                <p className="text-sm text-neutral-400 italic">
                  "{placeholder}"
                </p>
              </div>
            )}

            {/* Audio wave animation */}
            {isListening && (
              <div className="mt-3 flex items-center gap-1 h-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 24, 8] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.1
                    }}
                    className="flex-1 bg-primary-500 rounded-full"
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
