import type { RouteObject } from "react-router-dom";
import { FeedPage } from "@/pages/client/feed.page";
import { PostDetailPage } from "@/pages/social/post-detail.page";
import { PhotoDetailPage } from "@/pages/social/photo-detail.page";

export const socialRoutes: RouteObject[] = [
  { index: true, element: <FeedPage /> },
  { path: "post/:postId", element: <PostDetailPage /> },
  { path: "photo/:postId", element: <PhotoDetailPage /> },
];

