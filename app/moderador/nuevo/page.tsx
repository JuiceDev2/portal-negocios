import FormularioNegocio from '@/components/FormularioNegocio';

export default function NuevoNegocio() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-marquesina text-2xl tracking-wide text-crema">Agregar negocio</h2>
      <FormularioNegocio />
    </div>
  );
}
