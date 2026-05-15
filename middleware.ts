import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next|images|favicon.ico|api/auth).*)"],
};

const COOKIE_NAME = "sm_auth";
const COOKIE_VALUE = "ok";
const PUBLIC_PATHS = new Set(["/"]);

const encoder = new TextEncoder();

let cachedKey: CryptoKey | null = null;
async function getKey(): Promise<CryptoKey | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;
  if (cachedKey) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return cachedKey;
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verifyCookie(raw: string | undefined): Promise<boolean> {
  if (!raw) return false;
  const [value, sig] = raw.split(".");
  if (value !== COOKIE_VALUE || !sig) return false;
  const key = await getKey();
  if (!key) return false;
  const expected = bufToHex(
    await crypto.subtle.sign("HMAC", key, encoder.encode(value))
  );
  return timingSafeEqualStr(sig, expected);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (await verifyCookie(cookie)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  return NextResponse.redirect(url);
}
