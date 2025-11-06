# 🔐 Configuración de Google OAuth - Registro e Inicio de Sesión

## 📋 Pasos para habilitar registro e inicio de sesión con Google

### 1️⃣ Configurar Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. En el menú lateral, ve a **APIs & Services** > **Credentials**
4. Haz clic en **+ CREATE CREDENTIALS** > **OAuth 2.0 Client ID**
5. Si es tu primera vez, configura la pantalla de consentimiento:
   - **User Type**: External (para cualquier cuenta de Google)
   - **App name**: Nombre de tu aplicación
   - **User support email**: Tu email
   - **Developer contact**: Tu email
   - Guarda y continúa

6. Ahora crea el OAuth Client ID:
   - **Application type**: Web application
   - **Name**: Tu Aplicación - Web Client
   
7. En **Authorized redirect URIs**, agrega:
   ```
   https://TU-PROYECTO.supabase.co/auth/v1/callback
   ```
   
   Para desarrollo local también agrega:
   ```
   http://localhost:54321/auth/v1/callback
   ```

8. Haz clic en **CREATE**
9. **¡IMPORTANTE!** Copia el **Client ID** y **Client Secret** que aparecen

---

### 2️⃣ Configurar en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. En el menú lateral, ve a **Authentication** > **Providers**
3. Busca **Google** en la lista de providers
4. Activa el toggle de **"Google Enabled"**
5. Pega tu **Client ID** de Google
6. Pega tu **Client Secret** de Google
7. Haz clic en **Save**

---

### 3️⃣ Ejecutar script SQL en Supabase

1. En Supabase Dashboard, ve a **SQL Editor**
2. Abre el archivo `CONFIGURAR-GOOGLE-OAUTH.sql`
3. Copia y pega todo el contenido
4. Haz clic en **Run** para ejecutar el script

Este script configura las políticas de seguridad (RLS) necesarias para que los usuarios de Google puedan registrarse automáticamente.

---

### 4️⃣ Configurar URLs de callback en tu aplicación

#### Para desarrollo local:
Tu URL de callback será:
```
http://localhost:3000/auth/callback
```

#### Para producción en Vercel:
1. Ve a tu proyecto en Vercel Dashboard
2. Copia tu URL de producción (ej: `https://mi-app.vercel.app`)
3. Ve a Google Cloud Console > Credentials
4. Edita tu OAuth Client ID
5. Agrega en **Authorized redirect URIs**:
   ```
   https://mi-app.vercel.app/auth/callback
   ```

---

## ✅ Verificar que funciona

### 🆕 Registro (Nuevos Usuarios):

1. Inicia tu aplicación (`pnpm dev`)
2. Ve a la página de login (`http://localhost:3000/login`)
3. Haz clic en **"Regístrate aquí"** (abajo del formulario)
4. En la página de registro (`/registro`), verás dos opciones:
   - **Formulario manual**: Nombre, email, contraseña
   - **Botón "Continuar con Google"**: Registro instantáneo
5. Haz clic en "Continuar con Google"
6. Selecciona tu cuenta de Google
7. ✅ Serás registrado automáticamente y redirigido al inicio
8. El sistema creará tu cuenta con rol "user"

### 🔑 Inicio de Sesión (Usuarios Existentes):

1. Ve a `/login`
2. Opciones disponibles:
   - **Email y contraseña**: Para usuarios creados manualmente
   - **"Continuar con Google"**: Para usuarios registrados con Google
3. Haz clic en "Continuar con Google"
4. Selecciona tu cuenta
5. ✅ Serás autenticado y redirigido al inicio

### 📝 Registro Manual:

1. Ve a `/registro`
2. Completa el formulario:
   - Nombre completo
   - Correo electrónico
   - Contraseña (mínimo 6 caracteres)
   - Confirmar contraseña
3. Haz clic en "Crear Cuenta"
4. ✅ Cuenta creada → Redirigido a `/login`
5. Inicia sesión con tus credenciales

---

## 🔍 Verificar usuarios en Supabase

Después de iniciar sesión con Google:

1. Ve a Supabase Dashboard > **Authentication** > **Users**
2. Deberías ver tu usuario de Google listado
3. Ve a **Table Editor** > **users**
4. Verifica que tu usuario se haya creado con:
   - Email de Google
   - Nombre completo
   - Rol: "user"

---

## 🛠️ Solución de problemas

### Error: "redirect_uri_mismatch"
- **Causa**: La URL de callback no coincide con las configuradas en Google Cloud
- **Solución**: Verifica que la URL en Google Cloud sea exactamente igual a la que aparece en el error

### Error: "Access blocked"
- **Causa**: La pantalla de consentimiento no está configurada o publicada
- **Solución**: En Google Cloud Console > OAuth consent screen, publica la aplicación o agrégala como "Testing" y añade tu email como usuario de prueba

### El usuario no se crea en la tabla users
- **Causa**: Las políticas RLS pueden estar bloqueando la inserción
- **Solución**: Ejecuta de nuevo el script `CONFIGURAR-GOOGLE-OAUTH.sql`

### No redirige después del login
- **Causa**: La ruta `/auth/callback` no existe
- **Solución**: Verifica que existe el archivo `app/auth/callback/route.ts`

---

## 📝 Notas importantes

1. **Registro Automático con Google**: 
   - Los usuarios que se registran con Google se crean automáticamente
   - NO necesitan contraseña
   - Se crean con rol "user" por defecto
   - El administrador NO necesita crear cuentas manualmente

2. **Registro Manual**:
   - Los usuarios pueden crear su propia cuenta desde `/registro`
   - Se requiere: nombre, email, contraseña
   - Se crean con rol "user" por defecto
   - El administrador NO necesita intervenir

3. **Ventajas del nuevo sistema**:
   - ✅ Cualquiera puede registrarse (Google o manual)
   - ✅ No requiere intervención del administrador
   - ✅ Proceso automático y rápido
   - ✅ Los usuarios eligen su método preferido

4. **Inicio de Sesión Flexible**:
   - Usuarios de Google → Usan "Continuar con Google"
   - Usuarios manuales → Usan email y contraseña
   - Ambos métodos disponibles en `/login`

5. **Seguridad**:
   - NUNCA compartas tu Client Secret públicamente
   - Agrégalo como variable de entorno en producción
   - No lo incluyas en el código fuente
   - Las contraseñas se hashean automáticamente

6. **Roles**:
   - Todos los nuevos usuarios se crean con rol "user" por defecto
   - Si necesitas cambiar el rol a admin, hazlo manualmente en Supabase Table Editor
   - Solo admins pueden crear eventos y ver asistentes

7. **Tarjetas**:
   - TODOS los usuarios (Google o manual) DEBEN registrar su tarjeta
   - No pueden asistir a eventos sin tarjeta registrada
   - La validación funciona igual para ambos tipos de usuarios

8. **Flujo completo de un usuario nuevo**:
   ```
   1. Registrarse (/registro)
      ↓
   2. Iniciar sesión (/login)
      ↓
   3. Registrar tarjeta (/)
      ↓
   4. Ver y asistir a eventos (/eventos)
   ```

---

## 🎉 ¡Listo!

Ahora tu aplicación soporta:
- ✅ **Registro automático** con Google (sin intervención del admin)
- ✅ **Registro manual** con formulario (sin intervención del admin)
- ✅ **Inicio de sesión** con email/contraseña
- ✅ **Inicio de sesión** con Google OAuth

**Los usuarios pueden unirse por su cuenta. ¡El admin ya no necesita crear cuentas manualmente!** 🚀
