# INSTRUCCIONES DE ACTUALIZACIÓN - NUEVO FORMULARIO DE REGISTRO

## ✅ CAMBIOS COMPLETADOS EN EL CÓDIGO

Se han actualizado los siguientes archivos:

1. **components/card-registration-form.tsx** - Nuevo formulario con todos los campos solicitados
2. **lib/auth-context.tsx** - Tipos y funciones actualizadas para los nuevos campos
3. **ACTUALIZAR-CARDS-SUPABASE.sql** - Script SQL para actualizar la base de datos

---

## 📋 NUEVOS CAMPOS DEL FORMULARIO

### Campos requeridos (*)
- ✅ **Referente** *
- ✅ **Nombre** *
- ✅ **Apellido paterno** *
- ✅ **Apellido materno** *
- ✅ **Teléfono** *
- ✅ **Calle y número** *
- ✅ **Colonia** *
- ✅ **Municipio** *
- ✅ **Estado** *

### Campos opcionales
- ✅ **Correo electrónico**
- ✅ **Edad**
- ✅ **Sexo** (Masculino/Femenino/Otro)
- ✅ **Sección**
- ✅ **Necesidad** (textarea)
- ✅ **Buzón**
- ✅ **Seguimiento de buzón** (textarea)
- ✅ **Nota** (textarea con hint sobre tarjeta QR)

---

## 🗄️ PASO 1: ACTUALIZAR SUPABASE (IMPORTANTE)

**Debes ejecutar el archivo `ACTUALIZAR-CARDS-SUPABASE.sql` en Supabase:**

1. Abre Supabase Dashboard: https://ygxopmvyrxabvfwxcaws.supabase.co
2. Ve a **SQL Editor** (menú lateral izquierdo)
3. Haz clic en **"New Query"**
4. Abre el archivo `ACTUALIZAR-CARDS-SUPABASE.sql` y **copia todo el contenido**
5. **IMPORTANTE**: El script tiene 2 opciones:
   
   ### OPCIÓN 1: Empezar de cero (RECOMENDADO si no tienes datos importantes)
   - Está activa por defecto
   - Elimina la tabla `cards` anterior y crea una nueva
   - **Perderás todos los registros existentes**
   
   ### OPCIÓN 2: Mantener datos existentes
   - Está comentada (con `/* */`)
   - Si tienes datos importantes que quieres conservar:
     1. **Comenta** la sección de DROP/CREATE (líneas 7-61)
     2. **Descomenta** la sección de ALTER TABLE (líneas 67-103)

6. Pega el código en el SQL Editor
7. Haz clic en **"Run"** (esquina inferior derecha)
8. Verifica que aparezca: **"Success. No rows returned"**

---

## 🔍 PASO 2: VERIFICAR LA ESTRUCTURA

Ejecuta este query para confirmar que la tabla está correcta:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;
```

Deberías ver estas columnas:
- `id` (uuid)
- `referente` (text)
- `nombre` (text)
- `apellido_paterno` (text)
- `apellido_materno` (text)
- `telefono` (text)
- `correo_electronico` (text, nullable)
- `calle_numero` (text)
- `colonia` (text)
- `municipio` (text)
- `estado` (text)
- `edad` (integer, nullable)
- `sexo` (text, nullable)
- `seccion` (text, nullable)
- `necesidad` (text, nullable)
- `buzon` (text, nullable)
- `seguimiento_buzon` (text, nullable)
- `nota` (text, nullable)
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## ✨ PASO 3: PROBAR EL FORMULARIO

1. **Inicia el servidor** (si no está corriendo):
   ```bash
   pnpm run dev
   ```

2. **Inicia sesión** como usuario:
   - Email: `user@example.com`
   - Password: `user123`

3. **Ve a "Registrar Tarjeta"** en el menú inferior

4. **Completa el formulario** con estos datos de prueba:
   ```
   Referente: Juan Pérez
   Nombre: María
   Apellido paterno: González
   Apellido materno: López
   Teléfono: 5512345678
   Correo electrónico: maria@example.com
   Calle y número: Av. Principal 123
   Colonia: Centro
   Municipio: Ciudad de México
   Estado: CDMX
   Edad: 35
   Sexo: Femenino
   Sección: 1234
   Necesidad: Apoyo con medicamentos
   Buzón: BZ-001
   Seguimiento: Pendiente revisión
   Nota: Primera visita
   ```

5. **Haz clic en "Capturar Tarjeta"**

6. **Verifica en Supabase** que el registro se guardó:
   ```sql
   SELECT * FROM cards LIMIT 10;
   ```

---

## 📊 CAMBIOS EN LA BASE DE DATOS

### Campos ELIMINADOS (ya no existen):
- ❌ `curp`
- ❌ `sex` (reemplazado por `sexo`)
- ❌ `age` (reemplazado por `edad`)
- ❌ `address` (separado en calle_numero, colonia, municipio, estado)
- ❌ `phone` (reemplazado por `telefono`)
- ❌ `folio_no`
- ❌ `distrito`
- ❌ `programas`
- ❌ `fecha`
- ❌ `responsable_captura`
- ❌ `cancelada`
- ❌ `observaciones`

### Campos NUEVOS:
- ✅ `referente` (required)
- ✅ `nombre` (required)
- ✅ `correo_electronico`
- ✅ `municipio` (required)
- ✅ `estado` (required)
- ✅ `edad` (integer)
- ✅ `sexo` (con CHECK para Masculino/Femenino/Otro)
- ✅ `necesidad`
- ✅ `buzon`
- ✅ `seguimiento_buzon`
- ✅ `nota`

---

## 🎯 RESUMEN DE ACCIONES

1. ✅ Formulario actualizado con los 17 campos nuevos
2. ✅ Tipos TypeScript actualizados
3. ✅ Funciones de Supabase actualizadas
4. ⚠️ **FALTA**: Ejecutar SQL en Supabase
5. ⚠️ **FALTA**: Probar el registro de tarjetas

---

## 🚨 IMPORTANTE

- **No olvides ejecutar el SQL** antes de probar el formulario
- Si tienes errores 400 en Supabase, verifica que la estructura de la tabla coincida
- Los campos con `*` son requeridos en el formulario
- El campo `user_email` se agrega automáticamente (no aparece en el formulario)

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica los logs de Supabase en el SQL Editor
3. Confirma que RLS esté DESHABILITADO en la tabla `cards`
