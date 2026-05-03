import type { RouteObject } from "react-router-dom";
import { ClientProfilePage } from "@/pages/client/profile.page";

export const clientRoutes: RouteObject[] = [
  { path: "profile/:id", element: <ClientProfilePage /> },
];
