import type { RouteObject } from "react-router-dom";
import UserProfile from "@/components/features/user/profile/profile.index";

export const clientRoutes: RouteObject[] = [
  { path: ":id", element: <UserProfile /> },
];
