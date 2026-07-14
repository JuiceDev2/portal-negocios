import { Suspense } from 'react';
import FormularioLogin from '@/components/FormularioLogin';

export default function LoginModerador() {
  return (
    <Suspense fallback={null}>
      <FormularioLogin destino="/moderador" titulo="Acceso Moderador" />
    </Suspense>
  );
}
