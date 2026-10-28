import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SYMFONY_SESSION_COOKIE } from "./readSymfonySessionId";

export async function getApiSessionHeaders(): Promise<{
  Accept: string;
  Cookie: string;
}> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("STOCKPILOT_SESSION")?.value;

  if (!sessionId || !/^[A-Za-z0-9,-]{1,256}$/.test(sessionId)) {
    redirect("/login");
  }

  return {
    Accept: "application/json",
    Cookie: `${SYMFONY_SESSION_COOKIE}=${sessionId}`,
  };
}
