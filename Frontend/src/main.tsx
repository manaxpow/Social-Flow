import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./stores/index.ts";
import { AppRouter } from "./routes/index.route.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors />
      <AppRouter />
    </QueryClientProvider>
  </Provider>,
);
