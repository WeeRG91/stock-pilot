import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Suspense } from "react";
import { AccountNavigation } from "@/components/AccountNavigation";
import { MainNavigation } from "@/components/MainNavigation";

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
        <header className="border-b border-line bg-surface">
          <nav
            aria-label="Main navigation"
            className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-4 px-5 py-5 sm:px-8"
          >
            <Link href="/" className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-10 items-center justify-center rounded-2xl bg-accent text-sm font-semibold tracking-tight text-white"
              >
                SP
              </span>

              <span>
                <span className="block text-lg font-semibold tracking-tight text-foreground">
                  StockPilot
                </span>
                <span className="block text-[11px] tracking-wide text-muted">
                  A little clarity for your inventory.
                </span>
              </span>
            </Link>

            <MainNavigation />

            <Suspense
              fallback={
                <span className="ml-auto text-sm text-muted" role="status">
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
