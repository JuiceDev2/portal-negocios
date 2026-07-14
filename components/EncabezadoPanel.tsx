'use client';

import { useRouter } from 'next/navigation';
import { crearClienteNavegador } from '@/lib/supabase/client';

export default function EncabezadoPanel({ titulo }: { titulo: string }) {
  const router = useRouter();

  async function cerrarSesion() {
    const supabase = crearClienteNavegador();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <header className="marco-marquesina mb-8 flex items-center justify-between rounded-sm bg-telon-alto/80 px-6 py-4">
      <div>
        <p className="font-marquesina text-xs tracking-[0.3em] text-terciopelo/80">EL ARENALENSE</p>
        <h1 className="font-marquesina text-2xl tracking-wide text-marquesina">{titulo}</h1>
      </div>
      <div className="flex items-center gap-4">
        <a href="/" className="text-sm text-opaco hover:text-marquesina">
          Ver cartelera
        </a>
        <button
          onClick={cerrarSesion}
          className="rounded-sm border border-opaco/40 px-4 py-2 text-sm text-crema hover:border-marquesina hover:text-marquesina"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
