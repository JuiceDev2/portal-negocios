import EncabezadoPanel from '@/components/EncabezadoPanel';

export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-8">
      <EncabezadoPanel titulo="Panel de Administración" />
      {children}
    </div>
  );
}
