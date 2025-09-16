import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarCare Pro - Gestión de Mantenimiento Automotriz",
  description:
    "Gestiona el mantenimiento de todos tus vehículos desde una sola plataforma",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="antialiased"
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
