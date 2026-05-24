import { NextResponse, type NextRequest } from "next/server";

const accessCookieName = "sapporo_polar_access";

function isPublicPath(pathname: string) {
  return (
    pathname === "/gate" ||
    pathname.startsWith("/api/unlock") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  );
}

export function proxy(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword || isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const hasAccess = request.cookies.get(accessCookieName)?.value === "granted";

  if (hasAccess) {
    return NextResponse.next();
  }

  const gateUrl = request.nextUrl.clone();
  gateUrl.pathname = "/gate";
  gateUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(gateUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
