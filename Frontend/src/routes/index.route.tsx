import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "../layout/main.layout";
import ClientLayout from "../layout/client/client.layout";
import { authRoutes } from "./auth.route";
import { publicRoutes } from "./public.route";
import { AuthProvider } from "../providers/auth.provider";
import { socialRoutes } from "./social.route";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        element: <ClientLayout />,
        children: [...publicRoutes, ...authRoutes],
      },

      {
        element: <AuthProvider />,
        children: [
          {
            element: <ClientLayout />,
            children: socialRoutes,
          },
        ],
      },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
