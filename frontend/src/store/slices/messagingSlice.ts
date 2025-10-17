import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import { Message, Conversation } from '@/types';
import toast from 'react-hot-toast';

interface MessagingState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  unreadCount: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const initialState: MessagingState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,
  unreadCount: 0,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
  },
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'messaging/fetchConversations',
  async (filters?: { status?: string; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await axios.get(`/conversations?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch conversations';
      return rejectWithValue(message);
    }
  }
);

export const fetchConversation = createAsyncThunk(
  'messaging/fetchConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/conversations/${conversationId}`);
      return response.data.conversation;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch conversation';
      return rejectWithValue(message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'messaging/createConversation',
  async (
    data: {
      type: 'direct' | 'group' | 'booking' | 'support';
      participants: string[];
      booking?: string;
      name?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/conversations', data);
      toast.success('Conversation created successfully');
      return response.data.conversation;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create conversation';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messaging/fetchMessages',
  async (
    { conversationId, page = 1, limit = 50 }: { conversationId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.get(
        `/messages?conversation=${conversationId}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch messages';
      return rejectWithValue(message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messaging/sendMessage',
  async (
    data: {
      conversation: string;
      type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'booking';
      text?: string;
      media?: any;
      location?: any;
      booking?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/messages', data);
      return response.data.message;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send message';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const markAsRead = createAsyncThunk(
  'messaging/markAsRead',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await axios.put('/messages/mark-read', { conversation: conversationId });
      return conversationId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark messages as read';
      return rejectWithValue(message);
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messaging/deleteMessage',
  async ({ messageId, forEveryone = false }: { messageId: string; forEveryone?: boolean }, { rejectWithValue }) => {
    try {
      const url = forEveryone ? `/messages/${messageId}/everyone` : `/messages/${messageId}`;
      await axios.delete(url);
      toast.success(`Message deleted ${forEveryone ? 'for everyone' : 'for you'}`);
      return { messageId, forEveryone };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete message';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addReaction = createAsyncThunk(
  'messaging/addReaction',
  async ({ messageId, emoji }: { messageId: string; emoji: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/messages/${messageId}/reaction`, { emoji });
      return { messageId, reactions: response.data.reactions };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add reaction';
      return rejectWithValue(message);
    }
  }
);

// Slice
const messagingSlice = createSlice({
  name: 'messaging',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
      state.messages = [];
      state.pagination = { currentPage: 1, totalPages: 1, hasMore: false };
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      // Add message to messages array (from socket.io)
      state.messages.push(action.payload);

      // Update conversation's lastMessage and unreadCount
      const conversationIndex = state.conversations.findIndex(
        (c) => c._id === action.payload.conversation
      );
      if (conversationIndex !== -1) {
        state.conversations[conversationIndex].lastMessage = action.payload;
        state.conversations[conversationIndex].lastMessageAt = action.payload.createdAt;

        // Increment unread count if message is not from current user
        // This will be handled by socket event with proper user check
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: Message['status'] }>) => {
      const messageIndex = state.messages.findIndex((m) => m._id === action.payload.messageId);
      if (messageIndex !== -1) {
        state.messages[messageIndex].status = action.payload.status;
      }
    },
    updateMessageReaction: (state, action: PayloadAction<{ messageId: string; reactions: any[] }>) => {
      const messageIndex = state.messages.findIndex((m) => m._id === action.payload.messageId);
      if (messageIndex !== -1) {
        state.messages[messageIndex].reactions = action.payload.reactions;
      }
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = Math.max(0, state.unreadCount - action.payload);
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.pagination = { currentPage: 1, totalPages: 1, hasMore: false };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations = action.payload.conversations || action.payload.data || [];

        // Calculate total unread count
        state.unreadCount = state.conversations.reduce((total, conv) => {
          const userParticipant = conv.participants.find((p: any) => p.user === action.payload.userId);
          return total + (userParticipant?.unreadCount || 0);
        }, 0);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload as string;
      });

    // Fetch single conversation
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.currentConversation = action.payload;

        // Update in conversations list if exists
        const index = state.conversations.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.conversations[index] = action.payload;
        } else {
          state.conversations.unshift(action.payload);
        }
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload as string;
      });

    // Create conversation
    builder
      .addCase(createConversation.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations.unshift(action.payload);
        state.currentConversation = action.payload;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isLoadingConversations = false;
        state.error = action.payload as string;
      });

    // Fetch messages
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.isLoadingMessages = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoadingMessages = false;
        const { messages, page, pages } = action.payload;

        if (page === 1) {
          state.messages = messages;
        } else {
          // Prepend older messages (pagination)
          state.messages = [...messages, ...state.messages];
        }

        state.pagination = {
          currentPage: page,
          totalPages: pages,
          hasMore: page < pages,
        };
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoadingMessages = false;
        state.error = action.payload as string;
      });

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload);

        // Update conversation's last message
        if (state.currentConversation && state.currentConversation._id === action.payload.conversation) {
          state.currentConversation.lastMessage = action.payload;
          state.currentConversation.lastMessageAt = action.payload.createdAt;
        }

        // Update in conversations list
        const conversationIndex = state.conversations.findIndex(
          (c) => c._id === action.payload.conversation
        );
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].lastMessage = action.payload;
          state.conversations[conversationIndex].lastMessageAt = action.payload.createdAt;

          // Move conversation to top
          const conversation = state.conversations.splice(conversationIndex, 1)[0];
          state.conversations.unshift(conversation);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload as string;
      });

    // Mark as read
    builder
      .addCase(markAsRead.fulfilled, (state, action) => {
        const conversationId = action.payload;

        // Update messages in current conversation
        if (state.currentConversation?._id === conversationId) {
          state.messages.forEach((message) => {
            if (message.status !== 'read') {
              message.status = 'read';
            }
          });
        }

        // Update unread count in conversation
        const conversationIndex = state.conversations.findIndex((c) => c._id === conversationId);
        if (conversationIndex !== -1) {
          const conversation = state.conversations[conversationIndex];
          const userParticipant = conversation.participants[0]; // Simplified - needs proper user ID check
          if (userParticipant) {
            const oldUnreadCount = userParticipant.unreadCount;
            userParticipant.unreadCount = 0;
            state.unreadCount = Math.max(0, state.unreadCount - oldUnreadCount);
          }
        }
      });

    // Delete message
    builder
      .addCase(deleteMessage.fulfilled, (state, action) => {
        const { messageId, forEveryone } = action.payload;

        if (forEveryone) {
          // Remove message completely
          state.messages = state.messages.filter((m) => m._id !== messageId);
        } else {
          // Mark as deleted for user
          const messageIndex = state.messages.findIndex((m) => m._id === messageId);
          if (messageIndex !== -1) {
            state.messages[messageIndex].isDeleted = true;
          }
        }
      });

    // Add reaction
    builder
      .addCase(addReaction.fulfilled, (state, action) => {
        const { messageId, reactions } = action.payload;
        const messageIndex = state.messages.findIndex((m) => m._id === messageId);
        if (messageIndex !== -1) {
          state.messages[messageIndex].reactions = reactions;
        }
      });
  },
});

export const {
  setCurrentConversation,
  addMessage,
  updateMessageStatus,
  updateMessageReaction,
  incrementUnreadCount,
  decrementUnreadCount,
  resetUnreadCount,
  clearMessages,
  clearError,
} = messagingSlice.actions;

export default messagingSlice.reducer;
