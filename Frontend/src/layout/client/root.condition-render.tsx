import { FeedPage } from "@/pages/client/feed.page";
import ClientLayout from "./client.layout";
import PublicLayout from "./public.layout";
import { LoginPage } from "@/pages/auth/login.page";
import { useAppSelector } from "@/stores/hook";

// src/components/layout/root-conditional-renderer.tsx
export const RootConditionalRenderer = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return isAuthenticated ? (
    <ClientLayout>
      <FeedPage />
    </ClientLayout>
  ) : (
    <PublicLayout>
      <LoginPage />
    </PublicLayout>
  );
};
