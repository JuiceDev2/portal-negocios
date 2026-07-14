import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { crearClienteServidor } from '@/lib/supabase/server';
import type { Negocio } from '@/lib/types';

async function obtenerNegocio(id: string): Promise<Negocio | null> {
  const supabase = crearClienteServidor();
  const { data, error } = await supabase
    .from('negocios')
    .select('*, sucursales(*)')
    .eq('id', id)
    .eq('activo', true)
    .single();

  if (error || !data) return null;
  return data;
}

export default async function PaginaEspectacular({ params }: { params: { id: string } }) {
  const negocio = await obtenerNegocio(params.id);
  if (!negocio) notFound();

  const municipios = Array.from(new Set(negocio.sucursales?.map((s) => s.municipio) ?? []));

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      <Link href="/" className="self-start text-sm text-opaco hover:text-marquesina">
        ← Volver a la cartelera
      </Link>

      <div className="marco-marquesina relative w-full overflow-hidden rounded-sm bg-telon-alto">
        <div className="relative h-80 w-full sm:h-[26rem]">
          {negocio.imagen_portada_url ? (
            <Image
              src={negocio.imagen_portada_url}
              alt={`Espectacular de ${negocio.nombre}`}
              fill
              sizes="768px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-terciopelo/30 font-marquesina text-4xl text-crema/60">
              {negocio.nombre}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-telon via-telon/40 to-transparent" />
        </div>

        <div className="px-6 pb-8 pt-4 sm:px-10">
          <p className="font-marquesina text-sm tracking-[0.3em] text-terciopelo/80">
            AHORA EN CARTELERA
          </p>
          <h1 className="font-marquesina text-4xl tracking-wide text-marquesina sm:text-5xl">
            {negocio.nombre}
          </h1>
          {municipios.length > 0 && (
            <p className="mt-2 text-sm text-opaco">{municipios.join(' · ')}</p>
          )}
          <p className="mx-auto mt-5 max-w-xl text-crema/90">{negocio.descripcion}</p>

          <a
            href={negocio.url_destino}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-sm bg-marquesina px-8 py-3 font-marquesina text-lg tracking-wide text-telon transition-colors hover:bg-crema"
          >
            Entrar al negocio
          </a>
        </div>
      </div>
    </main>
  );
}
