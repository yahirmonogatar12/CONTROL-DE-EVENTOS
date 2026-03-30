# Arquitectura actual

## Vision general

El proyecto es una aplicacion de una sola base de codigo Next.js que ejecuta la UI con App Router y delega casi toda la logica de negocio del cliente a `lib/auth/context.tsx`.

La app no usa un backend propio separado. El navegador habla directamente con Supabase usando la anon key publica. Por eso la combinacion de esquema, RLS y reglas en cliente es parte central del comportamiento real del sistema.

## Capas del sistema

### 1. Rutas y paginas

`app/` define las rutas visibles:

- `app/page.tsx`: tablero principal.
- `app/login/page.tsx`: login por correo.
- `app/registro/page.tsx`: alta de cuenta.
- `app/registro-tarjeta/page.tsx`: tarjeta personal.
- `app/eventos/page.tsx`: eventos y registro de asistencia.
- `app/mi-historial/page.tsx`: historial personal.
- `app/quejas/page.tsx`: quejas y sugerencias.
- `app/admin/usuarios/page.tsx`: gestion de usuarios.
- `app/admin/tarjetas/page.tsx`: consulta de tarjetas.
- `app/auth/callback/route.ts`: callback OAuth de Supabase.

### 2. Componentes por dominio

`components/` se dividio por responsabilidad:

- `components/auth/`: proteccion de rutas.
- `components/cards/`: formularios y vistas de tarjeta.
- `components/events/`: eventos, mapas, QR y dialogs.
- `components/complaints/`: flujo de incidencias.
- `components/admin/`: UI admin especializada.
- `components/history/`: historial y metricas.
- `components/layout/`: navegacion o proveedores visuales.
- `components/ui/`: primitives y wrappers reutilizables.

### 3. Contexto de autenticacion y negocio

`lib/auth/context.tsx` concentra:

- estado del usuario autenticado;
- login por correo;
- login OAuth con Google y Apple;
- registro por correo;
- lectura y escritura de tarjetas;
- CRUD de eventos;
- registro de asistencias;
- consultas de historial;
- alta, consulta y actualizacion de quejas;
- administracion de usuarios.

Hoy ese archivo funciona como fachada unica de negocio del frontend. Esto simplifica el consumo desde paginas y componentes, pero concentra demasiadas responsabilidades en un solo modulo.

`lib/auth-context.tsx` se mantiene como capa de compatibilidad para no romper imports existentes.

## Flujo de autenticacion

### Sesion local

`AuthProvider` se monta en `app/layout.tsx` y hace dos cargas al inicio:

1. intenta recuperar una sesion activa de Supabase Auth;
2. si no la encuentra, intenta reconstruir el usuario desde `localStorage`.

El usuario efectivo expuesto a la UI contiene:

- `id`
- `email`
- `role`
- `name`
- `card` opcional

### Login por correo

El flujo usa `supabase.auth.signInWithPassword`, valida el estado del correo y luego busca el registro paralelo en la tabla `users`.

### OAuth

El login Google usa `supabase.auth.signInWithOAuth` con redireccion a `/auth/callback`.

El callback intercambia el `code` por sesion y crea el usuario en la tabla `users` si no existe. El runtime actual mezcla sesion de Supabase, `localStorage` y una cookie `user_data`; esa interaccion no esta completamente alineada y se documenta en `docs/findings.md`.

## Persistencia

### Supabase Database

Las entidades consumidas hoy por la app son:

- `users`
- `cards`
- `events`
- `event_attendees`
- `event_attendance_history`
- `complaints_suggestions`

### Supabase Storage

Buckets requeridos:

- `event-images`
- `complaint-images`

Objetos almacenados:

- imagenes de eventos subidas por administradores;
- imagenes adjuntas a quejas o sugerencias.

## Integraciones externas

### Mapas y geocodificacion

- Nominatim se usa para buscar direcciones y sugerencias.
- Google Maps se usa para embebido visual y apertura de ubicacion externa.
- `events.location` guarda la direccion y las coordenadas serializadas en un solo texto.

### QR

- Cada evento genera un `qr_code` y un `confirmation_code`.
- El registro de asistencia puede hacerse por:
  - lectura manual del `confirmation_code`;
  - escaneo del QR con `html5-qrcode`.

## Flujo de datos principal

### Tarjetas

La tarjeta se carga desde `cards` por `user_email`. Luego se mantiene duplicada en el estado del usuario para simplificar el render.

### Eventos

Los eventos se cargan desde `events`. Para cada evento, el cliente consulta aparte `event_attendees` para reconstruir la lista de correos asistentes.

Cuando un usuario se registra, el sistema:

1. valida que exista tarjeta;
2. inserta la asistencia simple en `event_attendees`;
3. guarda un snapshot detallado en `event_attendance_history`.

### Quejas

Las imagenes se suben primero a Storage y luego sus URLs publicas se guardan en `complaints_suggestions.images`.

## Implicaciones tecnicas

- Gran parte de la logica y seguridad depende de reglas del cliente.
- El esquema SQL del repo evoluciono por scripts historicos; el runtime actual ya no coincide con varios archivos antiguos.
- El archivo de contexto actual es el punto mas importante para entender el sistema completo.
