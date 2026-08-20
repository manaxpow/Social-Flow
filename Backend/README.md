# SocialFlow Backend API Documentation

Hệ thống API RESTful của SocialFlow Backend được xây dựng trên nền tảng .NET 9 Web API theo kiến trúc Clean Architecture & CQRS Pattern (MediatR). Tài liệu này bao gồm danh sách đầy đủ tất cả các tính năng từ Architecture Feature Map.

---

## Tổng Quan & Cấu Hình

- **Base URL**: `/api` (Ví dụ: `http://localhost:5000/api` hoặc `https://api.socialflow.com/api`)
- **Authentication**: JWT Cookie Authentication (`accessToken` Cookie 15 phút, `refreshToken` Cookie 7 ngày)
- **Response Format**: Standard JSON response hoặc `ProblemDetails` (khi gặp lỗi)

---

## Bảng Quản Lý Tiến Độ Dự Án (Progress Tracking)

| Module / Feature | Priority | Status | Progress | Content / Target |
|---|---|---|---|---|
| Authentication (`/api/auth`) | `High` | `Completed` | 100% | Login, Register, JWT Cookies, Refresh Token, Reset Password, Confirm Email |
| User Profile (`/api/user`) | `High` | `Completed` | 100% | Xem & Cập nhật hồ sơ, Ảnh đại diện (Avatar), Ảnh bìa (Cover) |
| Posts & News Feed (`/api/post`) | `High` | `Completed` | 100% | CRUD Bài viết, Phân trang bài viết cá nhân, Đính kèm Media & Mention |
| Comments (`/api/comment`) | `High` | `Completed` | 100% | Cây bình luận đa cấp (Closure Table), Top-level comments, Replies, CRUD Comment |
| Reactions (`/api/reaction`) | `High` | `Completed` | 100% | Thả cảm xúc, Đổi loại cảm xúc & Gỡ cảm xúc cho Bài viết/Bình luận |
| Social Graph & Friendships (`/api/friendship`) | `High` | `Completed` | 100% | Danh sách bạn bè, Gửi/Nhận/Hủy lời mời kết bạn, Hủy kết bạn, Chặn người dùng |
| Media & Upload (`/api/media`) | `High` | `Completed` | 100% | Lấy chữ ký tải tệp Cloudinary (Setup Upload) & Xóa tệp Media |
| Notifications & Presence (`/api/notification`) | `Medium` | `Pending` | 0% | Thông báo thời gian thực (SignalR), Trạng thái Online / Last Seen, Unread Counter |
| Messaging & Real-time Chat (`/api/chat`) | `Medium` | `Pending` | 0% | Trò chuyện 1-1, Chat nhóm, Tin nhắn Media, Typing Indicator, Read Receipts |
| Groups (`/api/group`) | `Medium` | `Pending` | 0% | Tạo nhóm, Quản lý thành viên, Phân quyền, Bài viết trong nhóm, Duyệt bài |
| Search & Discovery (`/api/search`) | `Medium` | `Pending` | 0% | Tìm kiếm Người dùng/Bài viết/Nhóm, Gợi ý kết bạn (People You May Know) |
| Stories (`/api/story`) | `Low` | `Pending` | 0% | Tạo tin (24h), Xem danh sách Story, Người xem Story, Phản hồi Story |
| Voice & Video Calls (`/api/call`) | `Low` | `Pending` | 0% | Cuộc gọi thoại & video WebRTC, Lịch sử cuộc gọi, Mute/Camera Control |

---

## Danh Sách API (Endpoints)

### 1. Authentication (`/api/auth`)

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `POST` | `/api/auth/login` | *None* | *None* | `{ email, password }` |
| `High` | `POST` | `/api/auth/register` | *None* | *None* | `{ email, password, firstName, lastName, dateOfBirth, gender, bio? }` |
| `High` | `POST` | `/api/auth/refresh-token` | *None* | *None* | *None* (Đọc từ Cookie `refreshToken`) |
| `High` | `POST` | `/api/auth/logout` | *None* | *None* | *None* |
| `Medium` | `POST` | `/api/auth/forgot-password` | *None* | *None* | `{ email }` |
| `Medium` | `POST` | `/api/auth/reset-password` | *None* | *None* | `{ userId, password, token }` |
| `Low` | `POST` | `/api/auth/confirm-email` | *None* | *None* | `{ userId, token }` |
| `Low` | `POST` | `/api/auth/resend-confirmation` | *None* | *None* | `{ email }` |

---

### 2. User Profile (`/api/user`)

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `GET` | `/api/user/me` | *None* | *None* | *None* |
| `High` | `POST` | `/api/user/avatar` | *None* | *None* | `{ avatarUrl, mediaType, publicId }` |
| `High` | `PATCH` | `/api/user/profile` | *None* | *None* | `{ firstName, lastName, bio, dateOfBirth, gender, location, website }` |
| `Medium` | `GET` | `/api/user/{id}` | `id` (Guid) | *None* | *None* |
| `Medium` | `POST` | `/api/user/cover` | *None* | *None* | `{ coverUrl, mediaType, publicId }` |

---

### 3. Posts & News Feed (`/api/post`)

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `GET` | `/api/post/my-posts` | *None* | `pageNumber` (int, default: 1)<br>`pageSize` (int, default: 10) | *None* |
| `High` | `POST` | `/api/post` | *None* | *None* | `{ content?, media?, sharedPostId?, mentionedUserIds? }` |
| `High` | `DELETE` | `/api/post/{id}` | `id` (Guid) | *None* | *None* |
| `Medium` | `GET` | `/api/post/{id}` | `id` (Guid) | *None* | *None* |
| `Medium` | `PATCH` | `/api/post/{id}` | `id` (Guid) | *None* | `{ content?, media?, mentionedUserIds? }` |

---

### 4. Comments (`/api/comment`)

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `GET` | `/api/comment/post/{postId}/top-level` | `postId` (Guid) | `parentCommentId` (Guid?, optional)<br>`pageNumber` (int, default: 1)<br>`pageSize` (int, default: 10) | *None* |
| `High` | `POST` | `/api/comment` | *None* | *None* | `{ postId, parentCommentId?, content?, media?, mentionedUserIds? }` |
| `Medium` | `GET` | `/api/comment/{commentId}/replies` | `commentId` (Guid) | `postId` (Guid)<br>`pageNumber` (int, default: 1)<br>`pageSize` (int, default: 10) | *None* |
| `Medium` | `DELETE` | `/api/comment/{id}` | `id` (Guid) | *None* | *None* |
| `Low` | `PATCH` | `/api/comment/{id}` | `id` (Guid) | *None* | `{ content?, media?, mentionedUserIds? }` |

---

### 5. Reactions (`/api/reaction`)

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `POST` | `/api/reaction` | *None* | *None* | `{ targetId, reactType, targetType }` |
| `Medium` | `PATCH` | `/api/reaction/{id}` | `id` (Guid) | *None* | `{ reactType }` |
| `Medium` | `DELETE` | `/api/reaction/{id}` | `id` (Guid) | *None* | *None* |

---

### 6. Friendships & Relationships (`/api/friendship`)

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `GET` | `/api/friendship/friends` | *None* | `search` (string?, optional) | *None* |
| `High` | `POST` | `/api/friendship/{userId}/request` | `userId` (Guid) | *None* | *None* |
| `High` | `PATCH` | `/api/friendship/{userId}/accept` | `userId` (Guid) | *None* | *None* |
| `Medium` | `PATCH` | `/api/friendship/{userId}/unfriend` | `userId` (Guid) | *None* | *None* |
| `Medium` | `POST` | `/api/friendship/{userId}/cancel` | `userId` (Guid) | *None* | *None* |
| `Low` | `POST` | `/api/friendship/{userId}/block` | `userId` (Guid) | *None* | *None* |
| `Low` | `POST` | `/api/friendship/{userId}/unblock` | `userId` (Guid) | *None* | *None* |

---

### 7. Media & Upload (`/api/media`)

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `GET` | `/api/media/setup-upload` | *None* | `folder` (string, default: "socialflow/posts") | *None* |
| `Medium` | `DELETE` | `/api/media` | *None* | `publicId` (string)<br>`mediaType` (enum: Image, Video, default: Image) | *None* |

---

### 8. Notifications & Presence (`/api/notification`) [Plan / In-Development]

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `GET` | `/api/notification` | *None* | `pageNumber` (int, default: 1)<br>`pageSize` (int, default: 20) | *None* |
| `Medium` | `PATCH` | `/api/notification/{id}/read` | `id` (Guid) | *None* | *None* |
| `Medium` | `PATCH` | `/api/notification/read-all` | *None* | *None* | *None* |

---

### 9. Messaging & Chat (`/api/chat`) [Plan / In-Development]

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `GET` | `/api/chat/conversations` | *None* | `pageNumber` (int, default: 1)<br>`pageSize` (int, default: 20) | *None* |
| `High` | `GET` | `/api/chat/conversations/{id}/messages` | `id` (Guid) | `pageNumber` (int, default: 1)<br>`pageSize` (int, default: 50) | *None* |
| `High` | `POST` | `/api/chat/messages` | *None* | *None* | `{ conversationId?, recipientId?, content?, media? }` |
| `Medium` | `DELETE` | `/api/chat/messages/{id}` | `id` (Guid) | *None* | *None* |

---

### 10. Groups (`/api/group`) [Plan / In-Development]

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `GET` | `/api/group/my-groups` | *None* | `search` (string?) | *None* |
| `High` | `POST` | `/api/group` | *None* | *None* | `{ name, description, privacyLevel }` |
| `Medium` | `POST` | `/api/group/{id}/join` | `id` (Guid) | *None* | *None* |
| `Medium` | `POST` | `/api/group/{id}/leave` | `id` (Guid) | *None* | *None* |

---

### 11. Search & Discovery (`/api/search`) [Plan / In-Development]

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `High` | `GET` | `/api/search/users` | *None* | `q` (string), `pageNumber` (int), `pageSize` (int) | *None* |
| `High` | `GET` | `/api/search/posts` | *None* | `q` (string), `pageNumber` (int), `pageSize` (int) | *None* |
| `Medium` | `GET` | `/api/search/suggestions` | *None* | *None* | *None* |

---

### 12. Stories (`/api/story`) [Plan / In-Development]

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `Medium` | `GET` | `/api/story/feed` | *None* | *None* | *None* |
| `Medium` | `POST` | `/api/story` | *None* | *None* | `{ mediaUrl, mediaType, caption? }` |
| `Low` | `DELETE` | `/api/story/{id}` | `id` (Guid) | *None* | *None* |

---

### 13. Voice & Video Calls (`/api/call`) [Plan / In-Development]

| Priority | Method | Endpoint | Path Parameters | Query / Filters & Pagination | Request Body |
|---|---|---|---|---|---|
| `Low` | `POST` | `/api/call/initiate` | *None* | *None* | `{ receiverId, callType }` |
| `Low` | `POST` | `/api/call/{id}/end` | `id` (Guid) | *None* | *None* |
