import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Protege /admin y /moderador: exige sesión activa y el rol correspondiente
 * (verificado contra la tabla `perfiles`, no solo contra la sesión).
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  const protegido = pathname.startsWith('/admin') || pathname.startsWith('/moderador');
  const esLogin = pathname.endsWith('/login');
  if (!protegido) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (esLogin) return response;
    const loginUrl = pathname.startsWith('/admin') ? '/admin/login' : '/moderador/login';
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol, activo')
    .eq('id', user.id)
    .single();

  const rolRequerido = pathname.startsWith('/admin') ? 'admin' : 'moderador';
  const tieneAcceso =
    Boolean(perfil?.activo) &&
    (perfil?.rol === 'admin' || (rolRequerido === 'moderador' && perfil?.rol === 'moderador'));

  if (perfil && !perfil.activo && !esLogin) {
    await supabase.auth.signOut();
    const loginUrl = pathname.startsWith('/admin') ? '/admin/login' : '/moderador/login';
    return NextResponse.redirect(new URL(`${loginUrl}?desactivada=1`, request.url));
  }

  if (!tieneAcceso && !esLogin) {
    const loginUrl = pathname.startsWith('/admin') ? '/admin/login' : '/moderador/login';
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  if (tieneAcceso && esLogin) {
    const destino = pathname.startsWith('/admin') ? '/admin' : '/moderador';
    return NextResponse.redirect(new URL(destino, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/moderador/:path*'],
};
