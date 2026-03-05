import type { RouteObject } from "react-router-dom";
import { LoginPage } from "../pages/auth/login.page";
import { RegisterPage } from "../pages/auth/register.page";

export const publicRoutes: RouteObject[] = [
  { index: true, element: <LoginPage /> },
  { path: "login", element: <LoginPage /> },
  { path: "register", element: <RegisterPage /> },
];
