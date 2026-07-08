import { NextResponse, type NextRequest } from "next/server";
import { isAuthBypassEnabled } from "@erp/auth";

const PUBLIC_PATHS = ["/", "/sign-in", "/signed-out", "/access-denied", "/api/health", "/api/auth"];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

export default function proxy(request: NextRequest) {
  if (isAuthBypassEnabled()) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;
  if (PUBLIC_PATHS.some((publicPath) => path === publicPath || path.startsWith(`${publicPath}/`))) {
    return NextResponse.next();
  }
  if (request.cookies.has("lc_session")) {
    return NextResponse.next();
  }
  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("returnUrl", path);
  return NextResponse.redirect(signInUrl);
}
