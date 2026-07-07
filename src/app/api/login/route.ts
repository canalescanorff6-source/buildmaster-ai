import { NextResponse } from 'next/server';

function expectedUser() {
  return process.env.BUILDMASTER_LOGIN_USER ?? 'thiago0126';
}

function expectedPassword() {
  return process.env.BUILDMASTER_LOGIN_PASSWORD ?? 'iu1fsaa67a';
}

function sessionToken() {
  return process.env.BUILDMASTER_SESSION_TOKEN ?? 'buildmaster-ai-v5-thiago-secure-session';
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body?.username ?? '').trim();
  const password = String(body?.password ?? '').trim();

  if (username !== expectedUser() || password !== expectedPassword()) {
    return NextResponse.json({ ok: false, error: 'Login ou senha incorretos.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('bm_session', sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14
  });

  return response;
}
