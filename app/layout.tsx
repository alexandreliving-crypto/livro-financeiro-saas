import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Livro Financeiro — Controle financeiro familiar",
  description: "Controle de entradas e despesas para a família, por assinatura.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-paper text-ink antialiased min-h-screen">{children}</body>
    </html>
  );
}
