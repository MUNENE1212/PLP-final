import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import matchingReducer from './slices/matchingSlice';
import bookingReducer from './slices/bookingSlice';
import messagingReducer from './slices/messagingSlice';
import userReducer from './slices/userSlice';
import dashboardReducer from './slices/dashboardSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    matching: matchingReducer,
    bookings: bookingReducer,
    messaging: messagingReducer,
    user: userReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
