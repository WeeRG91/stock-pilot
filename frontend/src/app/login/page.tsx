import { LoginForm } from "@/components/LoginForm";
import { login } from "./action";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-12">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold text-zinc-900">
          Sign in to StockPilot
        </h1>
        <p className="mt-3 text-zinc-600">
          Use your account to manage inventory.
        </p>

        <LoginForm action={login} />
      </div>
    </main>
  );
}
