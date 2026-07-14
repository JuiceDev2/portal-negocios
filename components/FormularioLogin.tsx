'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FormularioLogin({
  destino,
  titulo,
}: {
  destino: string;
  titulo: string;
}) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cuentaDesactivada = searchParams.get('desactivada') === '1';

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);

    const res = await fetch('/api/auth/iniciar-sesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, clave }),
    });
    const datos = await res.json();

    setCargando(false);

    if (!res.ok) {
      setError(datos.error ?? 'Correo o contraseña incorrectos.');
      return;
    }

    router.push(destino);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={manejarEnvio}
        className="marco-marquesina w-full max-w-sm rounded-sm bg-telon-alto/90 p-8"
      >
        <h1 className="mb-6 text-center font-marquesina text-3xl tracking-wide text-marquesina">
          {titulo}
        </h1>

        {cuentaDesactivada && (
          <p className="mb-4 rounded-sm border border-terciopelo/50 bg-terciopelo/10 px-3 py-2 text-sm text-crema">
            Tu cuenta fue desactivada. Contacta a un administrador.
          </p>
        )}

        <label className="mb-1 block text-sm text-opaco">Correo</label>
        <input
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="mb-4 w-full rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />

        <label className="mb-1 block text-sm text-opaco">Contraseña</label>
        <input
          type="password"
          required
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="mb-6 w-full rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />

        {error && <p className="mb-4 text-sm text-terciopelo">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-sm bg-marquesina py-2 font-marquesina text-lg tracking-wide text-telon transition-colors hover:bg-crema disabled:opacity-50"
        >
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>

        <a
          href="/recuperar"
          className="mt-4 block text-center text-sm text-opaco hover:text-marquesina"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </form>
    </main>
  );
}
