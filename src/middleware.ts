import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  const isBlogSubdomain = hostname.startsWith('blog.') || hostname.includes('blog.ivanaffriandi.com');
  const isWorkSubdomain = hostname.startsWith('work.') || hostname.includes('work.ivanaffriandi.com');

  // 1. If visiting on blog subdomain (e.g. blog.ivanaffriandi.com)
  if (isBlogSubdomain) {
    // If accessing /ask, rewrite directly to /ask
    if (pathname.startsWith('/ask')) {
      return NextResponse.rewrite(new URL(pathname + search, request.url));
    }
    // If URL contains /blog, strip it to keep URL purely blog.ivanaffriandi.com/...
    if (pathname.startsWith('/blog')) {
      const cleanPath = pathname.replace(/^\/blog/, '') || '/';
      return NextResponse.redirect(new URL(cleanPath + search, request.url), 308);
    }
    // Rewrite all paths under blog subdomain to internal /blog page
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      return NextResponse.rewrite(new URL(`/blog${pathname === '/' ? '' : pathname}`, request.url));
    }
    return NextResponse.next();
  }

  // 2. If visiting on work subdomain (e.g. work.ivanaffriandi.com)
  if (isWorkSubdomain) {
    // If URL contains /work, strip it to keep URL purely work.ivanaffriandi.com/...
    if (pathname.startsWith('/work')) {
      const cleanPath = pathname.replace(/^\/work/, '') || '/';
      return NextResponse.redirect(new URL(cleanPath + search, request.url), 308);
    }
    // Rewrite all paths under work subdomain to internal /work page
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      return NextResponse.rewrite(new URL(`/work${pathname === '/' ? '' : pathname}`, request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
