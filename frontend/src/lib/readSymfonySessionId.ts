export const SYMFONY_SESSION_COOKIE = "STOCKPILOTSESSID";

export function readSymfonySessionId(headers: Headers): string | null {
  let sessionId: string | null = null;

  for (const cookie of headers.getSetCookie()) {
    const separator = cookie.indexOf(";");

    const pair = (
      separator === -1 ? cookie : cookie.slice(0, separator)
    ).trim();

    const equals = pair.indexOf("=");

    if (equals === -1) {
      continue;
    }

    const name = pair.slice(0, equals);

    if (name !== SYMFONY_SESSION_COOKIE) {
      continue;
    }

    const value = pair.slice(equals + 1);

    if (sessionId !== null || !/^[A-Za-z0-9,-]{1,256}$/.test(value)) {
      throw new Error("Invalid Symfony session cookie.");
    }

    sessionId = value;
  }

  return sessionId;
}
