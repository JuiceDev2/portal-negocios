'use client';

import { useMemo, useState } from 'react';
import type { NegocioTarjeta } from '@/lib/types';
import BarraBusqueda from './BarraBusqueda';
import PasarelaPortadas from './PasarelaPortadas';

export default function ExploradorNegocios({ negocios }: { negocios: NegocioTarjeta[] }) {
  const [nombre, setNombre] = useState('');
  const [municipio, setMunicipio] = useState('');

  const municipios = useMemo(() => {
    const set = new Set<string>();
    negocios.forEach((n) => n.sucursales.forEach((s) => set.add(s.municipio)));
    return Array.from(set).sort();
  }, [negocios]);

  const filtrados = useMemo(() => {
    return negocios.filter((n) => {
      const coincideNombre = n.nombre.toLowerCase().includes(nombre.toLowerCase().trim());
      const coincideMunicipio = !municipio || n.sucursales.some((s) => s.municipio === municipio);
      return coincideNombre && coincideMunicipio;
    });
  }, [negocios, nombre, municipio]);

  return (
    <div className="flex flex-col gap-10">
      <BarraBusqueda
        municipios={municipios}
        onBuscar={(n, m) => {
          setNombre(n);
          setMunicipio(m);
        }}
      />

      {filtrados.length === 0 ? (
        <p className="text-center text-opaco">
          No encontramos negocios con esos filtros. Intenta con otro nombre o municipio.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Ambas pasarelas reciben la lista completa filtrada: cada una la baraja
              y la rota por su cuenta, así que no muestran necesariamente lo mismo. */}
          <PasarelaPortadas negocios={filtrados} direccion="izquierda" />
          <PasarelaPortadas negocios={filtrados} direccion="derecha" />
        </div>
      )}
    </div>
  );
}
