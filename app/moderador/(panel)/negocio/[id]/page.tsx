import { notFound } from 'next/navigation';
import { crearClienteServidor } from '@/lib/supabase/server';
import FormularioNegocio from '@/components/FormularioNegocio';

export default async function EditarNegocio({ params }: { params: { id: string } }) {
  const supabase = crearClienteServidor();
  const { data: negocio } = await supabase
    .from('negocios')
    .select('*, sucursales(*)')
    .eq('id', params.id)
    .single();

  if (!negocio) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-marquesina text-2xl tracking-wide text-crema">Editar negocio</h2>
      <FormularioNegocio negocioExistente={negocio} />
    </div>
  );
}
