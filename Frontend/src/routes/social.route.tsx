import type { RouteObject } from "react-router-dom";
import { LoginPage } from "@/pages/auth/login.page";

export const socialRoutes: RouteObject[] = [
  { index: true, element: <LoginPage /> },
];
