import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo proteger rutas /admin/* excepto /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Supabase guarda la sesión en una cookie con este nombre
    const sessionCookie = request.cookies.getAll().find(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
