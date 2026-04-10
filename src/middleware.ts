import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Rotas públicas
  const publicRoutes = ['/login', '/api/auth'];
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublic) {
    // Se já logado e tentando acessar /login, redirecionar
    if (isLoggedIn && pathname === '/login') {
      return NextResponse.redirect(new URL('/campaigns', req.url));
    }
    return NextResponse.next();
  }

  // Rotas protegidas — exigir login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
