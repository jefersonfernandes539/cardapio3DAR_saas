import type { Metadata } from "next";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cardápio Admin",
  description: "Painel do restaurante para gerenciar o cardápio digital",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
