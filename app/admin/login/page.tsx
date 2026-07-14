import { Suspense } from 'react';
import FormularioLogin from '@/components/FormularioLogin';

export default function LoginAdmin() {
  return (
    <Suspense fallback={null}>
      <FormularioLogin destino="/admin" titulo="Acceso Administrador" />
    </Suspense>
  );
}
