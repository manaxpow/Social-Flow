import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
// import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "./stores/index.ts";
import { AppRouter } from "./routes/index.route.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    {/* <QueryClientProvider client={queryClient}> */}
    <AppRouter />
    {/* </QueryClientProvider> */}
  </Provider>
);
