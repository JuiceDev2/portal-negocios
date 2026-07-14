'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { crearClienteNavegador } from '@/lib/supabase/client';
import type { Negocio, Sucursal } from '@/lib/types';

interface SucursalBorrador {
  id?: string;
  municipio: string;
  direccion: string;
}

export default function FormularioNegocio({ negocioExistente }: { negocioExistente?: Negocio }) {
  const router = useRouter();
  const esEdicion = Boolean(negocioExistente);

  const [nombre, setNombre] = useState(negocioExistente?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(negocioExistente?.descripcion ?? '');
  const [urlDestino, setUrlDestino] = useState(negocioExistente?.url_destino ?? '');
  const [imagenUrl, setImagenUrl] = useState(negocioExistente?.imagen_portada_url ?? '');
  const [sucursales, setSucursales] = useState<SucursalBorrador[]>(
    negocioExistente?.sucursales?.map((s: Sucursal) => ({
      id: s.id,
      municipio: s.municipio,
      direccion: s.direccion ?? '',
    })) ?? [{ municipio: '', direccion: '' }]
  );

  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [notaImagen, setNotaImagen] = useState('');

  async function manejarArchivoImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    setSubiendoImagen(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('imagen', archivo);
      const res = await fetch('/api/upload-imagen', { method: 'POST', body: formData });
      const datos = await res.json();

      if (!res.ok) {
        setError(datos.error ?? 'No se pudo subir la imagen.');
      } else {
        setImagenUrl(datos.url);
        setNotaImagen(`Optimizada: ${datos.pesoOriginalKb} KB → ${datos.pesoFinalKb} KB`);
      }
    } catch {
      setError('Error de red al subir la imagen.');
    } finally {
      setSubiendoImagen(false);
    }
  }

  function agregarSucursal() {
    setSucursales([...sucursales, { municipio: '', direccion: '' }]);
  }

  function actualizarSucursal(i: number, campo: keyof SucursalBorrador, valor: string) {
    const copia = [...sucursales];
    copia[i] = { ...copia[i], [campo]: valor };
    setSucursales(copia);
  }

  function quitarSucursal(i: number) {
    setSucursales(sucursales.filter((_, idx) => idx !== i));
  }

  async function manejarEnvio(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const sucursalesValidas = sucursales.filter((s) => s.municipio.trim() !== '');
    if (sucursalesValidas.length === 0) {
      setError('Agrega al menos una sucursal con su municipio.');
      return;
    }

    setGuardando(true);
    const supabase = crearClienteNavegador();

    try {
      let negocioId = negocioExistente?.id;

      if (esEdicion && negocioId) {
        const { error: errorUpdate } = await supabase
          .from('negocios')
          .update({ nombre, descripcion, url_destino: urlDestino, imagen_portada_url: imagenUrl || null })
          .eq('id', negocioId);
        if (errorUpdate) throw errorUpdate;

        // Reemplaza las sucursales: borra las anteriores y crea las actuales.
        await supabase.from('sucursales').delete().eq('negocio_id', negocioId);
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: nuevoNegocio, error: errorInsert } = await supabase
          .from('negocios')
          .insert({
            nombre,
            descripcion,
            url_destino: urlDestino,
            imagen_portada_url: imagenUrl || null,
            creado_por: user?.id,
          })
          .select()
          .single();

        if (errorInsert) throw errorInsert;
        negocioId = nuevoNegocio.id;
      }

      const { error: errorSucursales } = await supabase.from('sucursales').insert(
        sucursalesValidas.map((s) => ({
          negocio_id: negocioId,
          municipio: s.municipio.trim(),
          direccion: s.direccion.trim() || null,
        }))
      );
      if (errorSucursales) throw errorSucursales;

      router.push('/moderador');
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'No se pudo guardar el negocio.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={manejarEnvio} className="flex flex-col gap-6 rounded-sm bg-telon-alto/60 p-6">
      <div>
        <label className="mb-1 block text-sm text-opaco">Nombre del negocio</label>
        <input
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-opaco">Descripción</label>
        <textarea
          required
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-opaco">
          URL de la app web del negocio (a dónde redirige)
        </label>
        <input
          required
          type="url"
          placeholder="https://..."
          value={urlDestino}
          onChange={(e) => setUrlDestino(e.target.value)}
          className="w-full rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-opaco">Imagen de portada (espectacular)</label>
        <input
          type="file"
          accept="image/*"
          onChange={manejarArchivoImagen}
          className="w-full text-sm text-crema file:mr-3 file:rounded-sm file:border-0 file:bg-marquesina file:px-4 file:py-2 file:text-telon"
        />
        {subiendoImagen && <p className="mt-1 text-sm text-opaco">Optimizando imagen...</p>}
        {notaImagen && <p className="mt-1 text-sm text-opaco">{notaImagen}</p>}
        {imagenUrl && (
          <div className="relative mt-3 h-40 w-32 overflow-hidden rounded-sm border border-opaco/30">
            <Image src={imagenUrl} alt="Vista previa" fill className="object-cover" />
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm text-opaco">Sucursales / municipios</label>
          <button
            type="button"
            onClick={agregarSucursal}
            className="text-sm text-marquesina hover:underline"
          >
            + Agregar sucursal
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {sucursales.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <input
                required
                placeholder="Municipio"
                value={s.municipio}
                onChange={(e) => actualizarSucursal(i, 'municipio', e.target.value)}
                className="w-full flex-1 rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none sm:w-auto"
              />
              <input
                placeholder="Dirección (opcional)"
                value={s.direccion}
                onChange={(e) => actualizarSucursal(i, 'direccion', e.target.value)}
                className="w-full flex-1 rounded-sm border border-opaco/40 bg-telon px-3 py-2 text-crema focus:border-marquesina focus:outline-none sm:w-auto"
              />
              {sucursales.length > 1 && (
                <button
                  type="button"
                  onClick={() => quitarSucursal(i)}
                  className="shrink-0 px-3 text-terciopelo hover:text-marquesina"
                >
                  Quitar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-terciopelo">{error}</p>}

      <button
        type="submit"
        disabled={guardando || subiendoImagen}
        className="w-full rounded-sm bg-marquesina py-3 font-marquesina text-lg tracking-wide text-telon hover:bg-crema disabled:opacity-50 sm:w-60"
      >
        {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Publicar negocio'}
      </button>
    </form>
  );
}
