// src/routes/router.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../layout/main.layout";
import ClientLayout from "../layout/client/client.layout";
import PublicLayout from "@/layout/client/public.layout";
import { AuthProvider } from "../providers/auth.provider";

// Import your route arrays
import { authRoutes } from "./auth.route";
import { publicRoutes } from "./public.route";
import { clientRoutes } from "./client.route";
import { socialRoutes } from "./social.route";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
        <MainLayout />
    ),
    children: [
      {
        element:
          <PublicLayout />
  ,
        children: [...publicRoutes, ...authRoutes],
      },

      {
        element:
        <AuthProvider>
          <ClientLayout />
        </AuthProvider>,
        children: [...socialRoutes, ...clientRoutes],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
