# Flujos funcionales

## Flujo 1: registro de cuenta por correo

1. El usuario entra a `/registro`.
2. Captura nombre, correo, contrasena y confirmacion.
3. La UI valida longitud minima y coincidencia de contrasenas.
4. `registerWithEmail` crea el usuario en Supabase Auth.
5. Luego inserta un registro paralelo en `users` con rol `user`.
6. La pantalla muestra que se envio el correo de verificacion.

## Flujo 2: login por correo

1. El usuario entra a `/login`.
2. Envia correo y contrasena.
3. `login` llama `supabase.auth.signInWithPassword`.
4. Se valida que el correo este confirmado.
5. Se consulta `users` por email para obtener nombre y rol.
6. El usuario queda en estado local y es redirigido a `/`.

## Flujo 3: login con Google

1. El usuario elige Google desde `/login` o `/registro`.
2. Supabase redirige al proveedor.
3. El proveedor regresa a `/auth/callback`.
4. El callback intercambia el codigo por sesion.
5. Si el usuario no existe en `users`, se crea con rol `user`.
6. En la carga siguiente, `AuthProvider` reconstruye la sesion desde Supabase.

## Flujo 4: alta de tarjeta

1. El usuario autenticado entra a `/registro-tarjeta`.
2. Si no tiene tarjeta, ve `CardRegistrationForm`.
3. Captura datos personales, contacto, direccion, seccion, necesidad y buzon.
4. `registerCard` hace `upsert` en `cards` usando `user.email`.
5. El estado local del usuario se actualiza con la tarjeta capturada.
6. La vista cambia de formulario a `MyCard`.

## Flujo 5: edicion de tarjeta

1. Un usuario con tarjeta ve `MyCard`.
2. Al pulsar editar, el componente reconstruye el formulario desde `user.card`.
3. `updateCard` hace `update` sobre `cards` por `user_email`.
4. La UI actualiza el estado local y vuelve a la vista resumen.

## Flujo 6: consulta y creacion de eventos

### Usuario normal

1. Entra a `/eventos`.
2. Busca por titulo o ubicacion.
3. Ve tarjetas de eventos filtradas.
4. Si no tiene tarjeta, no puede registrarse al evento.

### Admin o global-admin

1. Entra a `/eventos`.
2. Puede abrir `CreateEventDialog`.
3. Captura titulo, fecha, ubicacion, descripcion e imagen.
4. Puede buscar o seleccionar coordenadas.
5. `createEvent` genera `confirmation_code` y `qr_code`.
6. Si hay imagen, la sube a `event-images`.
7. Inserta el evento en `events`.

## Flujo 7: registro de asistencia por codigo

1. El usuario abre `RegisterWithCodeDialog`.
2. Captura el `confirmation_code`.
3. `registerAttendanceByCode` valida que el usuario tenga tarjeta.
4. Busca el evento por `confirmation_code`.
5. Verifica que la asistencia no exista ya en `event_attendees`.
6. Inserta en `event_attendees`.
7. Inserta un snapshot completo en `event_attendance_history`.
8. La UI confirma el registro.

## Flujo 8: registro de asistencia por QR

1. El usuario abre el dialogo en modo QR.
2. El navegador intenta activar la camara.
3. El QR escaneado se parte con el formato `EVENT-{eventId}-{confirmationCode}`.
4. Se toma el ultimo segmento como codigo de confirmacion.
5. El resto del flujo es igual al manual.

## Flujo 9: historial personal

1. El usuario entra a `/mi-historial`.
2. `UserEventHistory` carga:
   - eventos desde `event_attendance_history`;
   - estadisticas derivadas sobre la misma tabla.
3. La UI muestra total de eventos, ventana de 30 dias, ventana de 7 dias y eventos unicos.
4. Debajo muestra el listado cronologico de asistencias.

## Flujo 10: quejas y sugerencias

### Usuario normal

1. Entra a `/quejas`.
2. Elige tipo `queja` o `sugerencia`.
3. Captura asunto, mensaje y hasta 5 imagenes.
4. Las imagenes se suben a `complaint-images`.
5. Las URLs publicas se guardan en `complaints_suggestions.images`.
6. El registro se inserta con estado `pendiente`.
7. Debajo puede revisar su propio historial.

### Admin

1. Entra a `/quejas`.
2. Carga todas las incidencias.
3. Puede buscar por folio, nombre, correo o asunto.
4. Puede marcar `en_revision`, `resuelto` o `cerrado`.
5. Al resolver, puede adjuntar una respuesta administrativa.

## Flujo 11: administracion de usuarios

1. Un admin entra a `/admin/usuarios`.
2. Puede crear usuarios con rol `user` y, si es global-admin, con rol `admin`.
3. La creacion usa Supabase Auth y luego la tabla `users`.
4. La lista permite buscar y filtrar por rol.
5. El admin puede abrir un dialogo para consultar o capturar tarjeta.
6. Tambien puede eliminar usuarios desde la tabla `users`.

## Flujo 12: administracion de tarjetas

1. La ruta `/admin/tarjetas` lista tarjetas desde `getAllUserCards`.
2. Se puede buscar por nombre o correo.
3. La vista detalle genera un QR con datos basicos de la tarjeta.
4. La ruta no aparece en el menu de un usuario normal, pero hoy no tiene la misma restriccion de rol que `/admin/usuarios`.

## Flujo 13: administracion de eventos existentes

1. Un admin puede ver asistentes y descargar QR desde cada tarjeta de evento.
2. `deleteEvent` solo elimina si el evento no tiene asistentes.
3. Si ya tiene asistentes, el sistema propone suspenderlo.
4. `suspendEvent` marca `events.suspended = true`.
5. Para usuarios no admin, `loadEvents` oculta eventos suspendidos.
