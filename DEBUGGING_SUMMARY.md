# Frontend API Errors - Debugging Summary

## Date: October 17, 2025
## Issues: Posts Fetching Error & Matching Technicians Error

---

## 1. POSTS FETCHING ERROR ✅ FIXED

### Problem
- Frontend was unable to fetch posts from the API
- Backend returned 500 error: `TypeError: Cannot read properties of undefined (reading 'likes')`

### Root Cause
The Post model in MongoDB didn't always have the `engagement` object properly initialized. When the controller tried to access `post.engagement.likes.length`, it threw an error because `engagement` was `undefined` for some posts.

### Solution
Updated `/backend/src/controllers/post.controller.js` to use optional chaining and default values:

**Lines 77-81** (Engagement Score Calculation):
```javascript
// Before (BROKEN):
const engagementScore =
  (post.engagement.likes.length * likesWeight) +
  (post.comments.length * commentsWeight) +
  (post.sharesCount * sharesWeight) +
  (post.engagement.views * viewsWeight) +
  recencyBonus;

// After (FIXED):
const likesCount = post.engagement?.likes?.length || 0;
const commentsCount = post.comments?.length || 0;
const sharesCount = post.sharesCount || 0;
const viewsCount = post.engagement?.views || 0;

const engagementScore =
  (likesCount * likesWeight) +
  (commentsCount * commentsWeight) +
  (sharesCount * sharesWeight) +
  (viewsCount * viewsWeight) +
  recencyBonus;
```

**Lines 132-141** (User Flags):
```javascript
// Before (BROKEN):
postObj.isLiked = post.engagement.likes.some(id => id.toString() === userId);
postObj.isBookmarked = post.bookmarks.some(id => id.toString() === userId);
postObj.likesCount = post.engagement.likes.length;
postObj.commentsCount = post.comments.length;
postObj.views = post.engagement.views;

// After (FIXED):
postObj.isLiked = post.engagement?.likes?.some(id => id.toString() === userId) || false;
postObj.isBookmarked = post.bookmarks?.some(id => id.toString() === userId) || false;
postObj.likesCount = post.engagement?.likes?.length || 0;
postObj.commentsCount = post.comments?.length || 0;
postObj.views = post.engagement?.views || 0;
```

### Test Results
- ✅ API now returns `200 OK` status
- ✅ Posts are successfully fetched and returned
- ✅ No more undefined property errors

---

## 2. MATCHING TECHNICIANS ERROR

### Investigation Status
The matching API requires authentication. Need to verify:

1. **Frontend Configuration Issues**:
   - ❌ No `.env` file in frontend directory (only `.env.example` exists)
   - ⚠️ Frontend may not have correct `VITE_API_URL` configured
   - Default fallback: `http://localhost:5000/api/v1`

2. **Potential Issues**:
   - Missing authentication token in requests
   - CORS configuration may need verification
   - API endpoints may need authentication

### Current Status
- Backend server running on `http://localhost:5000` ✅
- MongoDB connected successfully ✅
- Matching routes registered: `/api/v1/matching/*` ✅

### Next Steps for Matching Error

1. **Create Frontend .env File**:
```bash
# Create .env file
cp /media/munen/muneneENT/PLP/MERN/Proj/frontend/.env.example \
   /media/munen/muneneENT/PLP/MERN/Proj/frontend/.env

# Update with correct values:
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

2. **Verify Authentication**:
   - Check if user is logged in
   - Verify JWT token in localStorage
   - Check axios interceptor is attaching token

3. **Check CORS Configuration**:
   - Verify `CLIENT_WEB_URL` in backend `.env` matches frontend URL
   - Current value: `http://localhost:3000`
   - Frontend likely running on port 5173 (Vite default) or 3000

4. **Test Matching API**:
```bash
# With authentication token
curl -X POST http://localhost:5000/api/v1/matching/find-technicians \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "serviceCategory":"plumbing",
    "location":{"coordinates":[36.8219,-1.2921],"address":"Nairobi"}
  }'
```

---

## 3. ADDITIONAL WARNINGS (Non-Critical)

### Duplicate Schema Indexes
```
Warning: Duplicate schema index on {"booking":1} found
Warning: Duplicate schema index on {"type":1} found
Warning: Duplicate schema index on {"status":1} found
Warning: Duplicate schema index on {"user":1} found
```

**Impact**: None (just warnings)
**Cause**: Indexes declared both via `index: true` and `schema.index()`
**Fix**: Remove duplicate index declarations in models (optional)

---

## 4. MISSING ENDPOINTS

### Explore Feed Endpoint
**Frontend Request**: `GET /api/v1/posts/explore`
**Backend**: ❌ Not implemented

**Issue**: Frontend `fetchExploreFeed` action calls `/posts/explore` but this endpoint doesn't exist in backend.

**Solutions**:
1. **Add endpoint to backend** (Recommended):
```javascript
// In post.routes.js
router.get('/explore', optionalAuth, getExploreFeed);

// In post.controller.js
exports.getExploreFeed = async (req, res) => {
  // Similar to getPosts but with different algorithm
  // Could show trending posts, posts from followed users, etc.
};
```

2. **Update frontend to use existing endpoint**:
```typescript
// In postSlice.ts - change fetchExploreFeed
const response = await axios.get('/posts', {
  params: { page, limit, sort: '-engagement.views' }, // Sort by views for "explore"
});
```

---

## 5. SERVER STATUS

### Backend (Port 5000) ✅
- Status: Running
- MongoDB: Connected
- Database: `ementech`
- Environment: development

### Processes
```bash
# Kill stuck processes on port 5000
lsof -ti:5000 | xargs kill -9

# Start backend
cd /media/munen/muneneENT/PLP/MERN/Proj/backend
npm run dev
```

---

## 6. QUICK FIXES CHECKLIST

### Immediate Actions Required

- [x] Fix posts engagement undefined error
- [ ] Create frontend `.env` file
- [ ] Verify frontend dev server port
- [ ] Update CORS configuration if needed
- [ ] Test matching API with valid auth token
- [ ] Add `/posts/explore` endpoint OR update frontend

### Testing Commands

```bash
# 1. Test Posts API
curl http://localhost:5000/api/v1/posts

# 2. Test Matching API (need auth token)
# First login and get token from response
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Then use token for matching
curl -X POST http://localhost:5000/api/v1/matching/find-technicians \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"serviceCategory":"plumbing","location":{"coordinates":[36.8219,-1.2921],"address":"Nairobi"}}'
```

---

## 7. FILES MODIFIED

1. `/media/munen/muneneENT/PLP/MERN/Proj/backend/src/controllers/post.controller.js`
   - Added optional chaining for `engagement` object
   - Added default values for undefined fields
   - Lines modified: 77-88, 132-141

---

## 8. RECOMMENDATIONS

### Short Term
1. ✅ **Fix posts error** - COMPLETED
2. 🔄 **Create frontend `.env`** - IN PROGRESS
3. 🔄 **Test matching with auth** - IN PROGRESS
4. ⏳ **Add explore endpoint** - PENDING

### Long Term
1. **Data Migration**: Ensure all existing posts have proper `engagement` structure
2. **Model Validation**: Add defaults in Post schema for `engagement` object
3. **Error Handling**: Add try-catch blocks around all engagement calculations
4. **Monitoring**: Add logging for undefined field access

### Post Schema Update Recommendation
```javascript
// In Post model
const PostSchema = new Schema({
  // ... other fields
  engagement: {
    likes: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
    views: { type: Number, default: 0 },
    shares: { type: [Schema.Types.ObjectId], ref: 'User', default: [] }
  },
  comments: { type: [CommentSchema], default: [] },
  bookmarks: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  sharesCount: { type: Number, default: 0 }
});
```

---

## Support Contact
For additional issues, check:
- Backend logs: Check nodemon output in terminal
- Frontend console: Open browser DevTools → Console tab
- Network tab: Check API request/response details

**Last Updated**: October 17, 2025
**Status**: Posts Fixed ✅ | Matching Under Investigation 🔄
