import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { LayoutShell } from "@/components/layout/LayoutShell";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Entropi - Seller Dashboard",
  description: "Financial event-sourced order management and ledger system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="bg-[var(--background)] text-slate-900 antialiased">
        <AppProviders>
          <LayoutShell>{children}</LayoutShell>
        </AppProviders>
      </body>
    </html>
  );
}
