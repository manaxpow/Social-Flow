import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./stores/index.ts";
import { AppRouter } from "./routes/index.route.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { AuthProvider } from "./providers/auth.provider.tsx";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Don't refetch on window focus
      retry: 1, // Retry failed requests once
      staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      {/* <AuthProvider> */}
        <Toaster position="top-right" richColors />
        <AppRouter />
      {/* </AuthProvider> */}
    </QueryClientProvider>
  </Provider>
);
