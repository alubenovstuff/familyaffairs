import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = !!req.auth;

  const publicPaths = ['/login', '/onboarding'];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isAuthed && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthed && pathname === '/login') {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
