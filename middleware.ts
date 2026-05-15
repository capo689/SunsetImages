import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyCookie } from "./lib/auth";

export const config = {
  // Run on everything except static assets, public images, and the auth endpoint
  matcher: ["/((?!_next|images|favicon.ico|api/auth).*)"],
};

const PUBLIC_PATHS = new Set(["/"]);

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
