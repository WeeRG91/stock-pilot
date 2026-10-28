import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";
import { AccountNavigation } from "@/components/AccountNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockPilot",
  description: "Educational inventory management application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-zinc-200 bg-white px-6 py-4">
          <nav
            aria-label="Main navigation"
            className="mx-auto flex max-w-5xl gap-6 text-sm font-medium text-zinc-900"
          >
            <Link href="/" className="hover:underline">
              Overview
            </Link>
            <Link href="/products" className="hover:underline">
              Products
            </Link>

            <Suspense
              fallback={
                <span className="ml-auto text-zinc-500" role="status">
                  Loading account…
                </span>
              }
            >
              <AccountNavigation />
            </Suspense>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
