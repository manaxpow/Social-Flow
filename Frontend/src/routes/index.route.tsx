// src/routes/router.tsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../layout/main.layout";
import ClientLayout from "../layout/client/client.layout";
import PublicLayout from "@/layout/client/public.layout";

// Import your route arrays
import { authRoutes } from "./auth.route";
import { publicRoutes } from "./public.route";
import { clientRoutes } from "./client.route";
import { socialRoutes } from "./social.route";
import { AuthProvider } from "@/providers/auth.provider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        element: (
          <AuthProvider>
            <ClientLayout />
          </AuthProvider>
        ),
        children: [...socialRoutes, ...clientRoutes],
      },
      {
        element: <PublicLayout />,
        children: [...publicRoutes, ...authRoutes],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
