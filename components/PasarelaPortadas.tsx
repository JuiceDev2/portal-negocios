'use client';

import { useMemo, useState } from 'react';
import type { NegocioTarjeta } from '@/lib/types';
import PortadaNegocio from './PortadaNegocio';

// Tope de tarjetas que se renderizan a la vez por pasarela, sin importar cuántos
// negocios haya en total. Esto es lo que evita que la página pese con cientos de
// negocios: el DOM nunca crece más allá de TAMANO_VENTANA * 2 (por el loop infinito).
const TAMANO_VENTANA = 24;
// Cuántos negocios nuevos entran cada vez que la cinta completa una vuelta.
const AVANCE_POR_VUELTA = 6;

function barajar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default function PasarelaPortadas({
  negocios,
  direccion,
}: {
  negocios: NegocioTarjeta[];
  direccion: 'izquierda' | 'derecha';
}) {
  // Se baraja una sola vez por carga de página (no en cada render).
  const ordenAleatorio = useMemo(() => barajar(negocios), [negocios]);
  const [inicio, setInicio] = useState(0);
  const tamanoVentana = Math.min(ordenAleatorio.length, TAMANO_VENTANA);

  // "Ventana" circular sobre la lista ya barajada: siempre tiene el mismo tamaño,
  // pero su contenido va rotando, así que a lo largo del tiempo se terminan
  // mostrando todos los negocios, no solo los primeros.
  const ventana = useMemo(() => {
    if (ordenAleatorio.length === 0) return [];
    if (ordenAleatorio.length <= tamanoVentana) return ordenAleatorio;
    return Array.from(
      { length: tamanoVentana },
      (_, i) => ordenAleatorio[(inicio + i) % ordenAleatorio.length]
    );
  }, [ordenAleatorio, inicio, tamanoVentana]);

  function avanzarVentana() {
    if (ordenAleatorio.length <= tamanoVentana) return; // ya se ven todos, no hace falta rotar
    setInicio((actual) => (actual + AVANCE_POR_VUELTA) % ordenAleatorio.length);
  }

  if (ventana.length === 0) return null;

  const doble = [...ventana, ...ventana];
  const animacion = direccion === 'izquierda' ? 'animate-pasarela-izq' : 'animate-pasarela-der';

  return (
    <div className="relative overflow-hidden py-4">
      <div className="borde-rollo absolute inset-x-0 top-0 h-2" />
      <div
        onAnimationIteration={avanzarVentana}
        className={`flex w-max ${animacion} hover:[animation-play-state:paused]`}
      >
        {doble.map((negocio, i) => (
          <PortadaNegocio key={`${negocio.id}-${i}`} negocio={negocio} />
        ))}
      </div>
      <div className="borde-rollo absolute inset-x-0 bottom-0 h-2" />
    </div>
  );
}
