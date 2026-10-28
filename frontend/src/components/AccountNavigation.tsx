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
      <div className="ml-auto text-zinc-600" role="status">
        Account temporarily unavailable.
      </div>
    );
  }

  if (!user) {
    return (
      <div className="ml-auto">
        <Link href="/login" className="hover:underline">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="ml-auto flex flex-wrap items-center gap-4">
      <span className="text-zinc-600">{user.email}</span>
      <LogoutControl action={logout} />
    </div>
  );
}
