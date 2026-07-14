import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { crearClienteServidor, crearClienteAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const ANCHO_MAXIMO = 900; // px - suficiente para una portada tipo poster
const CALIDAD_WEBP = 78;
const TAMANO_MAXIMO_ENTRADA = 15 * 1024 * 1024; // 15 MB de tolerancia en la imagen original

export async function POST(request: NextRequest) {
  // 1. Solo moderador o admin pueden subir imagenes.
  const supabaseSesion = crearClienteServidor();
  const {
    data: { user },
  } = await supabaseSesion.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  }

  const { data: perfil } = await supabaseSesion
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (!perfil || (perfil.rol !== 'moderador' && perfil.rol !== 'admin')) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  // 2. Leer el archivo enviado.
  const formData = await request.formData();
  const archivo = formData.get('imagen');

  if (!(archivo instanceof File)) {
    return NextResponse.json({ error: 'No se recibió ninguna imagen.' }, { status: 400 });
  }

  if (archivo.size > TAMANO_MAXIMO_ENTRADA) {
    return NextResponse.json({ error: 'La imagen es demasiado pesada (máximo 15 MB).' }, { status: 400 });
  }

  const bytesOriginales = Buffer.from(await archivo.arrayBuffer());

  // 3. Comprimir y convertir a WebP, formato ligero apto para la web.
  let bytesLigeros: Buffer;
  try {
    bytesLigeros = await sharp(bytesOriginales)
      .rotate() // respeta la orientación EXIF del teléfono
      .resize({ width: ANCHO_MAXIMO, withoutEnlargement: true })
      .webp({ quality: CALIDAD_WEBP })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: 'El archivo no es una imagen válida.' }, { status: 400 });
  }

  // 4. Subir al bucket público "portadas" con la service role (bypassa RLS de storage).
  const nombreArchivo = `${randomUUID()}.webp`;
  const supabaseAdmin = crearClienteAdmin();

  const { error: errorSubida } = await supabaseAdmin.storage
    .from('portadas')
    .upload(nombreArchivo, bytesLigeros, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    });

  if (errorSubida) {
    return NextResponse.json({ error: 'No se pudo guardar la imagen.' }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from('portadas').getPublicUrl(nombreArchivo);

  return NextResponse.json({
    url: publicUrl,
    pesoOriginalKb: Math.round(bytesOriginales.length / 1024),
    pesoFinalKb: Math.round(bytesLigeros.length / 1024),
  });
}
