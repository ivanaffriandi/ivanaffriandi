import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // If visiting from work.ivanaffriandi.com and at root "/", rewrite to "/work"
  if ((hostname.startsWith('work.') || hostname.includes('work.ivanaffriandi.com')) && pathname === '/') {
    return NextResponse.rewrite(new URL('/work', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
