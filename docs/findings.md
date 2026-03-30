# Hallazgos tecnicos

## Criticos

### 1. El dialogo admin de tarjeta escribe sobre el usuario autenticado

- Evidencia: `components/admin/admin-card-form-dialog.tsx` usa `registerCard(cardData)`.
- Evidencia: `lib/auth/context.tsx` implementa `registerCard` con `user.email` del usuario logueado, no con `userEmail` objetivo.
- Impacto: un admin puede abrir la tarjeta de otro usuario, pero al guardar termina sobrescribiendo o creando la tarjeta del admin autenticado.
- Riesgo: corrupcion de datos y falsa sensacion de exito en la UI.

### 2. `/admin/tarjetas` no tiene restriccion explicita por rol

- Evidencia: `app/admin/tarjetas/page.tsx` usa `ProtectedRoute` sin `requiredRole`.
- Impacto: cualquier usuario autenticado puede entrar por URL directa si conoce la ruta.
- Riesgo: exposicion de datos personales de otras tarjetas.

## Medios

### 3. Hay desfase entre el esquema historico y los campos que usa el runtime

- Evidencia: `database/migrations/archive/supabase-schema-fixed.sql` define una version antigua de `cards`.
- Evidencia: `database/migrations/archive/ACTUALIZAR-CARDS-SUPABASE.sql` define otra estructura para `cards`.
- Evidencia: `lib/auth/context.tsx` lee y escribe `nombre`, `telefono`, `correo_electronico`, `seguimiento_buzon` y otros campos que no aparecen igual en todos los SQL.
- Impacto: el repo tenia varias "verdades" compitiendo entre si.
- Riesgo: ambientes nuevos pueden montarse con una estructura que no coincide con la app.

### 4. El flujo OAuth mezcla sesion, localStorage y cookie sin un contrato claro

- Evidencia: `app/auth/callback/route.ts` escribe una cookie `user_data`.
- Evidencia: `lib/auth/context.tsx` no consume esa cookie y depende de `supabase.auth.getSession()` y `localStorage`.
- Impacto: el callback funciona por efectos indirectos mas que por una integracion coherente.
- Riesgo: sesiones parciales, comportamiento distinto entre entornos y dificultad para depurar.

### 5. El borrado de usuario parece parcial

- Evidencia: `lib/auth/context.tsx` en `deleteUser` elimina solo desde la tabla `users`.
- Impacto: el usuario puede quedar vivo en Supabase Auth aunque desaparezca del catalogo interno.
- Riesgo: cuentas huerfanas, reingreso inesperado y basura administrativa.

### 6. `lib/auth/context.tsx` es un monolito de negocio

- Evidencia: el archivo concentra autenticacion, CRUD de tarjetas, eventos, historial, storage, quejas y administracion.
- Impacto: cada cambio transversal aumenta el riesgo de regresion.
- Riesgo: baja mantenibilidad, testing dificil y acoplamiento alto.

## Bajos

### 7. La raiz mezclaba historicos, guias y SQL operativos

- Evidencia: antes de la reorganizacion coexistian multiples `.md`, `.sql` y scripts sueltos en la raiz.
- Impacto: costaba saber que era vigente, historico o solo de soporte operativo.
- Riesgo: uso accidental del script incorrecto o documentacion obsoleta.

## Recomendaciones de siguiente fase

- Separar el contexto de auth en modulos por dominio.
- Extraer un metodo admin especifico para guardar tarjetas de terceros.
- Aplicar control de acceso uniforme en todas las rutas `/admin/*`.
- Unificar definitivamente el esquema SQL y la estrategia de RLS.
- Resolver el flujo OAuth para depender de una sola fuente de verdad de sesion.
