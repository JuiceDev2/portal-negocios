'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente de Supabase para usar en Client Components ('use client').
 * Usa la anon key: respeta siempre las políticas de RLS definidas en supabase/schema.sql.
 */
export function crearClienteNavegador() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
