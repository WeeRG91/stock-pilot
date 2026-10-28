import { LoginForm } from "@/components/LoginForm";
import { login } from "./action";

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center bg-background px-5 py-12 sm:px-8 sm:py-20">
      <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            A little more clarity
          </p>

          <h2 className="mt-4 max-w-md font-serif text-4xl leading-tight tracking-tight text-foreground sm:text-5xl">
            A calmer way to keep stock.
          </h2>

          <p className="mt-6 max-w-md text-base leading-8 text-muted">
            Your products, movements, and stock levels—together in one
            thoughtful workspace.
          </p>

          <ul className="mt-8 space-y-4 text-sm text-muted">
            {[
              "An organized home for your product catalog",
              "A clear record of what comes in and goes out",
              "A timely view of stock that needs attention",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-xs text-success"
                >
                  ✓
                </span>
                <span className="leading-7">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full max-w-md lg:justify-self-end">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Welcome back
          </p>

          <h1 className="mt-3 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            Sign in to StockPilot
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted">
            Use your account to manage inventory.
          </p>

          <LoginForm action={login} />
        </div>
      </div>
    </main>
  );
}