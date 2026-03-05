import type React from "react";
import { Header } from "../components/Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <main className="px-3 py-4">{children}</main>
    </div>
  );
}
