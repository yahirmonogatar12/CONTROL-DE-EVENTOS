# Notas de base de datos

- `schema/current.sql` es la referencia canónica del modelo persistente que consume hoy la app.
- `migrations/archive/` conserva SQL historico, operativos ad hoc y scripts de soporte.
- Los archivos archivados no deben asumirse como verdad unica sin contrastarlos contra `lib/auth/context.tsx`.
