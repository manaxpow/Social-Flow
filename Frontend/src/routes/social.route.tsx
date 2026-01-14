import type { RouteObject } from "react-router-dom";
import HomePage from "../pages/client/home.page";

export const socialRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
];
