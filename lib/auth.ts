import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "";
const PASSWORD = process.env.SHARED_PASSWORD || "";
export const COOKIE_NAME = "sm_auth";
const COOKIE_VALUE = "ok";

function sign(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function makeCookieValue(): string {
  return `${COOKIE_VALUE}.${sign(COOKIE_VALUE)}`;
}

export function verifyCookie(raw: string | undefined): boolean {
  if (!raw || !SECRET) return false;
  const [value, sig] = raw.split(".");
  if (value !== COOKIE_VALUE || !sig) return false;
  const expected = sign(value);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function passwordMatches(input: string): boolean {
  if (!PASSWORD) return false;
  if (input.length !== PASSWORD.length) return false;
  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(PASSWORD));
}
