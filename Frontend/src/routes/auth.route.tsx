import type { RouteObject } from "react-router-dom";
import { LoginPage } from "../pages/auth/login.page";
import { RegisterPage } from "../pages/auth/register.page";
import { ForgotPasswordPage } from "@/pages/auth/forgot-password";
import { ResetPasswordPage } from "@/pages/auth/reset-password";
import { ConfirmEmailPage } from "@/pages/auth/confirm-email";

export const authRoutes: RouteObject[] = [
  {
    path: "auth",
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "forgot-password", element: <ForgotPasswordPage /> },
      { path: "reset-password", element: <ResetPasswordPage /> },
      { path: "confirm-email", element: <ConfirmEmailPage /> },
    ],
  },
];
