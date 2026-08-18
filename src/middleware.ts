import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // 1. If visiting from work.ivanaffriandi.com at root "/", rewrite to "/work"
  if ((hostname.startsWith('work.') || hostname.includes('work.ivanaffriandi.com')) && pathname === '/') {
    return NextResponse.rewrite(new URL('/work', request.url));
  }

  // 2. If visiting from blog.ivanaffriandi.com at root "/", rewrite to "/blog"
  if ((hostname.startsWith('blog.') || hostname.includes('blog.ivanaffriandi.com')) && pathname === '/') {
    return NextResponse.rewrite(new URL('/blog', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
