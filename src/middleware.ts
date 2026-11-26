import { NextResponse } from "next/server";

/** Reserved for auth/geo later. Home rewrite lives in next.config.ts */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cabinet/:path*"],
};
