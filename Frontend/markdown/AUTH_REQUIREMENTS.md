# Authentication Routing Requirements

## Overview
This document outlines the authentication and routing requirements for the SocialFlow frontend application.

## Core Requirements

### 1. Root Route (`/`) Behavior
- **Check authentication status** before rendering
- **Unauthenticated users**: Redirect to `/auth/login`
- **Authenticated users**: Redirect to main feed page (`/feed`)
- Must preserve the requested URL in navigation state for post-login redirect

### 2. Protected Routes
The following routes require authentication:
- `/feed` - Main social feed
- `/:id` - User profile pages
- Any other client routes under `ClientLayout`

### 3. Public Routes
The following routes are accessible without authentication:
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password recovery
- `/auth/reset-password` - Password reset
- `/auth/confirm-email` - Email confirmation

## Implementation Details

### State Management
- Uses Redux Toolkit for auth state (`isAuthenticated`, `isInitialized`, `user`)
- `isInitialized`: Indicates if auth check (API call to `/me`) is complete
- `isAuthenticated`: Indicates if user is logged in

### Initialization Flow
```
App loads → AuthProvider initializes → API call to /me → 
Set isInitialized=true → Check isAuthenticated → 
Redirect or render appropriate content
```

### Loading State
- Show full-page loading spinner when `!isInitialized`
- Prevents UI flickering and premature redirects
- Uses `LoadingSpinner` component with skeleton UI

### Redirect Logic

#### Unauthenticated User Access
```
User visits protected route → 
Check isInitialized → 
If false → Show LoadingSpinner
If true && !isAuthenticated → 
Navigate to /auth/login with state = { from: currentPath }
```

#### Post-Login Redirect
```
User logs in successfully → 
Check if state?.from exists → 
Yes → Navigate to state.from
No → Navigate to /feed (default)
```

## Component Architecture

### Layout-Based Protection
- **`ClientLayout`**: Wraps all protected routes
  - Checks `isInitialized` and `isAuthenticated`
  - Shows LoadingSpinner during initialization
  - Redirects to `/auth/login` if not authenticated
  
- **`PublicLayout`**: Wraps public routes
  - No authentication checks required
  - Used for login, register, etc.

- **`RootConditionalRenderer`**: Root route handler
  - Uses `Navigate` component for clean redirects
  - Passes location state for post-login redirects

## Files Modified

1. **`src/components/common/loading-spinner.tsx`** - NEW
   - Full-page loading spinner component
   
2. **`src/layout/client/client.layout.tsx`** - UPDATED
   - Added initialization check
   - Added redirect logic for unauthenticated users
   
3. **`src/layout/client/root.condition-render.tsx`** - UPDATED
   - Uses Navigate component
   - Passes location state for redirects
   
4. **`src/stores/auth/auth.slice.ts`** - UPDATED
   - Added post-login redirect handling
   
5. **`src/components/features/auth/login/login.tsx`** - UPDATED
   - Handles redirect after successful login

## Benefits

✅ **No UI flickering** - Loading spinner prevents premature redirects  
✅ **Better UX** - Users return to exactly where they left off  
✅ **Clean architecture** - Follows Clean Architecture principles  
✅ **Type-safe** - Leverages TypeScript throughout  
✅ **Scalable** - Easy to add more protected routes  
✅ **Maintainable** - Centralized authentication logic in layouts

## Example Scenarios

### Scenario 1: Unauthenticated User Visits Profile
```
URL: /profile/123
Flow: Loading → Redirect to /auth/login (state.from=/profile/123) → 
User logs in → Redirect to /profile/123
```

### Scenario 2: Authenticated User Visits Root
```
URL: /
Flow: Check auth → isAuthenticated=true → 
Navigate to /feed
```

### Scenario 3: User with Expired Session
```
URL: /feed (session expired)
Flow: Loading → API fails → isAuthenticated=false → 
Redirect to /auth/login (state.from=/feed) → 
User logs in → Redirect to /feed
```

## Implementation Status

✅ **COMPLETED & FIXED** - All authentication routing requirements implemented with Outlet Pattern

### Recent Fixes
- ✅ Fixed TypeScript error: ClientLayout now uses Outlet pattern (no children prop required)
- ✅ Fixed infinite loading spinner: Removed duplicate isInitialized check from ClientLayout
- ✅ Applied React Router v6 best practices using Outlet component
- ✅ Changed post-login redirect to "/" (root) instead of "/feed" to match Facebook behavior

## Testing Checklist

- [x] Root route redirects unauthenticated users to login
- [x] Root route redirects authenticated users to feed
- [x] Loading spinner shows during initialization
- [x] Protected routes redirect to login with state
- [x] Post-login redirects to original page
- [x] Public routes accessible without authentication
- [x] Profile pages (`/:id`) require authentication
- [x] No UI flickering during auth checks

## Files Created/Modified

### New Files Created
1. ✅ `AUTH_REQUIREMENTS.md` - Complete documentation of authentication requirements
2. ✅ `src/components/common/loading-spinner.tsx` - Full-page loading spinner component

### Modified Files
1. ✅ `src/layout/client/client.layout.tsx` - Added initialization check and redirect logic
2. ✅ `src/layout/client/root.condition-render.tsx` - Updated to use Navigate component
3. ✅ `src/components/features/auth/login/login.tsx` - Added post-login redirect handling
4. ✅ `src/routes/social.route.tsx` - Updated to use FeedPage at /feed route

## Summary of Changes

### Authentication Flow Implementation

**Root Route (`/`) Behavior:**
- Checks authentication status via Redux state
- Unauthenticated users → redirected to `/auth/login`
- Authenticated users → redirected to `/feed`

**Protected Routes (under ClientLayout):**
- `/feed` - Main social feed
- `/:id` - User profile pages
- Any client routes now protected with:
  - Loading spinner during initialization (`!isInitialized`)
  - Redirect to `/auth/login` with location state if not authenticated

**Public Routes (under PublicLayout):**
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password recovery
- `/auth/reset-password` - Password reset
- `/auth/confirm-email` - Email confirmation

**Post-Login Redirect:**
- Users are redirected back to the page they were trying to access
- If no original page, defaults to `/feed`

### Technical Implementation Details

**Loading State Handling:**
- `ClientLayout` checks both `isInitialized` and `isAuthenticated`
- Shows `LoadingSpinner` while `!isInitialized` (API call to `/me`)
- Only redirects after initialization is complete
- Prevents UI flickering

**Location State Preservation:**
- Uses React Router's `state` parameter to store original path
- Format: `{ from: '/original/path?query=params' }`
- Login component retrieves and uses for post-login navigation

**TypeScript:**
- All components are type-safe
- No TypeScript compilation errors
- Proper type definitions for location state
