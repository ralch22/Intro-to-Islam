import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth(() => {
  // TODO: Uncomment protection once WordPress OAuth2 SSO is live
  // const { nextUrl, auth: session } = req;
  // const isLoggedIn = !!session;
  // const isAuthPage = nextUrl.pathname.startsWith("/login");
  // const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
  // if (!isLoggedIn && !isAuthPage && !isApiAuth) {
  //   return NextResponse.redirect(new URL("/login", req.url));
  // }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"],
};
