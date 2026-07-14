-- =========================================================
-- Portal de Negocios - Esquema de base de datos (Supabase)
-- =========================================================
-- Ejecutar en el SQL Editor de Supabase, en orden.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------
-- 1. Perfiles (admin / moderador). El cliente NO tiene fila aqui.
-- ---------------------------------------------------------
create table if not exists perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null,
  rol         text not null check (rol in ('admin', 'moderador')),
  creado_en   timestamptz not null default now()
);

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from perfiles where id = auth.uid() and rol = 'admin'
  );
$$;

create or replace function is_moderador()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from perfiles where id = auth.uid() and rol in ('moderador', 'admin')
  );
$$;

-- ---------------------------------------------------------
-- 2. Negocios
-- ---------------------------------------------------------
create table if not exists negocios (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  descripcion         text not null default '',
  url_destino         text not null,
  imagen_portada_url  text,
  activo              boolean not null default true,
  creado_por          uuid references perfiles(id) on delete set null,
  creado_en           timestamptz not null default now(),
  actualizado_en      timestamptz not null default now()
);

create index if not exists idx_negocios_activo on negocios (activo);
create index if not exists idx_negocios_nombre on negocios using gin (to_tsvector('spanish', nombre));

-- ---------------------------------------------------------
-- 3. Sucursales (un negocio puede tener 0, 1 o varias, en distintos municipios)
-- ---------------------------------------------------------
create table if not exists sucursales (
  id          uuid primary key default gen_random_uuid(),
  negocio_id  uuid not null references negocios(id) on delete cascade,
  municipio   text not null,
  direccion   text,
  lat         double precision,
  long        double precision,
  creado_en   timestamptz not null default now()
);

create index if not exists idx_sucursales_negocio on sucursales (negocio_id);
create index if not exists idx_sucursales_municipio on sucursales (lower(municipio));

-- ---------------------------------------------------------
-- 4. Trigger: actualizar "actualizado_en" en cada UPDATE de negocios
-- ---------------------------------------------------------
create or replace function set_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists trg_negocios_actualizado on negocios;
create trigger trg_negocios_actualizado
  before update on negocios
  for each row execute function set_actualizado_en();

-- ---------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------
alter table perfiles   enable row level security;
alter table negocios   enable row level security;
alter table sucursales enable row level security;

drop policy if exists "perfiles_select_propio" on perfiles;
create policy "perfiles_select_propio" on perfiles
  for select using (id = auth.uid() or is_admin());

drop policy if exists "perfiles_admin_todo" on perfiles;
create policy "perfiles_admin_todo" on perfiles
  for all using (is_admin()) with check (is_admin());

drop policy if exists "negocios_select_publico" on negocios;
create policy "negocios_select_publico" on negocios
  for select using (activo = true or is_moderador());

drop policy if exists "negocios_insert_staff" on negocios;
create policy "negocios_insert_staff" on negocios
  for insert with check (is_moderador());

drop policy if exists "negocios_update_staff" on negocios;
create policy "negocios_update_staff" on negocios
  for update using (is_moderador()) with check (is_moderador());

drop policy if exists "negocios_delete_admin" on negocios;
create policy "negocios_delete_admin" on negocios
  for delete using (is_admin());

drop policy if exists "sucursales_select_publico" on sucursales;
create policy "sucursales_select_publico" on sucursales
  for select using (
    is_moderador() or exists (
      select 1 from negocios n where n.id = negocio_id and n.activo = true
    )
  );

drop policy if exists "sucursales_insert_staff" on sucursales;
create policy "sucursales_insert_staff" on sucursales
  for insert with check (is_moderador());

drop policy if exists "sucursales_update_staff" on sucursales;
create policy "sucursales_update_staff" on sucursales
  for update using (is_moderador()) with check (is_moderador());

drop policy if exists "sucursales_delete_staff" on sucursales;
create policy "sucursales_delete_staff" on sucursales
  for delete using (is_moderador());

-- ---------------------------------------------------------
-- 6. Storage: bucket publico para portadas, escritura solo admin/moderador
-- ---------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('portadas', 'portadas', true)
on conflict (id) do nothing;

drop policy if exists "portadas_lectura_publica" on storage.objects;
create policy "portadas_lectura_publica" on storage.objects
  for select using (bucket_id = 'portadas');

drop policy if exists "portadas_escritura_staff" on storage.objects;
create policy "portadas_escritura_staff" on storage.objects
  for insert with check (bucket_id = 'portadas' and is_moderador());

drop policy if exists "portadas_actualiza_staff" on storage.objects;
create policy "portadas_actualiza_staff" on storage.objects
  for update using (bucket_id = 'portadas' and is_moderador());

drop policy if exists "portadas_borra_staff" on storage.objects;
create policy "portadas_borra_staff" on storage.objects
  for delete using (bucket_id = 'portadas' and is_admin());

-- ---------------------------------------------------------
-- 7. Primer administrador
-- ---------------------------------------------------------
-- 1) Crea el usuario desde Authentication > Users en el dashboard de Supabase.
-- 2) Copia su UUID y ejecuta:
--
-- insert into perfiles (id, nombre, rol)
-- values ('UUID-DEL-USUARIO', 'Nombre del admin', 'admin');

-- =========================================================
-- MIGRACIÓN 2: gestión de staff (activar/desactivar/eliminar)
-- y bloqueo por intentos fallidos de login
-- =========================================================

-- ---------------------------------------------------------
-- 8. Perfiles: columna "activo" para poder suspender acceso
--    sin borrar la cuenta de Auth.
-- ---------------------------------------------------------
alter table perfiles add column if not exists activo boolean not null default true;

-- is_admin() / is_moderador() ahora también exigen que el perfil esté activo,
-- así una cuenta desactivada pierde acceso de inmediato aunque su sesión siga viva.
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from perfiles where id = auth.uid() and rol = 'admin' and activo = true
  );
$$;

create or replace function is_moderador()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from perfiles where id = auth.uid() and rol in ('moderador', 'admin') and activo = true
  );
$$;

-- ---------------------------------------------------------
-- 9. Control de intentos de login fallidos (bloqueo temporal).
--    Sin políticas de RLS para anon/authenticated: solo la service role
--    (usada exclusivamente desde /api/auth/iniciar-sesion) puede leer/escribir aquí.
-- ---------------------------------------------------------
create table if not exists intentos_login (
  correo          text primary key,
  intentos        integer not null default 0,
  bloqueado_hasta timestamptz,
  actualizado_en  timestamptz not null default now()
);

alter table intentos_login enable row level security;
-- (sin "create policy": queda cerrada por defecto para anon/authenticated;
--  la service role key siempre bypassa RLS, así que el backend sí puede usarla)

-- ---------------------------------------------------------
-- 10. Nota sobre borrado de negocios e imágenes
-- ---------------------------------------------------------
-- El borrado de un negocio se hace desde /api/admin/borrar-negocio, que:
--   1) borra el objeto correspondiente en el bucket "portadas" (Storage)
--   2) borra la fila en "negocios" (lo que en cascada borra sus "sucursales")
-- Esto evita imágenes huérfanas en Storage.
