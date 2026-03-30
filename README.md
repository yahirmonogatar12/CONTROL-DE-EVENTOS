# Sistema de registro de tarjetas y eventos

Aplicacion web construida con Next.js y Supabase para registrar usuarios, capturar tarjetas sociales, administrar eventos, registrar asistencias y gestionar quejas o sugerencias.

## Que hace el sistema

- Autenticacion por correo/contrasena y OAuth con Google.
- Registro y actualizacion de una tarjeta por usuario.
- Creacion, consulta, suspension y registro de eventos.
- Registro de asistencia por codigo manual o por QR.
- Historial personal de asistencias y consulta de asistentes por evento.
- Modulo de quejas y sugerencias con imagenes adjuntas.
- Administracion de usuarios y consulta de tarjetas.

## Stack

- Next.js 15 / App Router
- React 19
- TypeScript
- Supabase Auth
- Supabase Database
- Supabase Storage
- Tailwind CSS + componentes UI locales

## Requisitos

- Node.js 20 o superior
- Dependencias instaladas con `npm install`
- Proyecto de Supabase con Auth, Database y Storage configurados

## Variables de entorno

El proyecto solo lee estas variables desde el cliente y desde el callback OAuth:

| Variable | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL publica del proyecto de Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key publica usada por la app |

Archivos presentes en el repo:

- `.env`
- `.env.local`
- `.env.production`

## Comandos

```bash
npm install
npm run dev
npm run build
npm run start
```

## Estructura del repo

```text
app/                  Rutas de Next.js
components/
  admin/              UI de administracion
  auth/               Proteccion de rutas
  cards/              Tarjetas y vistas relacionadas
  complaints/         Quejas y sugerencias
  events/             Eventos, QR, mapas y registro
  history/            Historial y estadisticas
  layout/             Navegacion y layout compartido
  ui/                 Libreria UI base
database/
  schema/             Esquema canónico documentado
  migrations/archive/ SQL historico y scripts operativos
  notes/              Notas de base de datos
docs/
  setup/              Guias de configuracion vigentes
  archive/            Documentacion historica
hooks/                Hooks compartidos
lib/                  Cliente de Supabase, auth y utilidades
public/               Assets estaticos
scripts/              Scripts auxiliares
styles/               Estilos globales heredados
```

## Mapa de rutas

| Ruta | Proposito | Acceso |
| --- | --- | --- |
| `/` | Panel principal del sistema | Usuario autenticado |
| `/login` | Inicio de sesion | Publico |
| `/registro` | Registro de cuenta | Publico |
| `/registro-tarjeta` | Alta o edicion de tarjeta | Usuario autenticado |
| `/eventos` | Listado de eventos y registro de asistencia | Usuario autenticado |
| `/mi-historial` | Historial de asistencias | Usuario autenticado |
| `/quejas` | Quejas y sugerencias | Usuario autenticado |
| `/admin/usuarios` | Gestion de usuarios y captura de tarjetas | Admin / global-admin |
| `/admin/tarjetas` | Consulta de tarjetas | Actualmente solo requiere sesion |
| `/auth/callback` | Callback OAuth de Supabase | Interno |

## Dependencias externas

- Supabase Auth para login por correo, Google y manejo de sesion.
- Supabase Database para tablas de usuarios, tarjetas, eventos, asistencias e incidencias.
- Supabase Storage para `event-images` y `complaint-images`.
- Nominatim de OpenStreetMap para busqueda de ubicaciones.
- Google Maps embebido para vista de mapa y apertura externa.
- `html5-qrcode` para escaneo QR desde el navegador.

## Documentacion interna

- `docs/architecture.md`: arquitectura real y dependencias.
- `docs/functional-flows.md`: flujos de usuario y admin.
- `docs/data-model.md`: modelo ER textual y diccionario de datos.
- `docs/findings.md`: hallazgos tecnicos y riesgos verificados.
- `database/schema/current.sql`: esquema canónico documentado del runtime actual.

## Estado de validacion

La reorganizacion de archivos y la documentacion fueron verificadas con `npm run build` en este entorno.
