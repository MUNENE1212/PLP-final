import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type {
  WorkGalleryImage,
  WorkGalleryState,
  ImageUploadFormData,
  WorkGalleryMetadata,
} from '@/types/workGallery';
import { IMAGE_CONSTRAINTS } from '@/types/workGallery';
import {
  getTechnicianGallery,
  getMyGallery,
  addWorkImage,
  updateWorkImage,
  deleteWorkImage,
  reorderGallery,
  setBeforeAfterPair,
} from '@/services/workGallery.service';

// Initial state
const initialState: WorkGalleryState = {
  images: [],
  currentTechnicianId: null,
  isLoading: false,
  isUploading: false,
  error: null,
  totalCount: 0,
  remainingSlots: IMAGE_CONSTRAINTS.MAX_IMAGES,
};

// ===== Async Thunks =====

/**
 * Fetch technician's gallery (public)
 */
export const fetchTechnicianGallery = createAsyncThunk(
  'workGallery/fetchTechnicianGallery',
  async (technicianId: string, { rejectWithValue }) => {
    try {
      const data = await getTechnicianGallery(technicianId);
      return {
        technicianId,
        images: data.images,
        totalCount: data.totalCount,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch gallery'
      );
    }
  }
);

/**
 * Fetch current user's gallery
 */
export const fetchMyGallery = createAsyncThunk(
  'workGallery/fetchMyGallery',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMyGallery();
      return {
        images: data.data,
        totalCount: data.totalCount,
        remainingSlots: data.remainingSlots,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your gallery'
      );
    }
  }
);

/**
 * Add work gallery image
 */
export const addGalleryImage = createAsyncThunk(
  'workGallery/addGalleryImage',
  async (formData: ImageUploadFormData, { rejectWithValue }) => {
    try {
      const response = await addWorkImage(formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add image'
      );
    }
  }
);

/**
 * Update work gallery image
 */
export const updateGalleryImage = createAsyncThunk(
  'workGallery/updateGalleryImage',
  async (
    { imageId, data }: { imageId: string; data: WorkGalleryMetadata },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateWorkImage(imageId, data);
      return {
        imageId,
        updatedImage: response.data,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update image'
      );
    }
  }
);

/**
 * Delete work gallery image
 */
export const removeGalleryImage = createAsyncThunk(
  'workGallery/removeGalleryImage',
  async (imageId: string, { rejectWithValue }) => {
    try {
      await deleteWorkImage(imageId);
      return imageId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete image'
      );
    }
  }
);

/**
 * Reorder gallery images
 */
export const reorderGalleryImages = createAsyncThunk(
  'workGallery/reorderGalleryImages',
  async (imageIds: string[], { rejectWithValue }) => {
    try {
      const response = await reorderGallery(imageIds);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reorder images'
      );
    }
  }
);

/**
 * Set before/after pair
 */
export const linkBeforeAfter = createAsyncThunk(
  'workGallery/linkBeforeAfter',
  async (
    { beforeId, afterId }: { beforeId: string; afterId: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await setBeforeAfterPair(beforeId, afterId);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to link before/after images'
      );
    }
  }
);

// ===== Slice =====

const workGallerySlice = createSlice({
  name: 'workGallery',
  initialState,
  reducers: {
    clearGallery: (state) => {
      state.images = [];
      state.currentTechnicianId = null;
      state.totalCount = 0;
      state.remainingSlots = IMAGE_CONSTRAINTS.MAX_IMAGES;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic update for reordering
    optimisticReorder: (state, action: PayloadAction<WorkGalleryImage[]>) => {
      state.images = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Technician Gallery
    builder
      .addCase(fetchTechnicianGallery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTechnicianGallery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.images = action.payload.images;
        state.currentTechnicianId = action.payload.technicianId;
        state.totalCount = action.payload.totalCount;
        state.remainingSlots = IMAGE_CONSTRAINTS.MAX_IMAGES - action.payload.totalCount;
      })
      .addCase(fetchTechnicianGallery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch My Gallery
    builder
      .addCase(fetchMyGallery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyGallery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.images = action.payload.images;
        state.totalCount = action.payload.totalCount;
        state.remainingSlots = action.payload.remainingSlots;
      })
      .addCase(fetchMyGallery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Gallery Image
    builder
      .addCase(addGalleryImage.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(addGalleryImage.fulfilled, (state, action) => {
        state.isUploading = false;
        if (action.payload) {
          state.images.push(action.payload);
          state.images.sort((a, b) => a.order - b.order);
          state.totalCount = state.images.length;
          state.remainingSlots = IMAGE_CONSTRAINTS.MAX_IMAGES - state.images.length;
        }
      })
      .addCase(addGalleryImage.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload as string;
      });

    // Update Gallery Image
    builder
      .addCase(updateGalleryImage.pending, (state) => {
        state.error = null;
      })
      .addCase(updateGalleryImage.fulfilled, (state, action) => {
        if (action.payload?.updatedImage) {
          const index = state.images.findIndex(
            (img) => img._id === action.payload!.imageId
          );
          if (index !== -1) {
            state.images[index] = action.payload.updatedImage;
          }
        }
      })
      .addCase(updateGalleryImage.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delete Gallery Image
    builder
      .addCase(removeGalleryImage.pending, (state) => {
        state.error = null;
      })
      .addCase(removeGalleryImage.fulfilled, (state, action) => {
        state.images = state.images.filter((img) => img._id !== action.payload);
        // Reorder remaining images
        state.images.forEach((img, idx) => {
          img.order = idx + 1;
        });
        state.totalCount = state.images.length;
        state.remainingSlots = IMAGE_CONSTRAINTS.MAX_IMAGES - state.images.length;
      })
      .addCase(removeGalleryImage.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Reorder Gallery Images
    builder
      .addCase(reorderGalleryImages.pending, (state) => {
        state.error = null;
      })
      .addCase(reorderGalleryImages.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.images = action.payload;
        }
      })
      .addCase(reorderGalleryImages.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Link Before/After
    builder
      .addCase(linkBeforeAfter.pending, (state) => {
        state.error = null;
      })
      .addCase(linkBeforeAfter.fulfilled, (state, action) => {
        if (action.payload?.before && action.payload?.after) {
          const beforeIndex = state.images.findIndex(
            (img) => img._id === action.payload.before._id
          );
          const afterIndex = state.images.findIndex(
            (img) => img._id === action.payload.after._id
          );
          if (beforeIndex !== -1) {
            state.images[beforeIndex] = action.payload.before;
          }
          if (afterIndex !== -1) {
            state.images[afterIndex] = action.payload.after;
          }
        }
      })
      .addCase(linkBeforeAfter.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearGallery, clearError, optimisticReorder } =
  workGallerySlice.actions;

export default workGallerySlice.reducer;

// ===== Selectors =====

/**
 * Get all work gallery images
 */
export const selectGalleryImages = (state: { workGallery: WorkGalleryState }) =>
  state.workGallery.images;

/**
 * Get loading state
 */
export const selectIsLoading = (state: { workGallery: WorkGalleryState }) =>
  state.workGallery.isLoading;

/**
 * Get uploading state
 */
export const selectIsUploading = (state: { workGallery: WorkGalleryState }) =>
  state.workGallery.isUploading;

/**
 * Get error state
 */
export const selectGalleryError = (state: { workGallery: WorkGalleryState }) =>
  state.workGallery.error;

/**
 * Get total count
 */
export const selectTotalCount = (state: { workGallery: WorkGalleryState }) =>
  state.workGallery.totalCount;

/**
 * Get remaining slots
 */
export const selectRemainingSlots = (
  state: { workGallery: WorkGalleryState }
) => state.workGallery.remainingSlots;

/**
 * Check if gallery is full
 */
export const selectIsGalleryFull = (state: {
  workGallery: WorkGalleryState;
}) => state.workGallery.totalCount >= IMAGE_CONSTRAINTS.MAX_IMAGES;
