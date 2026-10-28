import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser.server";
import { LogoutControl } from "./LogoutControl";
import { logout } from "@/app/logout-action";
import { AuthUser } from "@/types/auth";
import { unstable_rethrow } from "next/navigation";

export async function AccountNavigation() {
  let user: AuthUser | null;

  try {
    user = await getCurrentUser();
  } catch (error) {
    unstable_rethrow(error);

    return (
      <div className="ml-auto text-muted" role="status">
        Account temporarily unavailable.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ml-auto">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-full border border-line px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="ml-auto flex max-w-full flex-wrap items-center gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span
          aria-hidden="true"
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-soft text-xs font-semibold text-success"
        >
          {user.email.charAt(0).toUpperCase()}
        </span>

        <span className="max-w-48 truncate text-sm text-muted">
          {user.email}
        </span>
      </div>

      <LogoutControl action={logout} />
    </div>
  );
}
