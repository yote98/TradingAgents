import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { fonts } from "./font";

const inter = Inter({
  subsets: ["latin"],
});

// Force dynamic rendering globally - NO CACHING
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: "AlphaFlow AI",
  description: "Multi-Agent Intelligence for Trading Analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fonts.map((font) => font.variable).join(" ")} suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
