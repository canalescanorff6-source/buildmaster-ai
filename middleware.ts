import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

function sessionToken() {
  return process.env.BUILDMASTER_SESSION_TOKEN ?? 'buildmaster-ai-v5-thiago-secure-session';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === '/login' ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/logout') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get('bm_session')?.value;
  const isLoggedIn = session === sessionToken();

  if (!isLoggedIn) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ ok: false, error: 'Login necessário.' }, { status: 401 });
    }

    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
