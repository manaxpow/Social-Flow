import { Outlet, useLocation, Navigate } from "react-router-dom";
import { Header } from "./header/header";
import { Footer } from "./footer";
import { useAppSelector } from "@/stores/hook";

export default function ClientLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Redirect to login if not authenticated
  // Note: AuthProvider handles initialization check, so we only check authentication here
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  // Render protected content with Outlet for child routes
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
