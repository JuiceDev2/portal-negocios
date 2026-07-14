import Link from 'next/link';
import { crearClienteServidor } from '@/lib/supabase/server';
import ListaNegociosPanel from '@/components/ListaNegociosPanel';
import ListaStaffPanel from '@/components/ListaStaffPanel';
import FormularioNuevoStaff from '@/components/FormularioNuevoStaff';

export const dynamic = 'force-dynamic';

export default async function PanelAdmin() {
  const supabase = crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: negocios }, { data: perfiles }] = await Promise.all([
    supabase.from('negocios').select('*, sucursales(*)').order('creado_en', { ascending: false }),
    supabase.from('perfiles').select('*').order('creado_en', { ascending: false }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-marquesina text-2xl tracking-wide text-crema">
            Negocios ({negocios?.length ?? 0})
          </h2>
          <Link
            href="/moderador/nuevo"
            className="rounded-sm bg-marquesina px-5 py-2 font-marquesina tracking-wide text-telon hover:bg-crema"
          >
            + Nuevo negocio
          </Link>
        </div>
        <ListaNegociosPanel negocios={negocios ?? []} puedeBorrar />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-marquesina text-2xl tracking-wide text-crema">Equipo</h2>
        <ListaStaffPanel perfiles={perfiles ?? []} idPropio={user?.id ?? ''} />
        <FormularioNuevoStaff />
      </section>
    </div>
  );
}
