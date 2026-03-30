# Configuración de Storage para Imágenes de Eventos

## Paso 1: Crear Bucket en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. En el menú lateral, selecciona **Storage**
3. Click en **New bucket**
4. Configura el bucket:
   - **Name**: `event-images`
   - **Public**: ✅ Marcado (para que las imágenes sean accesibles)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`
5. Click en **Create bucket**

## Paso 2: Configurar Políticas RLS

En la pestaña **Policies** del bucket `event-images`, agrega estas políticas:

### Política 1: Permitir INSERT a usuarios autenticados (admins)
```sql
CREATE POLICY "Admins pueden subir imágenes de eventos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'global-admin')
);
```

### Política 2: Permitir SELECT (lectura) público
```sql
CREATE POLICY "Imágenes de eventos son públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');
```

### Política 3: Permitir DELETE a admins
```sql
CREATE POLICY "Admins pueden eliminar imágenes de eventos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'global-admin')
);
```

## Paso 3: Ejecutar SQL Script de Base de Datos

Ejecuta el archivo `AGREGAR-IMAGENES-EVENTOS.sql` en Supabase SQL Editor para:
- Agregar columna `image_url` a la tabla `events`
- Actualizar funciones `get_events()` y `get_user_events()` para incluir el campo

## Paso 4: Verificar funcionamiento

1. Reinicia tu aplicación
2. Como administrador, crea un nuevo evento
3. Sube una imagen del evento
4. Verifica que:
   - La imagen se muestre en el preview del formulario
   - Se guarde correctamente en Storage
   - Aparezca en la tarjeta del evento para todos los usuarios
   - Los usuarios normales puedan ver la imagen

## Estructura de archivos en Storage

Los archivos se guardarán con esta estructura:
```
event-images/
  └── {user_id}/
      ├── {eventId}-{timestamp}.jpg
      ├── {eventId}-{timestamp}.png
      └── ...
```

## Características implementadas

✅ Admins pueden subir una imagen al crear un evento
✅ Preview de imagen antes de crear el evento
✅ Límite de 5MB por imagen
✅ Imágenes visibles para todos los usuarios
✅ Diseño responsive (se adapta a móvil y desktop)
✅ Las imágenes se muestran prominentemente en la parte superior de cada tarjeta de evento

## Notas importantes

- Solo los administradores pueden crear eventos y subir imágenes
- Las imágenes son públicas para que todos los usuarios las vean
- El campo de imagen es opcional al crear un evento
- Las URLs de las imágenes son públicas y permanentes
- Si se elimina un evento, la imagen permanece en Storage (puedes implementar limpieza manual si es necesario)

## Mejoras futuras opcionales

- Permitir editar/cambiar la imagen de un evento existente
- Agregar múltiples imágenes por evento (galería)
- Implementar limpieza automática de imágenes al eliminar eventos
- Agregar filtros o recorte de imágenes en el cliente
- Comprimir imágenes automáticamente antes de subir
