import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ApiResponse } from "./typing/api";

async function getUserProfile(req: NextRequest): Promise<ApiResponse<User>> {
  try {
    const res = await fetch("http://localhost:3000/api/users/me", {
      credentials: "include",
      headers: req.headers,
      cache: "no-store",
    });
    const resJson = (await res.json()) as ApiResponse<User>;
    return resJson;
  } catch (error) {
    return {
      succeed: false,
      reason: "CLIENT_ERROR",
    };
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { data: user } = await getUserProfile(request);

  if (!user) {
    if (!pathname.startsWith("/signin") && !pathname.startsWith("/signup")) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }
  if (user) {
    if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
