'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { crearClienteNavegador } from '@/lib/supabase/client';

export default function FormularioActualizarClave() {
  const [clave, setClave] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [listo, setListo] = useState(false);
  const router = useRouter();

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (clave.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (clave !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setGuardando(true);
    const supabase = crearClienteNavegador();
    const { error: errorSupabase } = await supabase.auth.updateUser({ password: clave });
    setGuardando(false);

    if (errorSupabase) {
      setError('El enlace expiró o ya se usó. Solicita uno nuevo.');
      return;
    }

    setListo(true);
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 2000);
  }

  if (listo) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="font-marquesina text-2xl tracking-wide text-marquesina">
          Contraseña actualizada. Redirigiendo...
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={manejarEnvio}
        className="marco-marquesina w-full max-w-sm rounded-sm bg-telon-alto/90 p-8"
      >
        <h1 className="mb-6 text-center font-marquesina text-3xl tracking-wide text-marquesina">
          Nueva contraseña
        </h1>

        <label className="mb-1 block text-sm text-opaco">Nueva contraseña</label>
        <input
          type="password"
          required
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="mb-4 w-full rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />

        <label className="mb-1 block text-sm text-opaco">Confirmar contraseña</label>
        <input
          type="password"
          required
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          className="mb-6 w-full rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />

        {error && <p className="mb-4 text-sm text-terciopelo">{error}</p>}

        <button
          type="submit"
          disabled={guardando}
          className="w-full rounded-sm bg-marquesina py-2 font-marquesina text-lg tracking-wide text-telon hover:bg-crema disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Guardar contraseña'}
        </button>
      </form>
    </main>
  );
}
