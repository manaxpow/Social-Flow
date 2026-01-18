import { Outlet } from "react-router-dom";
import { Header } from "./header/header";
import { Footer } from "./footer";

const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 min-h-[calc(100vh-4rem-8rem)] pt-4 pb-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
export default ClientLayout;
