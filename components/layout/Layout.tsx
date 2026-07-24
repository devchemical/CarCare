"use client"

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: React.ReactNode
  showHeader?: boolean
}

export function Layout({ children, showHeader = true }: LayoutProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      {showHeader && <Header />}
      <main id="main-content" className={cn("flex-1", showHeader && "pt-16 sm:pt-20")}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
