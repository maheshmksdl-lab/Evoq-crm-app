import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";
import NavGuard from "@/components/layout/NavGuard";

// ── Inter: universal font family ──────────────────────────────────
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Social DNA Labs — CRM",
  description: "Customer Relationship Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} style={{ fontFamily: "var(--font-inter)" }}>
      <body suppressHydrationWarning>
        <ThemeRegistry>
          <NavGuard />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
