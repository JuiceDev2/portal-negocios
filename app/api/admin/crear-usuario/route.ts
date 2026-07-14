import { NextRequest, NextResponse } from 'next/server';
import { crearClienteServidor, crearClienteAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Solo un admin autenticado puede crear cuentas de moderador/admin.
  const supabaseSesion = crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { data: perfil } = await supabaseSesion.from('perfiles').select('rol').eq('id', user.id).single();
  if (perfil?.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const { correo, clave, nombre, rol } = await request.json();

  if (!correo || !clave || !nombre || !['admin', 'moderador'].includes(rol)) {
    return NextResponse.json({ error: 'Datos incompletos o rol inválido.' }, { status: 400 });
  }

  const supabaseAdmin = crearClienteAdmin();

  const { data: nuevoUsuario, error: errorCreacion } = await supabaseAdmin.auth.admin.createUser({
    email: correo,
    password: clave,
    email_confirm: true,
  });

  if (errorCreacion || !nuevoUsuario.user) {
    return NextResponse.json(
      { error: errorCreacion?.message ?? 'No se pudo crear el usuario.' },
      { status: 500 }
    );
  }

  const { error: errorPerfil } = await supabaseAdmin
    .from('perfiles')
    .insert({ id: nuevoUsuario.user.id, nombre, rol });

  if (errorPerfil) {
    return NextResponse.json({ error: errorPerfil.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
