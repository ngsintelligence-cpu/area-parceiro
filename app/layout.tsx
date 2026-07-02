import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Área do Parceiro — Power Mais",
  description: "Portal exclusivo para parceiros Power Mais Energia Solar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full bg-bg text-tx">{children}</body>
    </html>
  );
}
