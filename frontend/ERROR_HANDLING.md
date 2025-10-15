# Error Handling Guide

This document describes the comprehensive error handling system implemented in the BaiTech frontend application.

## Overview

The application implements multiple layers of error handling to ensure graceful degradation and provide clear feedback to users:

1. **ErrorBoundary** - Catches React component errors
2. **Alert Component** - Displays inline error messages
3. **Error Pages** - Dedicated pages for 404 and 500 errors
4. **Axios Interceptors** - Handles API errors globally
5. **Loading States** - Visual feedback during async operations

## Components

### 1. ErrorBoundary (`/src/components/ErrorBoundary.tsx`)

Catches unhandled errors in React component tree and prevents blank screens.

**Features:**
- Displays user-friendly error UI
- Shows technical details in development mode
- Provides "Try Again" and "Go Home" actions
- Logs errors to console (can be extended to error reporting service)

**Usage:**
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

Already implemented in `/src/App.tsx` - wraps entire application.

### 2. Alert Component (`/src/components/ui/Alert.tsx`)

Displays inline alerts for form validation and contextual errors.

**Props:**
- `variant`: 'error' | 'success' | 'warning' | 'info'
- `title`: Optional alert title
- `message`: String or array of error messages
- `onClose`: Optional close handler
- `className`: Additional CSS classes

**Usage:**
```tsx
import Alert from '@/components/ui/Alert';

// Single message
<Alert variant="error" message="Email is required" />

// Multiple messages
<Alert
  variant="error"
  title="Validation Failed"
  message={['Email is required', 'Password must be 8 characters']}
  onClose={() => clearError()}
/>
```

### 3. Error Pages

#### NotFound (`/src/pages/NotFound.tsx`)
- Displays for 404 errors
- Provides navigation back home or to previous page
- Shows contact support link

#### ErrorPage (`/src/pages/ErrorPage.tsx`)
- Generic error page for server errors
- Accepts custom error message and status code
- Provides retry and home navigation

**Usage:**
```tsx
import NotFound from '@/pages/NotFound';
import ErrorPage from '@/pages/ErrorPage';

// In routes
<Route path="*" element={<NotFound />} />

// Programmatically
<ErrorPage error="Server unavailable" statusCode={503} />
```

### 4. Loading Component (`/src/components/ui/Loading.tsx`)

Provides loading states during async operations.

**Props:**
- `size`: 'sm' | 'md' | 'lg'
- `text`: Optional loading text
- `fullScreen`: Boolean for full-screen overlay
- `className`: Additional CSS classes

**Usage:**
```tsx
import Loading from '@/components/ui/Loading';

// Inline loading
{isLoading && <Loading size="sm" text="Loading..." />}

// Full screen loading
<Loading fullScreen text="Processing your request..." />
```

## Axios Error Handling

### Global Interceptor (`/src/lib/axios.ts`)

Automatically handles all API errors with appropriate user feedback.

**Error Extraction:**
- Handles multiple error response formats
- Extracts messages from various backend formats
- Joins multiple validation errors intelligently

**Status Code Handling:**
- **401**: Clears auth, redirects to login
- **403**: Permission denied
- **404**: Resource not found
- **400/422**: Validation errors
- **429**: Rate limiting
- **500/502/503**: Server errors

**Features:**
- Automatic toast notifications (except auth endpoints)
- Auth endpoints show errors in forms only
- Network error detection
- Clean error message extraction

### Redux Error Handling

**Auth Slice Error Handling:**
```typescript
// In async thunks
try {
  // API call
} catch (error: any) {
  const message = error.response?.data?.message || 'Default error';
  return rejectWithValue(message);
}
```

**Clear Errors:**
```typescript
import { clearError } from '@/store/slices/authSlice';

// Clear error manually
dispatch(clearError());
```

## Form Error Handling

### Validation

**Client-side (Zod):**
```typescript
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be 8+ characters'),
});
```

**Server-side:**
- Express-validator in routes
- Mongoose schema validation
- Both return consistent error format

### Display Errors

**Field-level:**
```tsx
<Input
  label="Email"
  error={errors.email?.message}
  {...register('email')}
/>
```

**Form-level:**
```tsx
{error && (
  <Alert
    variant="error"
    message={error}
    onClose={() => dispatch(clearError())}
  />
)}
```

## Best Practices

### 1. Always Wrap Components with ErrorBoundary
```tsx
// Good
<ErrorBoundary>
  <ComplexComponent />
</ErrorBoundary>

// Better - Already done in App.tsx
```

### 2. Show Loading States
```tsx
// Good
{isLoading ? <Loading /> : <YourContent />}

// Better - Button with loading
<Button isLoading={isLoading}>Submit</Button>
```

### 3. Handle All Async Operations
```tsx
// Good
try {
  await apiCall();
} catch (error) {
  // Handle error
}

// Better - Use Redux thunks with error handling
const result = await dispatch(someAction());
if (someAction.rejected.match(result)) {
  // Handle rejection
}
```

### 4. Provide Clear Error Messages
```tsx
// Bad
message: 'Error'

// Good
message: 'Failed to save user profile'

// Better
message: 'Failed to save user profile. Please check your internet connection and try again.'
```

### 5. Allow Error Dismissal
```tsx
// Good
<Alert
  message={error}
  onClose={() => clearError()}
/>
```

## Testing Error Scenarios

### 1. Network Errors
```bash
# Stop backend
# Try any API operation
```

### 2. Validation Errors
```bash
# Try registering with invalid data
# Email: "invalid"
# Password: "weak"
```

### 3. Authentication Errors
```bash
# Login with wrong credentials
# Access protected route without auth
```

### 4. Component Errors
```tsx
// Temporarily introduce error in component
throw new Error('Test error');
```

## Error Reporting (Future)

To integrate with error reporting service (Sentry, LogRocket, etc.):

**1. Update ErrorBoundary:**
```typescript
componentDidCatch(error: Error, errorInfo: ErrorInfo) {
  // Log to service
  logErrorToService(error, errorInfo);
}
```

**2. Update Axios Interceptor:**
```typescript
catch (error) {
  logErrorToService(error);
  // ... existing handling
}
```

## Troubleshooting

### Error: "Objects are not valid as a React child"
**Cause:** Trying to render object instead of string
**Fix:** Use error.message or JSON.stringify(error)

### Error: Blank screen on error
**Cause:** Missing ErrorBoundary
**Fix:** Wrap component with ErrorBoundary

### Error: No error message shown
**Cause:** Error not in expected format
**Fix:** Check extractErrorMessage function in axios.ts

### Error: Multiple toast notifications
**Cause:** Error shown in both toast and form
**Fix:** Auth endpoints excluded from toasts by default

## Summary

The error handling system ensures:
- ✅ No blank screens
- ✅ Clear user feedback
- ✅ Graceful degradation
- ✅ Consistent error display
- ✅ Development-friendly debugging
- ✅ Production-ready error handling

All errors are caught, logged, and displayed appropriately to users.
