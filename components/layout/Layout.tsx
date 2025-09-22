"use client";

import { Header } from "@/components/layout/Header";

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {showHeader && <Header />}
      <main>{children}</main>
    </div>
  );
}
