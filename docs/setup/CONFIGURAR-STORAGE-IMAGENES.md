# Configuración de Storage para Imágenes de Quejas y Sugerencias

## Paso 1: Crear Bucket en Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. En el menú lateral, selecciona **Storage**
3. Click en **New bucket**
4. Configura el bucket:
   - **Name**: `complaint-images`
   - **Public**: ✅ Marcado (para que las imágenes sean accesibles)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`
5. Click en **Create bucket**

## Paso 2: Configurar Políticas RLS

En la pestaña **Policies** del bucket `complaint-images`, agrega estas políticas:

### Política 1: Permitir INSERT a usuarios autenticados
```sql
CREATE POLICY "Usuarios pueden subir imágenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'complaint-images');
```

### Política 2: Permitir SELECT (lectura) público
```sql
CREATE POLICY "Imágenes son públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'complaint-images');
```

### Política 3: Permitir DELETE al dueño
```sql
CREATE POLICY "Usuarios pueden eliminar sus imágenes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'complaint-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Paso 3: Actualizar el código de submitComplaint

Reemplaza el TODO en `lib/auth-context.tsx` línea ~1055 con:

```typescript
const submitComplaint = async (type: 'queja' | 'sugerencia', subject: string, message: string, images?: File[]): Promise<{ success: boolean; message: string }> => {
  if (!user) {
    return { success: false, message: "Debes iniciar sesión para enviar una queja o sugerencia" }
  }

  try {
    const imageUrls: string[] = []

    // Subir imágenes a Supabase Storage
    if (images && images.length > 0) {
      for (const image of images) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.email}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('complaint-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          continue // Continuar con las demás imágenes si una falla
        }

        // Obtener URL pública de la imagen
        const { data: urlData } = supabase.storage
          .from('complaint-images')
          .getPublicUrl(fileName)
        
        if (urlData?.publicUrl) {
          imageUrls.push(urlData.publicUrl)
        }
      }
    }

    const { error } = await supabase.from("complaints_suggestions").insert({
      user_email: user.email,
      user_name: user.name,
      type,
      subject,
      message,
      status: 'pendiente',
      images: imageUrls,
    })

    if (error) throw error

    return { success: true, message: "Tu mensaje ha sido enviado exitosamente" }
  } catch (error) {
    console.error("Error submitting complaint:", error)
    return { success: false, message: "Error al enviar el mensaje" }
  }
}
```

## Paso 4: Verificar funcionamiento

1. Ejecuta el script `ACTUALIZAR-IMAGENES-QUEJAS.sql` en Supabase SQL Editor
2. Reinicia tu aplicación
3. Ve a la sección de Quejas y Sugerencias
4. Intenta subir una imagen al crear una queja
5. Verifica que la imagen aparezca en:
   - La lista de quejas (miniatura clickeable)
   - Storage de Supabase (en el bucket complaint-images)

## Estructura de archivos en Storage

Los archivos se guardarán con esta estructura:
```
complaint-images/
  └── usuario@email.com/
      ├── 1234567890-abc123.jpg
      ├── 1234567891-def456.png
      └── ...
```

## Notas importantes

- Las imágenes se guardan con el email del usuario como carpeta padre
- Cada imagen tiene un timestamp y string aleatorio para evitar colisiones
- Las URLs son públicas y permanentes
- El límite es de 5 imágenes por queja
- Tamaño máximo por imagen: 5MB

## Limpieza de imágenes (Opcional)

Si quieres implementar limpieza automática de imágenes cuando se elimine una queja:

```sql
-- Función para eliminar imágenes asociadas
CREATE OR REPLACE FUNCTION delete_complaint_images()
RETURNS TRIGGER AS $$
BEGIN
  -- Aquí podrías agregar lógica para eliminar las imágenes del storage
  -- usando una función de PostgreSQL o desde el cliente
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER complaints_delete_images_trigger
  BEFORE DELETE ON complaints_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION delete_complaint_images();
```
