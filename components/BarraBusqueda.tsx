'use client';

import { useState } from 'react';

interface Props {
  onBuscar: (nombre: string, municipio: string) => void;
  municipios: string[];
}

export default function BarraBusqueda({ onBuscar, municipios }: Props) {
  const [nombre, setNombre] = useState('');
  const [municipio, setMunicipio] = useState('');

  function manejarCambio(nuevoNombre: string, nuevoMunicipio: string) {
    setNombre(nuevoNombre);
    setMunicipio(nuevoMunicipio);
    onBuscar(nuevoNombre, nuevoMunicipio);
  }

  return (
    <div className="marco-marquesina mx-auto flex w-full max-w-2xl flex-col gap-3 rounded-sm bg-telon-alto/80 px-5 py-6 backdrop-blur sm:flex-row sm:items-center">
      <input
        type="text"
        value={nombre}
        onChange={(e) => manejarCambio(e.target.value, municipio)}
        placeholder="Busca un negocio por nombre..."
        className="w-full flex-1 border-b border-opaco/40 bg-transparent px-1 py-2 text-crema placeholder:text-opaco focus:border-marquesina focus:outline-none"
      />
      <select
        value={municipio}
        onChange={(e) => manejarCambio(nombre, e.target.value)}
        className="w-full shrink-0 rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none sm:w-52"
      >
        <option value="">Todos los municipios</option>
        {municipios.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
