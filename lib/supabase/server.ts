import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cliente de Supabase para Server Components, Route Handlers y Server Actions.
 * Lee/escribe la sesión desde las cookies de la petición.
 */
export function crearClienteServidor() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // se ignora cuando se llama desde un Server Component sin permiso de escritura
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // idem
          }
        },
      },
    }
  );
}

/**
 * Cliente con la service role key: solo para operaciones administrativas
 * en Route Handlers (ej. redimensionar y subir imágenes). NUNCA exponer al navegador.
 */
export function crearClienteAdmin() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
