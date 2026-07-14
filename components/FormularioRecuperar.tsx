'use client';

import { useState } from 'react';
import { crearClienteNavegador } from '@/lib/supabase/client';

export default function FormularioRecuperar() {
  const [correo, setCorreo] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError('');

    const supabase = crearClienteNavegador();
    const { error: errorSupabase } = await supabase.auth.resetPasswordForEmail(correo, {
      redirectTo: `${window.location.origin}/actualizar-clave`,
    });

    setEnviando(false);

    if (errorSupabase) {
      setError('No se pudo enviar el correo. Verifica la dirección.');
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="marco-marquesina max-w-sm rounded-sm bg-telon-alto/90 p-8">
          <p className="font-marquesina text-2xl tracking-wide text-marquesina">Revisa tu correo</p>
          <p className="mt-3 text-opaco">
            Si <span className="text-crema">{correo}</span> tiene una cuenta, te llegará un enlace
            para elegir una nueva contraseña.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={manejarEnvio}
        className="marco-marquesina w-full max-w-sm rounded-sm bg-telon-alto/90 p-8"
      >
        <h1 className="mb-2 text-center font-marquesina text-3xl tracking-wide text-marquesina">
          Recuperar acceso
        </h1>
        <p className="mb-6 text-center text-sm text-opaco">
          Escribe tu correo y te enviaremos un enlace para restablecer tu contraseña.
        </p>

        <label className="mb-1 block text-sm text-opaco">Correo</label>
        <input
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="mb-4 w-full rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />

        {error && <p className="mb-4 text-sm text-terciopelo">{error}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full rounded-sm bg-marquesina py-2 font-marquesina text-lg tracking-wide text-telon hover:bg-crema disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Enviar enlace'}
        </button>
      </form>
    </main>
  );
}
