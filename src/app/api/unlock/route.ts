import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

const accessCookieName = "sapporo_polar_access";

function safeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  if (value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function POST(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;
  const formData = await request.formData();
  const password = formData.get("password");
  const nextPath = safeNextPath(formData.get("next"));

  if (!appPassword || password !== appPassword) {
    const gateUrl = new URL("/gate", request.url);
    gateUrl.searchParams.set("error", "1");
    gateUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(gateUrl, 303);
  }

  const cookieStore = await cookies();
  cookieStore.set(accessCookieName, "granted", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });

  return NextResponse.redirect(new URL(nextPath, request.url), 303);
}
