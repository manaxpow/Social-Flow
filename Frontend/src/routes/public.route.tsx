import type { RouteObject } from "react-router-dom";
import { LoginPage } from "../pages/auth/login.page";
import { RegisterPage } from "../pages/auth/register.page";

export const publicRoutes: RouteObject[] = [
  { path: "about", element: <LoginPage /> },
  { path: "policy", element: <RegisterPage /> },
];
