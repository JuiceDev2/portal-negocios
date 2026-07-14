'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { NegocioTarjeta } from '@/lib/types';

export default function PortadaNegocio({ negocio }: { negocio: NegocioTarjeta }) {
  return (
    <Link
      href={`/negocio/${negocio.id}`}
      className="group relative mx-3 flex h-72 w-48 shrink-0 flex-col overflow-hidden rounded-sm border border-marquesina/20 bg-telon-alto shadow-lg shadow-black/40 transition-transform duration-300 hover:-translate-y-2 hover:border-marquesina/60 sm:h-80 sm:w-52"
    >
      <div className="relative flex-1 overflow-hidden">
        {negocio.imagen_portada_url ? (
          <Image
            src={negocio.imagen_portada_url}
            alt={`Portada de ${negocio.nombre}`}
            fill
            sizes="208px"
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-cielo/20 font-marquesina text-2xl tracking-wide text-crema/60">
            {negocio.nombre.slice(0, 1)}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-telon via-transparent to-transparent" />
      </div>
      <div className="px-3 pb-3 pt-2">
        <p className="truncate font-marquesina text-lg tracking-wide text-marquesina">
          {negocio.nombre}
        </p>
        {negocio.sucursales.length > 0 && (
          <p className="truncate text-xs text-opaco">
            {negocio.sucursales.map((s) => s.municipio).join(' · ')}
          </p>
        )}
      </div>
    </Link>
  );
}
