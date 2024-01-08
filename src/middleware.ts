import { NextRequest, NextResponse } from "next/server";
import { UserDTO } from "./actions/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token");

  if (!token) {
    return NextResponse.rewrite(new URL("/login", req.nextUrl));
  }

  const res = await (
    await fetch(new URL("/api/auth", req.nextUrl).toString(), {
      method: "POST",
      body: JSON.stringify({
        token: token.value,
      }),
    })
  ).json();
  if (!res.data) return NextResponse.rewrite(new URL("/login", req.nextUrl));

  const user = res.data as UserDTO;
}

export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|favicon.ico).*)"],
};