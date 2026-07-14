# Portal de Negocios — "La Marquesina"

App web intermediaria que conecta y da visibilidad a tus demás apps web (delivery,
marketplace, bóveda de credenciales, etc.), presentando cada negocio como una portada
tipo cartel de cine dentro de dos pasarelas horizontales con desplazamiento continuo.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Supabase (Postgres + Auth + Storage) vía `@supabase/ssr`
- Tailwind CSS
- `sharp` para comprimir/convertir las imágenes de portada a WebP en el servidor
- Despliegue en Vercel

## Estructura

```
app/
  page.tsx                  -> Portal público: buscador + dos pasarelas de portadas
  negocio/[id]/page.tsx     -> Página "espectacular" (presentación antes de redirigir)
  admin/                    -> Panel de administrador (protegido)
  moderador/                -> Panel de moderador (protegido)
  api/upload-imagen/        -> Sube y comprime la imagen de portada (sharp -> WebP)
  api/admin/crear-usuario/  -> Crea cuentas de moderador/admin (solo admin)
components/                 -> UI reutilizable (pasarela, buscador, formularios, etc.)
lib/supabase/                -> Clientes de Supabase (browser, server, admin)
middleware.ts                -> Protege /admin y /moderador según el rol en `perfiles`
supabase/schema.sql           -> Esquema completo: tablas, RLS, storage, funciones
```

## Puesta en marcha

### 1. Crear el proyecto en Supabase

1. Crea un proyecto en https://supabase.com.
2. En **SQL Editor**, pega y ejecuta el contenido completo de `supabase/schema.sql`.
   Esto crea las tablas `perfiles`, `negocios`, `sucursales`, las políticas de RLS,
   las funciones `is_admin()` / `is_moderador()` y el bucket público `portadas`.
3. En **Authentication > Users**, crea manualmente el primer usuario administrador
   (correo + contraseña).
4. Copia su UUID y ejecútalo en el SQL Editor:
   ```sql
   insert into perfiles (id, nombre, rol)
   values ('UUID-DEL-USUARIO', 'Tu nombre', 'admin');
   ```
   Con esa cuenta admin ya puedes crear moderadores desde el propio panel `/admin`.

### 2. Variables de entorno

Copia `.env.example` a `.env.local` y complétalo con los valores de
**Project Settings > API** en Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` **nunca** se expone al navegador: solo se usa dentro de
las rutas API (`/api/upload-imagen`, `/api/admin/crear-usuario`) para operaciones
administrativas (subir imágenes al bucket y crear usuarios).

### 3. Instalar y correr en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` para el portal público, `/moderador/login` y
`/admin/login` para los paneles.

### 4. Desplegar en Vercel

1. Sube este proyecto a un repositorio (GitHub/GitLab/Bitbucket).
2. Impórtalo en https://vercel.com/new.
3. Agrega las 3 variables de entorno del paso 2 en **Project Settings > Environment
   Variables**.
4. Deploy. Vercel detecta Next.js automáticamente.

## Funciones de seguridad y gestión agregadas

- **Borrado sin huérfanos**: `/api/admin/borrar-negocio` borra primero la imagen del
  negocio en Storage y luego la fila en `negocios` (las `sucursales` se van solas por
  `ON DELETE CASCADE`). El botón "Borrar" del panel de admin ya usa este endpoint.
- **Gestión de staff**: en `/admin`, cada cuenta de moderador/admin (menos la tuya
  propia) tiene botones **Desactivar/Activar** y **Eliminar**.
  - *Desactivar* marca `perfiles.activo = false`: la cuenta pierde acceso de inmediato
    (las funciones `is_admin()`/`is_moderador()` de RLS ahora exigen `activo = true`)
    pero se puede reactivar después sin recrear el usuario.
  - *Eliminar* borra el usuario de Supabase Auth por completo (y su perfil en
    cascada). Es irreversible.
- **Recuperar contraseña**: enlace "¿Olvidaste tu contraseña?" en ambos logins →
  `/recuperar` (pide el correo) → Supabase envía un correo → `/actualizar-clave`
  (define la nueva contraseña). Requiere que en Supabase, en **Authentication > URL
  Configuration**, agregues tu dominio (o `http://localhost:3000` en desarrollo) a la
  lista de *Redirect URLs*, incluyendo `/actualizar-clave`.
- **Bloqueo por intentos fallidos**: el login pasa por `/api/auth/iniciar-sesion`,
  que lleva el conteo de intentos fallidos por correo en la tabla `intentos_login`
  (solo accesible con la service role key, nunca desde el navegador). Tras 5 intentos
  fallidos, ese correo queda bloqueado 15 minutos, sin importar desde qué dispositivo
  se intente. Los valores están al inicio de `app/api/auth/iniciar-sesion/route.ts`
  (`MAX_INTENTOS`, `MINUTOS_BLOQUEO`) por si quieres ajustarlos.

> Si ya tenías el proyecto corriendo con el `schema.sql` original, vuelve a abrir el
> SQL Editor de Supabase y ejecuta solo la sección **"MIGRACIÓN 2"** al final del
> archivo — agrega la columna `activo`, actualiza las funciones de RLS y crea la
> tabla `intentos_login` sin tocar los datos existentes.

## Cómo se evita el peso al crecer (sin paginar la vista)

Pediste que se sigan mostrando **todos** los negocios, mezclados, sin agregar
paginación visible. Para que eso no pese al crecer, se separaron dos cosas:

- **Qué se descarga**: la consulta pública (`app/page.tsx`) solo trae
  `id, nombre, imagen_portada_url` y el municipio de cada sucursal — nunca la
  descripción completa ni la URL de destino, que solo se cargan en la página
  "espectacular" del negocio cuando de verdad se necesitan.
- **Cuánto se dibuja**: `PasarelaPortadas` baraja la lista completa una vez y luego
  la recorre con una **ventana rotativa** de tamaño fijo (24 tarjetas). Cada vez que
  la cinta completa una vuelta, la ventana avanza y trae el siguiente bloque de
  negocios. El DOM nunca crece más allá de esas 24 tarjetas (48 contando la
  duplicada para el loop), sin importar si tienes 20 negocios o 2,000 — y con el
  tiempo todos van apareciendo, en orden aleatorio.

Si en algún momento manejas miles de negocios activos, el siguiente paso natural
sería paginar también la *consulta* (traerlos en bloques de, digamos, 300 en vez de
todos de un jalón) aunque la vista siga pareciendo continua; el código ya está
estructurado para que ese cambio sea solo en `obtenerNegociosActivos()`, sin tocar
la pasarela.

## Roles

- **Administrador**: acceso total. Puede activar/desactivar/borrar cualquier negocio
  y crear cuentas de moderador o de otro administrador (`/admin`).
- **Moderador de contenido**: da de alta negocios (nombre, descripción, imagen,
  sucursales por municipio) y los edita (`/moderador`). No puede borrar negocios ni
  crear cuentas nuevas.
- **Cliente**: no inicia sesión. Entra al portal, busca o filtra por municipio, ve la
  presentación tipo espectacular del negocio elegido y de ahí es redirigido a la app
  web de ese negocio.

## Notas de diseño

- Las imágenes se suben desde el panel de moderador en cualquier formato/peso (hasta
  15 MB) y el servidor las convierte a WebP optimizado (ancho máximo 900px, calidad
  78) antes de guardarlas en Supabase Storage.
- Las dos pasarelas usan animación CSS pura (`animation`) en direcciones opuestas y
  se pausan al pasar el mouse; respetan `prefers-reduced-motion`.
- El filtro por municipio funciona sobre las sucursales, no sobre el negocio
  directamente: un negocio con sucursales en varios municipios aparece en todos.
