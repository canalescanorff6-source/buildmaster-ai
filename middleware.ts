import { NextResponse, type NextRequest } from 'next/server';

<<<<<<< HEAD
// BuildMaster Elite Tático v24
=======
// BuildMaster Local Pro v6.2
>>>>>>> 9b74f5472a5f6cb32ce449c01f27fc9f11e1b6f6
// Middleware neutralizado de propósito.
// Versões antigas redirecionavam para /login usando cookie da Vercel.
// O login atual é 100% local no navegador, então este arquivo apenas libera a navegação.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
