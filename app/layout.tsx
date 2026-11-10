import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CEDIM Materiateca",
    template: "%s | CEDIM Materiateca",
  },
  description:
    "Catálogo digital de muestras textiles del taller de CEDIM. Consulta, propón y solicita préstamos de materiales.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://materiateca.netlify.app"
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
