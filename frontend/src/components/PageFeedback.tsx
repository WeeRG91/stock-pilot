import type { ReactNode } from "react";

type PageFeedbackProps = {
  eyebrow: string;
  title: string;
  message: string;
  role?: "alert" | "status";
  children?: ReactNode;
};

export function PageFeedback({
  eyebrow,
  title,
  message,
  role = "status",
  children,
}: PageFeedbackProps) {
  return (
    <main className="flex flex-1 items-center bg-background px-5 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-line bg-surface p-8 text-center sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </p>

        <h1 className="mt-4 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>

        <p role={role} className="mt-4 text-sm leading-7 text-muted">
          {message}
        </p>

        {children && (
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {children}
          </div>
        )}
      </div>
    </main>
  );
}