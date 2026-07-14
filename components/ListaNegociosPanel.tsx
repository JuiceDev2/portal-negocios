'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteNavegador } from '@/lib/supabase/client';
import type { Negocio } from '@/lib/types';

export default function ListaNegociosPanel({
  negocios,
  puedeBorrar,
}: {
  negocios: Negocio[];
  puedeBorrar: boolean;
}) {
  const router = useRouter();
  const [procesando, setProcesando] = useState<string | null>(null);

  async function alternarActivo(negocio: Negocio) {
    setProcesando(negocio.id);
    const supabase = crearClienteNavegador();
    await supabase.from('negocios').update({ activo: !negocio.activo }).eq('id', negocio.id);
    setProcesando(null);
    router.refresh();
  }

  async function borrar(negocio: Negocio) {
    if (!confirm(`¿Eliminar "${negocio.nombre}" y su imagen de forma permanente?`)) return;
    setProcesando(negocio.id);
    const res = await fetch(`/api/admin/borrar-negocio?id=${negocio.id}`, { method: 'DELETE' });
    setProcesando(null);
    if (!res.ok) {
      const datos = await res.json().catch(() => ({}));
      alert(datos.error ?? 'No se pudo borrar el negocio.');
      return;
    }
    router.refresh();
  }

  if (negocios.length === 0) {
    return <p className="text-opaco">Todavía no hay negocios registrados.</p>;
  }

  return (
    <div className="flex flex-col divide-y divide-opaco/20 rounded-sm bg-telon-alto/60">
      {negocios.map((n) => (
        <div key={n.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <p className="font-marquesina text-lg tracking-wide text-crema">{n.nombre}</p>
            <p className="text-xs text-opaco">
              {n.sucursales?.map((s) => s.municipio).join(' · ') || 'sin sucursales'} ·{' '}
              <span className={n.activo ? 'text-marquesina' : 'text-terciopelo'}>
                {n.activo ? 'activo' : 'inactivo'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/moderador/negocio/${n.id}`} className="text-opaco hover:text-marquesina">
              Editar
            </Link>
            <button
              disabled={procesando === n.id}
              onClick={() => alternarActivo(n)}
              className="text-opaco hover:text-marquesina disabled:opacity-50"
            >
              {n.activo ? 'Desactivar' : 'Activar'}
            </button>
            {puedeBorrar && (
              <button
                disabled={procesando === n.id}
                onClick={() => borrar(n)}
                className="text-terciopelo hover:text-marquesina disabled:opacity-50"
              >
                Borrar
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
