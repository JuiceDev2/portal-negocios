'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FormularioNuevoStaff() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [rol, setRol] = useState<'moderador' | 'admin'>('moderador');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMensaje('');

    const res = await fetch('/api/admin/crear-usuario', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, correo, clave, rol }),
    });
    const datos = await res.json();
    setEnviando(false);

    if (!res.ok) {
      setMensaje(datos.error ?? 'No se pudo crear la cuenta.');
      return;
    }

    setNombre('');
    setCorreo('');
    setClave('');
    setMensaje('Cuenta creada correctamente.');
    router.refresh();
  }

  return (
    <form onSubmit={manejarEnvio} className="flex flex-col gap-4 rounded-sm bg-telon-alto/60 p-6">
      <h3 className="font-marquesina text-xl tracking-wide text-crema">Nueva cuenta de equipo</h3>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          required
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="flex-1 rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />
        <input
          required
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="flex-1 rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          required
          type="password"
          placeholder="Contraseña temporal"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className="flex-1 rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value as 'moderador' | 'admin')}
          className="rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        >
          <option value="moderador">Moderador</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      {mensaje && <p className="text-sm text-opaco">{mensaje}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-sm bg-marquesina py-2 font-marquesina tracking-wide text-telon hover:bg-crema disabled:opacity-50 sm:w-52"
      >
        {enviando ? 'Creando...' : 'Crear cuenta'}
      </button>
    </form>
  );
}
