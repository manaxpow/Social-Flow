# UserProfile Page Implementation - Complete Documentation

## 📋 Overview
This implementation provides a production-ready Facebook-style profile page with advanced features including cloud uploads, optimistic updates, and race condition protection.

## 🏗️ Architecture

### Component Structure
```
components/profile/
├── profile-header.tsx       # Cover, Avatar, Actions, User Info
├── intro-card.tsx           # User bio and details
├── create-post-card.tsx      # Post creation with cloud upload
├── media-gallery.tsx         # 3-column photo grid
├── post-list.tsx            # Posts container
└── post-item.tsx            # Post wrapper
```

### Hooks Structure
```
hooks/
├── useUpload.ts              # Cloudinary upload logic
├── useDraftPost.ts          # localStorage persistence
└── queries/
    └── useProfileQueries.ts # React Query hooks
```

## ✨ Key Features Implemented

### 1. Cloudinary Upload Strategy
**File**: `hooks/useUpload.ts`

- Direct browser-to-Cloudinary upload (unsigned)
- Environment-based configuration
- File validation (type, size max 10MB)
- Progress tracking
- Error handling
- Public ID extraction for deletion

**Environment Variables Required**:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### 2. Draft Persistence
**File**: `hooks/useDraftPost.ts`

- Auto-save to localStorage
- 24-hour expiry
- Restore on component mount
- Clear after successful post
- Protects against page refresh data loss

### 3. Optimistic Updates
**File**: `hooks/queries/useProfileQueries.ts`

**Create Post Flow**:
1. User clicks "Đăng" (Post)
2. Cancel outgoing queries (`cancelQueries`)
3. Snapshot previous state
4. Insert optimistic post into cache immediately
5. Send API request
6. If success → Update with real data
7. If error → Rollback to previous state

**Delete Post Flow**:
1. User confirms deletion
2. Cancel outgoing queries
3. Remove post from cache immediately
4. Send API request
5. If success → Refetch for consistency
6. If error → Rollback to previous state

### 4. Race Condition Protection
**File**: `pages/client/profile.page.tsx`

```typescript
useEffect(() => {
  return () => {
    // Cancel all queries when userId changes or component unmounts
    queryClient.cancelQueries({ queryKey: ["profile", selectedUserId] });
    queryClient.cancelQueries({ queryKey: ["posts", selectedUserId] });
  };
}, [userId, selectedUserId, queryClient]);
```

**Problem Solved**: When switching between profiles rapidly, old requests could overwrite new data.

### 5. Smart Media Gallery
**File**: `components/profile/media-gallery.tsx`

- **aspect-square** + **object-cover** for uniform grid
- Cloudinary transformations: `c_fill,w_300,h_300,q_80,f_auto`
- Hover overlay with stats
- Display first 9 photos
- Optimized image URLs

### 6. Facebook-Style Layout
**File**: `pages/client/profile.page.tsx`

```
┌──────────────────────────────────────┐
│  ProfileHeader (Full width)          │
├─────────────┬──────────────────────────┤
│  Sidebar    │  Timeline              │
│  (Sticky)   │                        │
│             │  CreatePostCard         │
│  IntroCard  │  ───────────────────── │
│             │                        │
│  MediaGallery│  PostList              │
│  (9 photos) │    - PostItem          │
│             │    - PostItem          │
│             │    - ...               │
└─────────────┴──────────────────────────┘
```

**Responsive**:
- Mobile: Single column
- Tablet: Single column
- Desktop (lg+): 2 columns (1:2 ratio)

## 🎨 UI Components

### ProfileHeader
- Cover image (16:9 aspect ratio)
- Avatar overlapping 50% of cover height
- User name, username, bio
- Metadata: location, website, join date
- Stats: following, followers
- Skeleton loading states

### IntroCard
- Bio display
- Work, location, website, join date
- Icon-enhanced fields
- Skeleton loading

### CreatePostCard
- Facebook-style trigger button
- Modal with full editor
- Drag & drop image upload
- Cloudinary preview
- Progress indicator
- Draft persistence
- Optimistic UI

### MediaGallery
- 3-column grid
- Uniform square aspect ratio
- Cloudinary optimizations
- Hover stats overlay
- "See all" link

### PostList & PostItem
- Reuses existing PostCard
- Empty state handling
- Skeleton loading
- Delete functionality

## 🔧 Technical Details

### Cloudinary Transformations
```typescript
// Gallery (thumbnails)
/upload/c_fill,w_300,h_300,q_80,f_auto/

// Timeline (full size)
/upload/c_fill,w_600,q_80,f_auto/

// Avatar
/upload/c_fill,h_200,w_200/
```

### React Query Keys
```typescript
profileKeys.detail(userId)     // User profile data
postsKeys.userPosts(userId, page, size)  // User posts
```

### Mutation Lifecycle
1. **onMutate**: Cancel queries, snapshot state, update optimistically
2. **onError**: Rollback to snapshot, show error toast
3. **onSuccess**: Show success toast
4. **onSettled**: Invalidate queries to sync with server

## 📱 Responsive Design

### Breakpoints
- **Mobile (< 640px)**: Single column
- **Tablet (640-1024px)**: Single column
- **Desktop (> 1024px)**: 2 columns

### Sticky Sidebar
```css
sticky top-6  /* Sticks to viewport with offset */
```

## 🚀 Usage

### Setup Environment
```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your Cloudinary credentials
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```

## 🧪 Testing Checklist

### Functionality
- [x] Profile header displays correctly
- [x] Create post with text only
- [x] Create post with image
- [x] Image uploads to Cloudinary
- [x] Draft persists on refresh
- [x] Draft clears after posting
- [x] Delete post works
- [x] Optimistic updates visible
- [x] Rollback on error
- [x] Race conditions handled
- [x] Media gallery displays photos
- [x] Responsive layout works

### Edge Cases
- [x] Network error during upload
- [x] File size > 10MB rejected
- [x] Non-image files rejected
- [x] Empty draft cleared on mount
- [x] Expired draft ignored
- [x] Profile switch cancels queries
- [x] Multiple rapid posts handled

## 🎯 Performance Optimizations

1. **Image Optimization**
   - Cloudinary transformations reduce bandwidth
   - Lazy loading with aspect-ratio
   - Progressive loading

2. **Query Caching**
   - 5-minute stale time for profile
   - 2-minute stale time for posts
   - Optimistic updates reduce perceived latency

3. **Draft Persistence**
   - Local storage prevents data loss
   - 24-hour expiry prevents stale data

4. **Race Condition Protection**
   - Query cancellation prevents overwrites
   - Proper cleanup on unmount

## 🔐 Security Considerations

1. **Unsigned Upload Preset**
   - Uses unsigned preset (no API keys in frontend)
   - Backend should validate media ownership
   - Consider signed uploads for production

2. **File Validation**
   - Type checking on client
   - Size limits enforced
   - Server-side validation required

## 📊 Data Flow

### Create Post Flow
```
User Input → Draft (localStorage) 
         ↓
Upload to Cloudinary → Get secure_url, public_id
         ↓
Send to Backend → { content, mediaUrl, publicId }
         ↓
Optimistic Update → Cache updated immediately
         ↓
Server Response → Real data replaces optimistic
```

### Profile Switch Flow
```
Navigate to Profile → userId changes
         ↓
Cancel Previous Queries → Prevent race conditions
         ↓
Fetch New Data → Profile + Posts
         ↓
Update UI → React Query manages state
```

## 🐛 Known Issues & Future Improvements

### Current Limitations
1. Cloudinary deletion requires backend signature
2. Draft persistence is per-browser (no sync)
3. Infinite scroll not implemented (pagination only)
4. No video support (images only)

### Future Enhancements
1. **Real-time Updates**: SignalR for live posts
2. **Image Editor**: Crop/filter before upload
3. **Multiple Images**: Support for photo albums
4. **Video Support**: Video uploads and playback
5. **Story Feature**: Instagram-style stories
6. **Advanced Search**: Search within user posts

## 📝 Code Quality

### TypeScript
- Strict typing throughout
- Proper interfaces for all data structures
- Type-safe React Query hooks

### React Best Practices
- Custom hooks for logic reuse
- Proper cleanup with useEffect
- Memoization where needed
- Component composition

### Performance
- React Query for data fetching
- Optimistic updates for UX
- Image optimization
- Proper key management

## 🎓 Learning Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_images)
- [React Dropzone](https://react-dropzone.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 👨‍💻 Developer Notes

### Local Development
1. Set up Cloudinary account
2. Create unsigned upload preset
3. Update .env file
4. Run `pnpm dev`

### Backend Integration
Ensure backend accepts:
```json
{
  "content": "string",
  "mediaUrl": "string (optional)",
  "publicId": "string (optional)"
}
```

### Deployment
- Set environment variables in production
- Configure CORS for Cloudinary
- Enable image optimization
- Set up CDN for static assets

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and TanStack Query**