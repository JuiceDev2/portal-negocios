export const dynamic = 'force-static';

export default function PaginaOffline() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-marquesina text-sm tracking-[0.3em] text-terciopelo/80">
        SIN CONEXIÓN
      </p>
      <h1 className="font-marquesina text-3xl tracking-wide text-marquesina sm:text-4xl">
        No hay función por ahora
      </h1>
      <p className="max-w-sm text-opaco">
        Parece que no tienes conexión a internet. Revisa tu red e intenta de nuevo.
      </p>
    </main>
  );
}
