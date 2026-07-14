import { NextRequest, NextResponse } from 'next/server';
import { crearClienteServidor, crearClienteAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

async function verificarAdmin() {
  const supabaseSesion = crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();

  if (!user) return { ok: false as const, status: 401, error: 'No autenticado.' };

  const { data: perfil } = await supabaseSesion
    .from('perfiles')
    .select('rol, activo')
    .eq('id', user.id)
    .single();

  if (!perfil?.activo || perfil.rol !== 'admin') {
    return { ok: false as const, status: 403, error: 'No autorizado.' };
  }

  return { ok: true as const, idPropio: user.id };
}

// Activar / desactivar una cuenta de staff.
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const verificacion = await verificarAdmin();
  if (!verificacion.ok) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  if (params.id === verificacion.idPropio) {
    return NextResponse.json({ error: 'No puedes desactivar tu propia cuenta.' }, { status: 400 });
  }

  const { activo } = await request.json();
  const supabaseAdmin = crearClienteAdmin();

  const { error } = await supabaseAdmin.from('perfiles').update({ activo }).eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'No se pudo actualizar la cuenta.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Eliminar una cuenta de staff por completo (Auth + perfil).
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const verificacion = await verificarAdmin();
  if (!verificacion.ok) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  if (params.id === verificacion.idPropio) {
    return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
  }

  const supabaseAdmin = crearClienteAdmin();

  // Borrar el usuario de Auth también elimina en cascada su fila en "perfiles"
  // (FK perfiles.id -> auth.users.id ON DELETE CASCADE).
  const { error } = await supabaseAdmin.auth.admin.deleteUser(params.id);
  if (error) {
    return NextResponse.json({ error: 'No se pudo eliminar la cuenta.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
