import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;

  const isBlogSubdomain = hostname.startsWith('blog.') || hostname.includes('blog.ivanaffriandi.com');
  const isWorkSubdomain = hostname.startsWith('work.') || hostname.includes('work.ivanaffriandi.com');

  // 1. If visiting on blog subdomain
  if (isBlogSubdomain) {
    // If someone visits blog.ivanaffriandi.com/blog/xxx, strip "/blog" from URL
    if (pathname.startsWith('/blog')) {
      const cleanPath = pathname.replace(/^\/blog/, '') || '/';
      return NextResponse.redirect(new URL(cleanPath + search, request.url), 308);
    }
    // Rewrite all paths under blog subdomain to internal /blog routes
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      return NextResponse.rewrite(new URL(`/blog${pathname === '/' ? '' : pathname}`, request.url));
    }
    return NextResponse.next();
  }

  // 2. If visiting on work subdomain
  if (isWorkSubdomain) {
    // If someone visits work.ivanaffriandi.com/work/xxx, strip "/work" from URL
    if (pathname.startsWith('/work')) {
      const cleanPath = pathname.replace(/^\/work/, '') || '/';
      return NextResponse.redirect(new URL(cleanPath + search, request.url), 308);
    }
    // Rewrite all paths under work subdomain to internal /work routes
    if (!pathname.startsWith('/api') && !pathname.startsWith('/_next')) {
      return NextResponse.rewrite(new URL(`/work${pathname === '/' ? '' : pathname}`, request.url));
    }
    return NextResponse.next();
  }

  // 3. If visiting on main domain (ivanaffriandi.com) and accessing /blog or /work directly in URL, redirect to subdomains
  if (!isBlogSubdomain && !isWorkSubdomain) {
    if (pathname.startsWith('/blog')) {
      const targetPath = pathname.replace(/^\/blog/, '') || '';
      const domain = hostname.includes('localhost') ? `blog.localhost:3000` : `blog.ivanaffriandi.com`;
      const protocol = request.nextUrl.protocol || 'https:';
      return NextResponse.redirect(`${protocol}//${domain}${targetPath}${search}`, 308);
    }

    if (pathname.startsWith('/work')) {
      const targetPath = pathname.replace(/^\/work/, '') || '';
      const domain = hostname.includes('localhost') ? `work.localhost:3000` : `work.ivanaffriandi.com`;
      const protocol = request.nextUrl.protocol || 'https:';
      return NextResponse.redirect(`${protocol}//${domain}${targetPath}${search}`, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
