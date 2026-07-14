import { crearClienteServidor } from '@/lib/supabase/server';
import type { NegocioTarjeta } from '@/lib/types';
import ExploradorNegocios from '@/components/ExploradorNegocios';

export const revalidate = 60;

async function obtenerNegociosActivos(): Promise<NegocioTarjeta[]> {
  const supabase = crearClienteServidor();
  // Solo se piden los campos que la tarjeta pinta: nada de descripcion, url_destino
  // ni fechas, para que la respuesta pese poco sin importar cuántos negocios haya.
  const { data, error } = await supabase
    .from('negocios')
    .select('id, nombre, imagen_portada_url, sucursales(municipio)')
    .eq('activo', true);

  if (error) {
    console.error('Error al cargar negocios:', error.message);
    return [];
  }
  return (data as unknown as NegocioTarjeta[]) ?? [];
}

export default async function PaginaInicio() {
  const negocios = await obtenerNegociosActivos();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10 sm:px-8">
      <header className="text-center">
        <p className="font-marquesina text-sm tracking-[0.3em] text-terciopelo/80">
          FUNCIÓN CONTINUA
        </p>
        <h1 className="font-marquesina text-5xl tracking-wide text-marquesina sm:text-6xl">
          La Marquesina
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-opaco">
          Los negocios de tu zona, en cartelera. Busca por nombre o elige un municipio para ver
          qué está en función.
        </p>
      </header>

      <ExploradorNegocios negocios={negocios} />

      <footer className="mt-auto pt-10 text-center text-xs text-opaco">
        <a href="/moderador/login" className="hover:text-marquesina">
          Acceso moderador
        </a>
        {' · '}
        <a href="/admin/login" className="hover:text-marquesina">
          Acceso administrador
        </a>
      </footer>
    </main>
  );
}
