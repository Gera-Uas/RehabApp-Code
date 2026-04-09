import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // "/" siempre va a /login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rutas públicas - si ya está autenticado, redirige a su dashboard
  const publicRoutes = ["/login", "/auth/register"];
  if (publicRoutes.includes(pathname)) {
    if (token) {
      const roleMap: Record<string, string> = {
        ADMIN: "/admin",
        FISIOTERAPEUTA: "/fisio",
        PACIENTE: "/patient",
      };
      const rolePath = roleMap[token.role as string] || "/login";
      return NextResponse.redirect(new URL(rolePath, request.url));
    }
    return NextResponse.next();
  }

  // Si no está autenticado y accede a ruta protegida
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rutas protegidas por rol - redirige al login si no tiene permiso
  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/fisio")) {
    if (token.role !== "FISIOTERAPEUTA") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (pathname.startsWith("/patient")) {
    if (token.role !== "PACIENTE") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

