import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

// Types
export interface PostAuthor {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: string;
  rating?: {
    average: number;
    count: number;
  };
}

export interface PostReply {
  _id?: string;
  user: PostAuthor;
  text: string;
  createdAt: string;
}

export interface PostComment {
  _id: string;
  user: PostAuthor;
  text: string;
  likesCount: number;
  replies?: PostReply[];
  createdAt: string;
}

export interface Post {
  _id: string;
  author: PostAuthor;
  caption: string;
  type: 'text' | 'image' | 'video' | 'portfolio' | 'tip' | 'question' | 'achievement';
  media: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  }>;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  views: number;
  comments: PostComment[];
  hashtags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
  isPinned: boolean;
  sharedPost?: Post;
  shareCaption?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  caption: string;
  type?: string;
  media?: any[];
  visibility?: 'public' | 'followers' | 'private';
}

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const initialState: PostState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  isCreating: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
};

// Async thunks
export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async (params: { page?: number; limit?: number; type?: string } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20, type } = params;
      const response = await axios.get('/posts', {
        params: { page, limit, type },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feed');
    }
  }
);

export const fetchExploreFeed = createAsyncThunk(
  'posts/fetchExploreFeed',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20 } = params;
      const response = await axios.get('/posts/explore', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch explore feed');
    }
  }
);

export const fetchBookmarkedPosts = createAsyncThunk(
  'posts/fetchBookmarkedPosts',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 20 } = params;
      const response = await axios.get('/posts/bookmarked', {
        params: { page, limit },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookmarked posts');
    }
  }
);

export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: CreatePostData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/posts', postData);
      toast.success('Post created successfully!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }: { postId: string; postData: Partial<CreatePostData> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/posts/${postId}`, postData);
      toast.success('Post updated successfully!');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/posts/${postId}/like`);
      return { postId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, text }: { postId: string; text: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/posts/${postId}/comment`, { text });
      toast.success('Comment added!');
      return { postId, ...response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add comment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addReply = createAsyncThunk(
  'posts/addReply',
  async ({ postId, commentId, text }: { postId: string; commentId: string; text: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/posts/${postId}/comment/${commentId}/reply`, { text });
      toast.success('Reply added!');
      return { postId, commentId, ...response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add reply';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const toggleCommentLike = createAsyncThunk(
  'posts/toggleCommentLike',
  async ({ postId, commentId }: { postId: string; commentId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/posts/${postId}/comment/${commentId}/like`);
      return { postId, commentId, ...response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to toggle comment like';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteComment = createAsyncThunk(
  'posts/deleteComment',
  async ({ postId, commentId }: { postId: string; commentId: string }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/posts/${postId}/comment/${commentId}`);
      toast.success('Comment deleted');
      return { postId, commentId, ...response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete comment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const sharePost = createAsyncThunk(
  'posts/sharePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/posts/${postId}/share`);
      toast.success('Post shared!');
      return { postId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share post');
    }
  }
);

export const toggleBookmark = createAsyncThunk(
  'posts/toggleBookmark',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`/posts/${postId}/bookmark`);
      return { postId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bookmark post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/posts/${postId}`);
      toast.success('Post deleted successfully');
      return postId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Slice
const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updatePostInState: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch feed
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          pages: action.payload.pages || 0,
        };
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch explore feed
    builder
      .addCase(fetchExploreFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExploreFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts;
      })
      .addCase(fetchExploreFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch bookmarked posts
    builder
      .addCase(fetchBookmarkedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookmarkedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.posts || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 20,
          total: action.payload.total || 0,
          pages: action.payload.pages || 0,
        };
      })
      .addCase(fetchBookmarkedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single post
    builder
      .addCase(fetchPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload.post;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create post
    builder
      .addCase(createPost.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isCreating = false;
        state.posts.unshift(action.payload.post);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update post
    builder
      .addCase(updatePost.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isCreating = false;
        const postIndex = state.posts.findIndex((p) => p._id === action.payload.post._id);
        if (postIndex !== -1) {
          state.posts[postIndex] = action.payload.post;
        }
        if (state.currentPost?._id === action.payload.post._id) {
          state.currentPost = action.payload.post;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Toggle like
    builder.addCase(toggleLike.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.isLiked = action.payload.isLiked;
        post.likesCount = action.payload.likesCount;
      }
    });

    // Add comment
    builder.addCase(addComment.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.comments.push(action.payload.comment);
        post.commentsCount = action.payload.commentsCount;
      }
    });

    // Add reply to comment
    builder.addCase(addReply.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        const comment = post.comments.find((c) => c._id === action.payload.commentId);
        if (comment) {
          if (!comment.replies) {
            comment.replies = [];
          }
          comment.replies.push(action.payload.reply);
        }
      }
    });

    // Toggle comment like
    builder.addCase(toggleCommentLike.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        const comment = post.comments.find((c) => c._id === action.payload.commentId);
        if (comment) {
          comment.likesCount = action.payload.likesCount;
        }
      }
    });

    // Delete comment
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.comments = post.comments.filter((c) => c._id !== action.payload.commentId);
        post.commentsCount = action.payload.commentsCount;
      }
    });

    // Share post
    builder.addCase(sharePost.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.sharesCount = action.payload.sharesCount;
      }
      // Add the new shared post to the beginning of the feed
      if (action.payload.sharedPost) {
        state.posts.unshift(action.payload.sharedPost);
      }
    });

    // Toggle bookmark
    builder.addCase(toggleBookmark.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.isBookmarked = action.payload.bookmarked;
      }
    });

    // Delete post
    builder.addCase(deletePost.fulfilled, (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
    });
  },
});

export const { clearError, updatePostInState } = postSlice.actions;
export default postSlice.reducer;
