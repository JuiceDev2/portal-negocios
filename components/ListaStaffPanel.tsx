'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Perfil } from '@/lib/types';

export default function ListaStaffPanel({
  perfiles,
  idPropio,
}: {
  perfiles: Perfil[];
  idPropio: string;
}) {
  const router = useRouter();
  const [procesando, setProcesando] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function alternarActivo(perfil: Perfil) {
    setProcesando(perfil.id);
    setError('');
    const res = await fetch(`/api/admin/staff/${perfil.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !perfil.activo }),
    });
    const datos = await res.json();
    setProcesando(null);
    if (!res.ok) {
      setError(datos.error ?? 'No se pudo actualizar la cuenta.');
      return;
    }
    router.refresh();
  }

  async function eliminar(perfil: Perfil) {
    if (!confirm(`¿Eliminar la cuenta de "${perfil.nombre}" de forma permanente?`)) return;
    setProcesando(perfil.id);
    setError('');
    const res = await fetch(`/api/admin/staff/${perfil.id}`, { method: 'DELETE' });
    const datos = await res.json();
    setProcesando(null);
    if (!res.ok) {
      setError(datos.error ?? 'No se pudo eliminar la cuenta.');
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col divide-y divide-opaco/20 rounded-sm bg-telon-alto/60">
        {perfiles.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div>
              <span className="text-crema">{p.nombre}</span>
              <span className="ml-2 text-sm uppercase tracking-wide text-marquesina">{p.rol}</span>
              {!p.activo && <span className="ml-2 text-xs text-terciopelo">(desactivada)</span>}
              {p.id === idPropio && <span className="ml-2 text-xs text-opaco">(tú)</span>}
            </div>
            {p.id !== idPropio && (
              <div className="flex items-center gap-3 text-sm">
                <button
                  disabled={procesando === p.id}
                  onClick={() => alternarActivo(p)}
                  className="text-opaco hover:text-marquesina disabled:opacity-50"
                >
                  {p.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  disabled={procesando === p.id}
                  onClick={() => eliminar(p)}
                  className="text-terciopelo hover:text-marquesina disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-terciopelo">{error}</p>}
    </div>
  );
}
