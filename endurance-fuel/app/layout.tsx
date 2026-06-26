import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "EnduranceFuel — Plan żywieniowy dla sportowców",
  description: "Personalizowane plany żywieniowe dopasowane do Twojego planu treningowego i pogody",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={geist.variable} suppressHydrationWarning>
      <body className={geist.className}>{children}</body>
    </html>
  );
}
