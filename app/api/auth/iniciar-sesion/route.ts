import { NextRequest, NextResponse } from 'next/server';
import { crearClienteServidor, crearClienteAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;

export async function POST(request: NextRequest) {
  const { correo, clave } = await request.json();

  if (!correo || !clave) {
    return NextResponse.json({ error: 'Faltan correo o contraseña.' }, { status: 400 });
  }

  const correoNormalizado = String(correo).trim().toLowerCase();
  const supabaseAdmin = crearClienteAdmin();

  // 1) ¿Está bloqueado por intentos fallidos?
  const { data: registro } = await supabaseAdmin
    .from('intentos_login')
    .select('*')
    .eq('correo', correoNormalizado)
    .single();

  if (registro?.bloqueado_hasta && new Date(registro.bloqueado_hasta) > new Date()) {
    const minutosRestantes = Math.ceil(
      (new Date(registro.bloqueado_hasta).getTime() - Date.now()) / 60000
    );
    return NextResponse.json(
      { error: `Demasiados intentos fallidos. Intenta de nuevo en ${minutosRestantes} min.` },
      { status: 429 }
    );
  }

  // 2) Intentar el login real contra Supabase Auth (esta llamada sí setea las cookies de sesión).
  const supabaseSesion = crearClienteServidor();
  const { error: errorAuth } = await supabaseSesion.auth.signInWithPassword({
    email: correoNormalizado,
    password: clave,
  });

  if (errorAuth) {
    const intentosPrevios = registro?.intentos ?? 0;
    const nuevosIntentos = intentosPrevios + 1;
    const seBloquea = nuevosIntentos >= MAX_INTENTOS;

    await supabaseAdmin.from('intentos_login').upsert({
      correo: correoNormalizado,
      intentos: seBloquea ? 0 : nuevosIntentos,
      bloqueado_hasta: seBloquea
        ? new Date(Date.now() + MINUTOS_BLOQUEO * 60000).toISOString()
        : null,
      actualizado_en: new Date().toISOString(),
    });

    if (seBloquea) {
      return NextResponse.json(
        { error: `Demasiados intentos fallidos. Intenta de nuevo en ${MINUTOS_BLOQUEO} min.` },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
  }

  // 3) Login correcto: limpia el contador de intentos.
  await supabaseAdmin.from('intentos_login').delete().eq('correo', correoNormalizado);

  return NextResponse.json({ ok: true });
}
