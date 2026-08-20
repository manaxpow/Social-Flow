# SocialFlow Frontend Documentation

Giao diện người dùng (Client Web App) của hệ thống SocialFlow được phát triển bằng React 19, TypeScript, Vite, TailwindCSS và các thư viện hỗ trợ quản lý trạng thái, API client.

---

## Tổng Quan & Cấu Hình

- **Tech Stack**: React 19, TypeScript, Vite, TailwindCSS, TanStack Query (React Query), Zustand, Lucide React
- **Development Server**: `http://localhost:5173` (Khởi chạy bằng `npm run dev`)
- **Build Command**: `npm run build`

---

## Bảng Quản Lý Tiến Độ Giao Diện (Progress Tracking)

| Module / Feature | Priority | Status | Progress | Screen & UI Component Scope |
|---|---|---|---|---|
| Authentication (`/auth/*`) | `High` | `Completed` | 100% | Login, Register, Confirm Email, Forgot Password, Reset Password |
| User Profile (`/profile/*`) | `High` | `Completed` | 100% | Trang cá nhân, Tab Bài viết, Tab Thông tin, Tab Bạn bè, Edit Profile Modal |
| Posts & News Feed (`/feed`, `/post/*`) | `High` | `Completed` | 100% | Trang News Feed, Chi tiết bài viết, Lightbox Photo Detail, Post Detail Dialog |
| Comments System | `High` | `Completed` | 100% | Khung bình luận trong Post Detail & Photo Dialog |
| Reactions System | `High` | `Pending` | 0% | Hover animation thả cảm xúc, Badge tổng hợp & Modal xem danh sách thả cảm xúc |
| Friendships & Social Graph | `High` | `Pending` | 0% | Nút thao tác Bạn bè (Gửi/Hủy/Đồng ý), Popover Lời mời kết bạn, Danh sách bạn bè |
| Media & Upload Preview | `High` | `Pending` | 0% | Drag & Drop Media Uploader, Thanh tiến trình tải tệp Cloudinary, Xem trước tệp |
| Notifications & Presence | `Medium` | `Pending` | 0% | Popover Thông báo, Toast Alert thời gian thực, Chấm báo trạng thái Online |
| Messaging & Chat UI (`/messages`) | `Medium` | `Pending` | 0% | Khung trò chuyện 1-1, Chat nhóm, Khung nhập tin nhắn, Trạng thái đang gõ (Typing indicator) |
| Groups UI (`/groups/*`) | `Medium` | `Pending` | 0% | Trang chi tiết Nhóm, Group Feed, Modal tạo nhóm, Quản lý thành viên |
| Search & Discovery (`/search`) | `Medium` | `Pending` | 0% | Thanh tìm kiếm Autocomplete, Trang kết quả tìm kiếm (Tabs: Người dùng, Bài viết, Nhóm) |
| Stories UI | `Low` | `Pending` | 0% | Thanh Story Bar trên Feed, Trình xem Story Fullscreen với thanh tiến trình tự động |
| Voice & Video Calls UI | `Low` | `Pending` | 0% | Modal cuộc gọi WebRTC, Nút Bật/Tắt Mic & Camera, Màn hình nhận/từ chối cuộc gọi |

---

## Danh Sách Màn Hình UI & Component

### 1. Authentication & Account (`/auth/*`)

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | Login Page | `/auth/login` | `LoginForm`, `AuthLayout` | Form đăng nhập email/password, nút Remember Me, liên kết đến Quên mật khẩu & Đăng ký |
| `High` | Register Page | `/auth/register` | `RegisterForm`, `AuthLayout` | Form đăng ký tài khoản (Họ tên, Email, Mật khẩu, Ngày sinh, Giới tính), Checkbox điều khoản |
| `Medium` | Forgot Password Page | `/auth/forgot-password` | `ForgotPasswordForm` | Form nhập Email nhận đường dẫn khôi phục mật khẩu |
| `Medium` | Reset Password Page | `/auth/reset-password` | `ResetPasswordForm` | Form xác nhận token và nhập mật khẩu mới |
| `Low` | Confirm Email Page | `/auth/confirm-email` | `ConfirmEmailView` | Màn hình xác thực Token từ Email và nút gửi lại mã xác nhận |

---

### 2. User Profile (`/profile/*`)

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | Profile Header & Cover | `/profile`, `/profile/:id` | `ProfileHeader`, `AvatarUploader` | Ảnh bìa, Ảnh đại diện, Tên người dùng, Bio, Nút Chỉnh sửa hồ sơ |
| `High` | Profile Navigation Tabs | `/profile`, `/profile/:id` | `TabNavigation` | Thanh chuyển Tab: Bài viết, Giới thiệu, Bạn bè, Ảnh/Video |
| `High` | Profile Posts Tab | `/profile` (Tab Posts) | `PostsTab`, `CreatePostCard`, `PostList` | Danh sách bài viết của cá nhân, Khung tạo bài viết nhanh |
| `High` | Profile Friends Tab | `/profile` (Tab Friends) | `FriendsTab`, `FriendCard` | Lưới danh sách bạn bè, tìm kiếm bạn bè |
| `High` | Edit Profile Modal | Overlay Component | `EditProfileModal` | Dialog chỉnh sửa thông tin cá nhân, cập nhật Bio, Tải lên Avatar & Cover Photo mới |
| `Medium` | Profile Info Tab | `/profile` (Tab Info) | `InfoTab` | Hiển thị thông tin chi tiết: Ngày tham gia, Giới tính, Vị trí, Website |

---

### 3. Posts & News Feed (`/`, `/feed`, `/post/:id`)

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | News Feed Main Page | `/`, `/feed` | `FeedPage`, `PostList`, `FeedSidebar` | Bảng tin chính hội tụ bài viết bạn bè, thanh sidebars tiện ích |
| `High` | Post Card Component | Sub-component | `PostCard`, `PostHeader`, `PostContent` | Hiển thị tác giả, thời gian, privacy, nội dung text, ảnh/video, lượt thích/bình luận |
| `High` | Post Detail Dialog | Sub-component | `PostDetailDialog` | Xem chi tiết bài viết cùng danh sách bình luận bên dưới |
| `High` | Photo Detail Lightbox | `/photo/:id` | `PhotoDetailPage`, `PhotoDialog` | Trình xem ảnh toàn màn hình, bên phải là thông tin bài viết & bình luận |

---

### 4. Comments System

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | Comment Section | Sub-component | `CommentSection`, `CommentInput` | Ô nhập bình luận, Danh sách bình luận gốc của bài viết |
| `High` | Comment Item & Replies | Sub-component | `CommentItem`, `ReplyList` | Hiển thị bình luận, nút Trả lời, Nút xem thêm danh sách câu trả lời |

---

### 5. Reactions System [Plan / In-Development]

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | Reaction Picker Bar | Sub-component | `ReactionPicker` | Thanh lựa chọn biểu cảm dạng Hover Animation (Thích, Yêu thích, Haha, Wow, Buồn, Phẫn nộ) |
| `Medium` | Reaction Summary Badge | Sub-component | `ReactionSummary` | Hiển thị các icon biểu cảm chiếm ưu thế & tổng số lượng cảm xúc đã thả |
| `Medium` | Reactors List Modal | Overlay Component | `ReactorsModal` | Modal hiển thị danh sách chi tiết những người đã thả cảm xúc |

---

### 6. Friendships & Relationships [Plan / In-Development]

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | Friend Action Button | Sub-component | `FriendActionButton` | Nút trạng thái quan hệ động: Thêm bạn bè, Phản hồi lời mời, Đã gửi lời mời, Bạn bè, Chặn |
| `High` | Friend Requests Popover | Header Component | `FriendRequestsPopover` | Menu thả xuống hiển thị danh sách lời mời kết bạn đang chờ xử lý |

---

### 7. Media & Upload Preview [Plan / In-Development]

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | Media Uploader Dropzone | Sub-component | `MediaUploader` | Khung kéo thả hình ảnh/video, thanh tiến trình % upload trực tiếp lên Cloudinary |
| `Medium` | Media Preview Grid | Sub-component | `MediaGridPreview` | Lưới xem trước các ảnh đã chọn kèm nút xóa từng ảnh trước khi đăng bài |

---

### 8. Notifications & Presence [Plan / In-Development]

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `Medium` | Notification Popover | Header Component | `NotificationPopover` | Dropdown xem danh sách thông báo mới, đánh dấu đã đọc |
| `Medium` | Realtime Toast Alert | Global Component | `ToastNotification` | Pop-up thông báo nổi ở góc màn hình khi có tương tác mới |
| `Medium` | Online Presence Dot | Global Component | `PresenceBadge` | Chấm xanh hiển thị trạng thái đang hoạt động trên Avatar |

---

### 9. Messaging & Chat UI [Plan / In-Development]

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | Chat Messenger Page | `/messages` | `ChatPage`, `ConversationList`, `ChatWindow` | Giao diện nhắn tin chính: Danh sách hội thoại bên trái, Khung chat chi tiết bên phải |
| `High` | Message Input Box | Sub-component | `MessageComposer` | Ô nhập tin nhắn văn bản, đính kèm tệp, gửi icon emoji, hiển thị hiệu ứng Typing |
| `Medium` | Floating Chat Heads | Global Overlay | `ChatHeadWidget` | Bóng bong bóng chat nổi góc dưới màn hình khi có tin nhắn mới |

---

### 10. Groups UI [Plan / In-Development]

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | Group Main Page | `/groups/:id` | `GroupDetailPage`, `GroupHeader`, `GroupFeed` | Trang tổng quan nhóm, Ảnh bìa nhóm, Bảng tin riêng của nhóm |
| `Medium` | Create Group Modal | Overlay Component | `CreateGroupModal` | Form tạo nhóm mới: Đặt tên, chọn quyền riêng tư, mời bạn bè |

---

### 11. Search & Discovery UI [Plan / In-Development]

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `High` | Search Autocomplete Bar | Header Component | `SearchBar`, `SearchSuggestions` | Thanh tìm kiếm thông minh trên Header, hiển thị gợi ý kết quả tức thì |
| `High` | Search Results Page | `/search` | `SearchResultsPage`, `SearchTabs` | Trang kết quả tìm kiếm phân chia theo Tab: Tất cả, Mọi người, Bài viết, Nhóm |

---

### 12. Stories UI [Plan / In-Development]

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `Medium` | Story Feed Bar | `/feed` (Header Feed) | `StoryBar`, `StoryItemCard` | Thanh hiển thị danh sách Tin (Story) 24h của bạn bè ở đầu Bảng tin |
| `Low` | Story Fullscreen Viewer | Overlay Component | `StoryViewerModal` | Trình xem Story toàn màn hình tự động chuyển tiếp sau 5s |

---

### 13. Voice & Video Calls UI [Plan / In-Development]

| Priority | Screen / Page | Route / Component Path | Key Components | Main UI Features / Interactivity |
|---|---|---|---|---|
| `Low` | WebRTC Call Dialog | Global Overlay | `CallModal`, `VideoGrid` | Màn hình cuộc gọi thoại / video trực tiếp, nút Bật/Tắt Microphone & Camera |
