export type Rol = 'admin' | 'moderador';

export interface Perfil {
  id: string;
  nombre: string;
  rol: Rol;
  activo: boolean;
  creado_en: string;
}

export interface Sucursal {
  id: string;
  negocio_id: string;
  municipio: string;
  direccion: string | null;
  lat: number | null;
  long: number | null;
  creado_en: string;
}

export interface Negocio {
  id: string;
  nombre: string;
  descripcion: string;
  url_destino: string;
  imagen_portada_url: string | null;
  activo: boolean;
  creado_por: string | null;
  creado_en: string;
  actualizado_en: string;
  sucursales?: Sucursal[];
}

/**
 * Versión ligera usada solo en el listado público (pasarelas): trae únicamente
 * lo necesario para pintar la tarjeta, sin descripcion/url_destino/fechas.
 */
export interface NegocioTarjeta {
  id: string;
  nombre: string;
  imagen_portada_url: string | null;
  sucursales: { municipio: string }[];
}
