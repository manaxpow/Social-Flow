import type { ReactNode } from "react";
import { Header } from "./header/header";
import { Footer } from "./footer";

interface ClientLayoutProps {
  children: ReactNode;
}

// Update the component to accept props
export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto py-6">{children}</main>
      <Footer />
    </div>
  );
}
