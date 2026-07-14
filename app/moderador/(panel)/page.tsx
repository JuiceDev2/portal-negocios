import Link from 'next/link';
import { crearClienteServidor } from '@/lib/supabase/server';
import ListaNegociosPanel from '@/components/ListaNegociosPanel';

export const dynamic = 'force-dynamic';

export default async function PanelModerador() {
  const supabase = crearClienteServidor();
  const { data: negocios } = await supabase
    .from('negocios')
    .select('*, sucursales(*)')
    .order('creado_en', { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-opaco">Negocios registrados: {negocios?.length ?? 0}</p>
        <Link
          href="/moderador/nuevo"
          className="rounded-sm bg-marquesina px-5 py-2 font-marquesina tracking-wide text-telon hover:bg-crema"
        >
          + Nuevo negocio
        </Link>
      </div>
      <ListaNegociosPanel negocios={negocios ?? []} puedeBorrar={false} />
    </div>
  );
}
