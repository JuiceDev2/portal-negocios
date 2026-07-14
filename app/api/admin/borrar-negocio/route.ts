import { NextRequest, NextResponse } from 'next/server';
import { crearClienteServidor, crearClienteAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  // Solo un admin autenticado puede borrar un negocio de forma permanente.
  const supabaseSesion = crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { data: perfil } = await supabaseSesion
    .from('perfiles')
    .select('rol, activo')
    .eq('id', user.id)
    .single();

  if (!perfil?.activo || perfil.rol !== 'admin') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Falta el id del negocio.' }, { status: 400 });
  }

  const supabaseAdmin = crearClienteAdmin();

  const { data: negocio, error: errorBusqueda } = await supabaseAdmin
    .from('negocios')
    .select('imagen_portada_url')
    .eq('id', id)
    .single();

  if (errorBusqueda || !negocio) {
    return NextResponse.json({ error: 'El negocio no existe.' }, { status: 404 });
  }

  // 1) Borra la imagen de portada en Storage, si tiene una.
  if (negocio.imagen_portada_url) {
    const nombreArchivo = negocio.imagen_portada_url.split('/portadas/')[1];
    if (nombreArchivo) {
      await supabaseAdmin.storage.from('portadas').remove([nombreArchivo]);
    }
  }

  // 2) Borra el negocio (las sucursales se borran solas por ON DELETE CASCADE).
  const { error: errorBorrado } = await supabaseAdmin.from('negocios').delete().eq('id', id);

  if (errorBorrado) {
    return NextResponse.json({ error: 'No se pudo borrar el negocio.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
