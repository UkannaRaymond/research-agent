/**
 * Anonymous per-browser identity, stored in a cookie.
 * It scopes the history list so visitors only see their own research.
 * (No accounts yet: anyone with a run's link can still open that run.)
 */

export const VISITOR_COOKIE = "visitor_id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value);

export function readVisitorId(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");

    if (name === VISITOR_COOKIE) {
      const value = rest.join("=");
      return isUuid(value) ? value : null;
    }
  }

  return null;
}

export const visitorCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};
