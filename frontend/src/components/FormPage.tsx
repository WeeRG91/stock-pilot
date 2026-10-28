import Link from "next/link";
import type { ReactNode } from "react";

type FormPageProps = {
  title: string;
  eyebrow: string;
  backHref: string;
  backLabel: string;
  description?: ReactNode;
  children: ReactNode;
};

export function FormPage({
  title,
  eyebrow,
  backHref,
  backLabel,
  description,
  children,
}: FormPageProps) {
  return (
    <main className="flex-1 bg-background px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-2xl">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-full py-2 text-sm text-muted hover:text-accent"
        >
          <span aria-hidden="true">←</span>
          {backLabel}
        </Link>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </p>

        <h1 className="mt-3 break-words font-serif text-4xl tracking-tight text-foreground sm:text-5xl">
          {title}
        </h1>

        {description && (
          <div className="mt-4 text-sm leading-7 text-muted">
            {description}
          </div>
        )}

        {children}
      </div>
    </main>
  );
}