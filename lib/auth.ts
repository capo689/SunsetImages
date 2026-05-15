// Edge-runtime compatible auth helpers.
// Uses Web Crypto API (works in both Edge and Node runtimes), not Node's crypto.

const SECRET = process.env.SESSION_SECRET || "";
const PASSWORD = process.env.SHARED_PASSWORD || "";
export const COOKIE_NAME = "sm_auth";
const COOKIE_VALUE = "ok";

const encoder = new TextEncoder();

let cachedKey: CryptoKey | null = null;
async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
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

async function sign(value: string): Promise<string> {
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bufToHex(sig);
}

// Constant-time string compare. Returns false if lengths differ.
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function makeCookieValue(): Promise<string> {
  return `${COOKIE_VALUE}.${await sign(COOKIE_VALUE)}`;
}

export async function verifyCookie(raw: string | undefined): Promise<boolean> {
  if (!raw || !SECRET) return false;
  const [value, sig] = raw.split(".");
  if (value !== COOKIE_VALUE || !sig) return false;
  const expected = await sign(value);
  return timingSafeEqualStr(sig, expected);
}

export function passwordMatches(input: string): boolean {
  if (!PASSWORD) return false;
  return timingSafeEqualStr(input, PASSWORD);
}
