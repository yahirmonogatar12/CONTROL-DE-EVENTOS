# Modelo de datos

## Vista general

Modelo relacional efectivo consumido hoy por la app:

```text
users (1) ---- (0..1) cards
users (1) ---- (0..N) events
users (1) ---- (0..N) complaints_suggestions
events (1) --- (0..N) event_attendees
users (1) ---- (0..N) event_attendees
events (1) --- (0..N) event_attendance_history
users (1) ---- (0..N) event_attendance_history
```

Hay dos niveles de asistencia:

- `event_attendees`: relacion activa y minima para saber si el usuario ya esta registrado.
- `event_attendance_history`: snapshot historico con datos detallados de la tarjeta al momento de asistir.

## Entidades

### `users`

Registro de aplicacion paralelo a Supabase Auth.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | `UUID` | PK. A veces coincide con Auth y a veces se genera localmente en OAuth |
| `email` | `TEXT` | Unico |
| `name` | `TEXT` | Nombre visible |
| `password` | `TEXT` | Hash o cadena vacia para OAuth |
| `role` | `TEXT` | `global-admin`, `admin`, `user` |
| `created_at` | `TIMESTAMPTZ` | Fecha de alta |

### `cards`

Tarjeta social personal, una por usuario.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `user_email` | `TEXT` | FK logica a `users.email`, unico |
| `referente` | `TEXT` | Referente del registro |
| `nombre` | `TEXT` | Nombre base usado por la UI |
| `apellido_paterno` | `TEXT` | Obligatorio |
| `apellido_materno` | `TEXT` | Obligatorio en formularios actuales |
| `telefono` | `TEXT` | Contacto |
| `correo_electronico` | `TEXT` | Correo capturado en la tarjeta |
| `calle_numero` | `TEXT` | Direccion |
| `colonia` | `TEXT` | Direccion |
| `municipio` | `TEXT` | Direccion |
| `estado` | `TEXT` | Direccion |
| `edad` | `INTEGER` | Edad |
| `sexo` | `TEXT` | `Masculino`, `Femenino`, `Otro` |
| `seccion` | `TEXT` | Seccion electoral o equivalente |
| `necesidad` | `TEXT` | Campo descriptivo |
| `buzon` | `TEXT` | Estado o referencia de buzon |
| `seguimiento_buzon` | `TEXT` | Seguimiento posterior |
| `created_at` | `TIMESTAMPTZ` | Auditoria |
| `updated_at` | `TIMESTAMPTZ` | Auditoria |

### `events`

Evento administrable con QR y codigo de confirmacion.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `title` | `TEXT` | Titulo visible |
| `date` | `TEXT` | Texto formateado, no timestamp |
| `location` | `TEXT` | Formato `direccion|lat,lng` o solo direccion |
| `description` | `TEXT` | Opcional |
| `qr_code` | `TEXT` | Payload QR |
| `confirmation_code` | `TEXT` | Codigo corto y unico |
| `created_by` | `UUID` | Usuario creador |
| `suspended` | `BOOLEAN` | Oculta eventos al usuario normal |
| `image_url` | `TEXT` | URL publica de Storage |
| `created_at` | `TIMESTAMPTZ` | Auditoria |

### `event_attendees`

Relacion activa de asistencia.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `event_id` | `UUID` | FK a `events.id` |
| `user_email` | `TEXT` | FK logica a `users.email` |
| `registered_at` | `TIMESTAMPTZ` | Momento del registro |

Restriccion clave:

- `UNIQUE(event_id, user_email)`

### `event_attendance_history`

Snapshot historico de asistencia con datos de tarjeta.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `event_id` | `UUID` | Referencia logica al evento |
| `event_title` | `TEXT` | Snapshot |
| `event_date` | `TEXT` | Snapshot |
| `event_location` | `TEXT` | Snapshot |
| `confirmation_code` | `TEXT` | Snapshot |
| `user_email` | `TEXT` | Usuario asistente |
| `user_name` | `TEXT` | Nombre desde tarjeta |
| `referente` | `TEXT` | Snapshot de tarjeta |
| `telefono` | `TEXT` | Snapshot de tarjeta |
| `correo_electronico` | `TEXT` | Snapshot de tarjeta |
| `municipio` | `TEXT` | Snapshot de tarjeta |
| `seccion` | `TEXT` | Snapshot de tarjeta |
| `edad` | `INTEGER` | Snapshot de tarjeta |
| `sexo` | `TEXT` | Snapshot de tarjeta |
| `attended_at` | `TIMESTAMPTZ` | Fecha real de registro |
| `created_at` | `TIMESTAMPTZ` | Auditoria |

### `complaints_suggestions`

Incidencias y sugerencias de usuario.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | `UUID` | PK |
| `folio` | `TEXT` | Unico, generado por trigger |
| `user_email` | `TEXT` | Usuario emisor |
| `user_name` | `TEXT` | Nombre visible |
| `type` | `TEXT` | `queja` o `sugerencia` |
| `subject` | `TEXT` | Asunto |
| `message` | `TEXT` | Cuerpo del mensaje |
| `status` | `TEXT` | `pendiente`, `en_revision`, `resuelto`, `cerrado` |
| `admin_response` | `TEXT` | Respuesta del administrador |
| `admin_email` | `TEXT` | Admin que actualizo |
| `images` | `TEXT[]` | URLs publicas de Storage |
| `created_at` | `TIMESTAMPTZ` | Alta |
| `updated_at` | `TIMESTAMPTZ` | Ultima actualizacion |
| `resolved_at` | `TIMESTAMPTZ` | Cierre o resolucion |

## Buckets de Storage

### `event-images`

- Uso: imagen principal del evento.
- URL persistida en: `events.image_url`.
- Patron de nombre actual: `${user.id}/${eventId}-${Date.now()}.${ext}`.

### `complaint-images`

- Uso: adjuntos de quejas o sugerencias.
- URL persistida en: `complaints_suggestions.images`.
- Patron de nombre actual: `${user.email}/${Date.now()}-${random}.${ext}`.

## Mapeo entre tipos de UI y columnas reales

### `User`

Tipo de frontend:

- `id`
- `email`
- `role`
- `name`
- `card?`

Origen:

- `users` provee identidad y rol.
- `cards` se incrusta de forma opcional en memoria.

### `CardData`

La UI usa nombres camelCase:

- `name`
- `apellidoPaterno`
- `apellidoMaterno`
- `telefono`
- `correoElectronico`
- `calleNumero`
- `seguimientoBuzon`

La DB usa snake_case y en varios casos nombres distintos:

- `name` en UI se persiste como `nombre`
- `apellidoPaterno` -> `apellido_paterno`
- `correoElectronico` -> `correo_electronico`
- `calleNumero` -> `calle_numero`
- `seguimientoBuzon` -> `seguimiento_buzon`

### `Event`

La UI usa:

- `id`
- `title`
- `date`
- `location`
- `description`
- `qrCode`
- `confirmationCode`
- `attendees`
- `createdBy`
- `suspended`
- `image_url`

Mapeo:

- `qrCode` -> `qr_code`
- `confirmationCode` -> `confirmation_code`
- `createdBy` -> `created_by`
- `attendees` no vive en `events`; se reconstruye desde `event_attendees`

## Campos serializados o no normalizados

- `events.date` guarda texto ya formateado para render.
- `events.location` guarda direccion y coordenadas en una sola cadena.
- `complaints_suggestions.images` guarda un arreglo de URLs publicas.
- `event_attendance_history` duplica datos de evento y tarjeta a proposito para conservar snapshot historico.
