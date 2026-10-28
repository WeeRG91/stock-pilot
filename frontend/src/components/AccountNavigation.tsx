import Link from "next/link";
import { getCurrentUser } from "@/lib/getCurrentUser.server";
import { LogoutControl } from "./LogoutControl";
import { logout } from "@/app/logout-action";

export async function AccountNavigation() {
  const user = await getCurrentUser();

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
