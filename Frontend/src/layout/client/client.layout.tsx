import { Header } from "./header/header";
import { Footer } from "./footer";
import { Outlet } from "react-router-dom";

// Update the component to accept props
export default function ClientLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
