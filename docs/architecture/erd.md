# SocialFlow — Entity Relationship Diagram

> Auto-generated from domain entities and EF Core configurations.

## ERD Diagram

```mermaid
erDiagram
    %% ──────────────────────────────────────────────
    %%  CORE ENTITIES
    %% ──────────────────────────────────────────────

    USER {
        Guid Id PK
        string Email
        string FirstName
        string LastName
        DateTime DateOfBirth
        Gender Gender
        string Bio
        string Provider
        boolean IsActive
        DateTime LastLogin
        string RefreshToken
        DateTime RefreshTokenExpiryTime
    }

    POST {
        Guid Id PK
        Guid AuthorId FK
        PostType Type
        string Content
        int ReactionCount
        int CommentCount
        int ShareCount
        Guid SharedPostId FK
        DateTime CreatedAt
        DateTime UpdatedAt
    }

    COMMENT {
        Guid Id PK
        Guid PostId FK
        Guid AuthorId FK
        Guid ParentCommentId FK
        string Content
        int ReactionCount
        int ReplyCount
        DateTime CreatedAt
        DateTime UpdatedAt
    }

    REACTION {
        Guid Id PK
        Guid TargetId FK
        TargetType TargetType
        Guid UserId FK
        ReactType ReactType
        DateTime CreatedAt
        DateTime UpdatedAt
    }

    FRIENDSHIP {
        Guid UserId1 PK
        Guid UserId2 PK
        Guid UserActionId
        FriendshipStatus Status
        boolean IsBlockedByUser1
        boolean IsBlockedByUser2
        DateTime CreatedAt
        DateTime UpdatedAt
    }

    %% ──────────────────────────────────────────────
    %%  MEDIA & MENTIONS
    %% ──────────────────────────────────────────────

    POSTMEDIA {
        Guid Id PK
        Guid PostId FK
        string MediaUrl
        string MediaPublicId
        MediaType MediaType
        int SortOrder
        DateTime CreatedAt
    }

    MENTION {
        Guid Id PK
        Guid UserId FK
        Guid PostId FK
        Guid CommentId FK
        DateTime CreatedAt
    }

    %% ──────────────────────────────────────────────
    %%  CHAT / MESSAGING
    %% ──────────────────────────────────────────────

    CONVERSATION {
        Guid Id PK
        string Title
        boolean IsGroup
        DateTime CreatedAt
    }

    CONVERSATION_MEMBER {
        Guid Id PK
        Guid ConversationId FK
        Guid UserId FK
        string Nickname
        string AvatarUrl
        DateTime CreatedAt
    }

    MESSAGE {
        Guid Id PK
        Guid ConversationId FK
        Guid SenderId FK
        string Content
        MessageType Type
        DateTime CreatedAt
    }

    MESSAGE_RECEIPT {
        Guid MessageId PK
        Guid UserId FK
        boolean IsRead
        DateTime ReadAt
    }

    %% ──────────────────────────────────────────────
    %%  NOTIFICATIONS & OUTBOX
    %% ──────────────────────────────────────────────

    NOTIFICATION {
        Guid Id PK
        Guid SenderId FK
        Guid ReceiverId FK
        string Message
        NotificationType Type
        TargetType TargetType
        Guid TargetId
        boolean IsRead
        DateTime ReadAt
        DateTime CreatedAt
    }

    OUTBOX_MESSAGE {
        Guid Id PK
        string Type
        string Content
        DateTime CreatedAt
        DateTime ProcessedAt
        string Error
    }

    %% ──────────────────────────────────────────────
    %%  RELATIONSHIPS
    %% ──────────────────────────────────────────────

    USER ||--o{ POST : "authored"

    POST ||--o{ POST : "shares"

    USER ||--o{ COMMENT : "writes"

    POST ||--o{ COMMENT : "has"

    COMMENT ||--o{ COMMENT : "replies"

    USER ||--o{ REACTION : "reacts"

    POST ||--o{ REACTION : "reacted on"
    COMMENT ||--o{ REACTION : "reacted on"

    USER ||--o{ FRIENDSHIP : "User1"
    USER ||--o{ FRIENDSHIP : "User2"

    POST ||--o{ POSTMEDIA : "has media"

    POST ||--o{ MENTION : "mentions in"

    COMMENT ||--o{ MENTION : "mentions in"

    USER ||--o{ MENTION : "mentioned in"

    CONVERSATION ||--o{ CONVERSATION_MEMBER : "has members"

    USER ||--o{ CONVERSATION_MEMBER : "participates in"

    CONVERSATION ||--o{ MESSAGE : "contains"

    USER ||--o{ MESSAGE : "sends"

    MESSAGE ||--o{ MESSAGE_RECEIPT : "receipts"

    USER ||--o{ MESSAGE_RECEIPT : "reads"

    USER ||--o{ NOTIFICATION : "triggers"

    USER ||--o{ NOTIFICATION : "receives"
```

## Enumerations

| Enum | Values | Used In |
|------|--------|---------|
| `PostType` | Standard | `Post.Type` |
| `TargetType` | Post, Comment | `Reaction.TargetType`, `Notification.TargetType` |
| `ReactType` | *(various reaction types)* | `Reaction.ReactType` |
| `FriendshipStatus` | None, Pending, Accepted, Blocked | `Friendship.Status` |
| `Gender` | *(gender options)* | `User.Gender` |
| `MediaType` | Image, Video | `CloudAsset.Type` (owned by `PostMedia`, `Comment`, `User`) |
| `MessageType` | Text | `Message.Type` |
| `NotificationType` | FriendRequestReceived, FriendRequestAccepted, … | `Notification.Type` |

## Value Objects

| Value Object | Properties | Owned By |
|-------------|-----------|----------|
| `CloudAsset` | `Url`, `PublicId`, `Type` (MediaType) | `User.Avatar`, `User.Cover`, `PostMedia.Media`, `Comment.Media` |
| `CommentPreview` | *(stored as JSON)* | `Post.TopComments` (owned collection) |

## Relationship Summary

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1
     │
     ├─── 1:N ──── Post ────────────────────────────────┐
     │                 │ 1                               │
     │                 ├── 1:N ── PostMedia              │
     │                 ├── 1:N ── Comment ───┐           │
     │                 │            │ 1       │           │
     │                 │            ├── 1:N ──┘ (replies) │
     │                 │            └── 1:N ── Mention    │
     │                 ├── 1:N ── Reaction                │
     │                 └── 1:N ── Post (shares) ◄─────────┘
     │
     ├─── 1:N ──── Reaction
     ├─── M:N ──── Friendship (composite PK: UserId1 + UserId2)
     ├─── 1:N ──── Mention (as mentioned user)
     │
     ├─── 1:N ──── ConversationMember ──── N:1 ──── Conversation
     │                                                  │
     ├─── 1:N ──── Message ────────────────────────────┘
     │                 │
     │                 └── 1:N ── MessageReceipt ── N:1 ── User
     │
     ├─── 1:N ──── Notification (as sender)
     └─── 1:N ──── Notification (as receiver)