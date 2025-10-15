import React, { useState } from 'react';
import { Image, Video, Smile, Send, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createPost } from '@/store/slices/postSlice';
import Button from '../ui/Button';
import { cn } from '@/lib/utils';

const CreatePost: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { isCreating } = useAppSelector((state) => state.posts);

  const [caption, setCaption] = useState('');
  const [type, setType] = useState<'text' | 'question' | 'tip' | 'portfolio'>('text');
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const postTypes = [
    { value: 'text', label: 'Update', icon: '📝', color: 'bg-blue-50 text-blue-600' },
    { value: 'question', label: 'Question', icon: '❓', color: 'bg-purple-50 text-purple-600' },
    { value: 'tip', label: 'Tip/Tutorial', icon: '💡', color: 'bg-yellow-50 text-yellow-600' },
    { value: 'portfolio', label: 'Portfolio', icon: '🎨', color: 'bg-green-50 text-green-600' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caption.trim()) return;

    const result = await dispatch(createPost({
      caption,
      type,
      visibility: 'public'
    }));

    if (createPost.fulfilled.match(result)) {
      setCaption('');
      setType('text');
      setShowTypeSelector(false);
    }
  };

  const getProfilePicture = () => {
    return user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=random`;
  };

  const selectedType = postTypes.find(t => t.value === type);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <img
          src={getProfilePicture()}
          alt={user?.firstName}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
        />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {user?.firstName} {user?.lastName}
          </h3>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-4">
        {/* Post Type Selector */}
        {showTypeSelector && (
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {postTypes.map((postType) => (
              <button
                key={postType.value}
                type="button"
                onClick={() => {
                  setType(postType.value as any);
                  setShowTypeSelector(false);
                }}
                className={cn(
                  'flex items-center justify-center space-x-2 rounded-lg border-2 p-3 text-sm font-medium transition-all',
                  type === postType.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="text-lg">{postType.icon}</span>
                <span>{postType.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected Type Badge */}
        {type !== 'text' && !showTypeSelector && (
          <div className="mb-3 flex items-center justify-between">
            <span className={cn('inline-flex items-center space-x-2 rounded-full px-3 py-1 text-sm font-medium', selectedType?.color)}>
              <span>{selectedType?.icon}</span>
              <span>{selectedType?.label}</span>
            </span>
            <button
              type="button"
              onClick={() => setType('text')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={`What's on your mind, ${user?.firstName}?`}
          className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20"
          rows={3}
          maxLength={2000}
        />

        {/* Character count */}
        <div className="mt-2 text-right text-xs text-gray-400">
          {caption.length}/2000
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="flex items-center space-x-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              <span className="text-lg">{selectedType?.icon}</span>
              <span className="hidden sm:inline">Type</span>
            </button>

            <button
              type="button"
              className="flex items-center space-x-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              disabled
              title="Coming soon"
            >
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Photo</span>
            </button>

            <button
              type="button"
              className="flex items-center space-x-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              disabled
              title="Coming soon"
            >
              <Video className="h-4 w-4" />
              <span className="hidden sm:inline">Video</span>
            </button>

            <button
              type="button"
              className="flex items-center space-x-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
              disabled
              title="Coming soon"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!caption.trim() || isCreating}
            isLoading={isCreating}
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Post</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
