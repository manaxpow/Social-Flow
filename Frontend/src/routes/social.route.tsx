import { FeedPage } from "@/pages/social/feed.page";
import type { RouteObject } from "react-router-dom";

export const socialRoutes: RouteObject[] = [
  { index: true, element: <FeedPage /> },
];
