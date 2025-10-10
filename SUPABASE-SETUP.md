# 🗄️ Configuración de Supabase

## ✅ Pasos Completados

1. ✅ Credenciales configuradas en `.env.local`
2. ✅ Cliente de Supabase configurado en `lib/supabase.ts`
3. ✅ Contexto de autenticación con Supabase creado en `lib/auth-context-supabase.tsx`

## 📋 Pasos que DEBES hacer en Supabase:

### 1. Crear las Tablas en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **"New query"**
4. Copia y pega el contenido del archivo `supabase-schema.sql`
5. Haz clic en **"Run"** o presiona `Ctrl+Enter`

### 2. Configurar las Políticas de Seguridad (RLS)

1. En el mismo SQL Editor, crea una **nueva query**
2. Copia y pega el contenido del archivo `supabase-policies.sql`
3. Haz clic en **"Run"**

### 3. Activar el Contexto de Supabase

Una vez que hayas ejecutado los scripts SQL, necesitas activar el nuevo contexto:

1. Abre el archivo `lib/auth-context.tsx`
2. Renómbralo a `lib/auth-context-old.tsx` (como respaldo)
3. Renombra `lib/auth-context-supabase.tsx` a `lib/auth-context.tsx`

O simplemente **reemplaza** el contenido de `lib/auth-context.tsx` con el de `lib/auth-context-supabase.tsx`

### 4. Reiniciar el Servidor de Desarrollo

```powershell
# Detén el servidor actual (Ctrl+C)
# Luego inicia de nuevo:
pnpm dev
```

### 5. Configurar en Vercel (Para Producción)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega estas variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://woymttodrinvihirkqid.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `[tu-anon-key]`
4. Haz clic en **"Save"**
5. Redespliega tu proyecto (Git push o manual)

## 🎯 Estructura de Base de Datos

### Tablas Creadas:

1. **`users`** - Información básica de usuarios (referencia)
2. **`cards`** - Tarjetas de registro de usuarios
3. **`events`** - Eventos creados por administradores
4. **`event_attendees`** - Registro de asistencia a eventos

### Relaciones:

- Una tarjeta pertenece a un usuario (por email)
- Un evento tiene muchos asistentes
- Los asistentes se registran por email

## 🔒 Seguridad (RLS - Row Level Security)

Las políticas configuradas permiten:
- ✅ Todos pueden ver eventos
- ✅ Solo admins pueden crear/editar/eliminar eventos
- ✅ Usuarios pueden ver y gestionar sus propias tarjetas
- ✅ Cualquiera puede registrarse a eventos

## 🧪 Probar la Integración

Después de completar todos los pasos:

1. Inicia sesión con cualquiera de los usuarios demo:
   - `globaladmin@example.com` / `global123`
   - `admin@example.com` / `admin123`
   - `user@example.com` / `user123`

2. Crea un evento (como admin)
3. Los datos ahora se guardarán en Supabase ✨

## 🐛 Troubleshooting

### Error: "relation does not exist"
- Asegúrate de haber ejecutado `supabase-schema.sql`

### Error: "row-level security policy"
- Ejecuta `supabase-policies.sql`
- O desactiva temporalmente RLS en el dashboard de Supabase

### Los datos no se guardan
- Verifica que las credenciales en `.env.local` sean correctas
- Reinicia el servidor de desarrollo

## 📚 Próximos Pasos (Opcional)

- [ ] Implementar autenticación real con Supabase Auth
- [ ] Agregar validación de emails
- [ ] Implementar recuperación de contraseña
- [ ] Agregar imágenes de perfil con Supabase Storage
- [ ] Implementar notificaciones en tiempo real
