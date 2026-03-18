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
import { RootConditionalRenderer } from "@/layout/client/root.condition-render";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    ),
    children: [
      {
        index: true,
        element: <RootConditionalRenderer />,
      },

      {
        element: <PublicLayout />,
        children: [...publicRoutes, ...authRoutes],
      },

      {
        element: <ClientLayout />,
        children: [...socialRoutes, ...clientRoutes],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
