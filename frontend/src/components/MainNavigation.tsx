"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/products", label: "Products" },
] as const;

export function MainNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      {links.map(({ href, label }) => {
        const active =
          pathname === href ||
          (href !== "/" && pathname.startsWith(`${href}/`));

        return (
          <Link
            key={href}
            href={href}
            aria-current={
              active ? (pathname === href ? "page" : "location") : undefined
            }
            className={`rounded-full px-4 py-2 transition-colors ${
              active
                ? "bg-accent-soft font-semibold text-accent"
                : "text-muted hover:bg-surface-muted hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}