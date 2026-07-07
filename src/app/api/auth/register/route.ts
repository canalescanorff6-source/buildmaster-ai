import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { registerSchema } from '@/lib/validators';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

    if (existingUser) {
      return NextResponse.json({ message: 'Este e-mail já está cadastrado.' }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { name: data.name, email: data.email, passwordHash: await hashPassword(data.password) },
      select: { id: true, name: true, email: true, role: true }
    });

    const token = await createSessionToken({ userId: user.id, email: user.email, name: user.name, role: user.role });
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Não foi possível criar sua conta.', error: String(error) }, { status: 400 });
  }
}
