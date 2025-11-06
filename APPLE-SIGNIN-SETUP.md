# 🍎 Configuración de Sign in with Apple

## 📋 Pasos para habilitar inicio de sesión con Apple

### 1️⃣ Requisitos Previos

Necesitas:
- ✅ Una cuenta de **Apple Developer** (99 USD/año)
- ✅ Acceso a [Apple Developer Console](https://developer.apple.com/)
- ✅ Tu proyecto configurado en Supabase

---

### 2️⃣ Configurar en Apple Developer Console

#### **A. Crear App ID**

1. Ve a [Apple Developer Console](https://developer.apple.com/account/)
2. **Certificates, Identifiers & Profiles**
3. **Identifiers** > Click en **+** (agregar)
4. Selecciona **App IDs** > Continue
5. Selecciona **App** > Continue
6. Configura:
   ```
   Description: Sistema de Eventos
   Bundle ID: Explicit
   Bundle ID: com.tuempresa.eventos
   ```
7. En **Capabilities**, activa:
   - ✅ **Sign in with Apple**
8. Click **Continue** > **Register**

#### **B. Crear Service ID**

1. En **Identifiers** > Click en **+** (agregar)
2. Selecciona **Services IDs** > Continue
3. Configura:
   ```
   Description: Sistema de Eventos - Web
   Identifier: com.tuempresa.eventos.web
   ```
4. ✅ Activa **Sign in with Apple**
5. Click **Configure** al lado de "Sign in with Apple"
6. En **Primary App ID**: Selecciona el App ID que creaste antes
7. En **Website URLs**:
   - **Domains**: `tuempresa.supabase.co` (sin https://)
   - **Return URLs**: `https://TU-PROYECTO.supabase.co/auth/v1/callback`
   
   Ejemplo:
   ```
   Domains: ygxopmvyrxabvfwxcaws.supabase.co
   Return URLs: https://ygxopmvyrxabvfwxcaws.supabase.co/auth/v1/callback
   ```
8. Click **Next** > **Done** > **Continue** > **Register**

#### **C. Crear Private Key**

1. En el menú lateral, ve a **Keys**
2. Click en **+** (agregar)
3. Configura:
   ```
   Key Name: Sign in with Apple Key
   ```
4. ✅ Activa **Sign in with Apple**
5. Click **Configure**
6. Selecciona tu **Primary App ID**
7. Click **Save** > **Continue** > **Register**
8. **¡IMPORTANTE!** Descarga la key (.p8 file)
   - Solo se puede descargar una vez
   - Guárdala en un lugar seguro
9. Anota el **Key ID** (lo necesitarás en Supabase)

#### **D. Obtener Team ID**

1. En el menú superior derecho, haz clic en tu nombre
2. Ve a **Membership**
3. Copia tu **Team ID** (ejemplo: A1B2C3D4E5)

---

### 3️⃣ Configurar en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. **Authentication** > **Providers**
3. Busca **Apple** en la lista
4. Activa el toggle **"Apple Enabled"**
5. Completa los campos:

   ```
   Services ID: com.tuempresa.eventos.web
   Team ID: [Tu Team ID de Apple]
   Key ID: [El Key ID que anotaste]
   Secret Key: [El contenido del archivo .p8]
   ```

6. Para el **Secret Key**:
   - Abre el archivo `.p8` que descargaste
   - Copia TODO el contenido (incluyendo las líneas BEGIN y END)
   - Pégalo en el campo

   Ejemplo del contenido:
   ```
   -----BEGIN PRIVATE KEY-----
   MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
   ...más líneas...
   -----END PRIVATE KEY-----
   ```

7. Click **Save**

---

### 4️⃣ Actualizar URLs en Apple Developer

Si cambias de dominio o despliegas a producción:

1. Ve a Apple Developer > Identifiers
2. Selecciona tu **Service ID**
3. Click en **Configure** de "Sign in with Apple"
4. Actualiza las URLs:

   **Desarrollo:**
   ```
   Domains: localhost
   Return URLs: http://localhost:54321/auth/v1/callback
   ```

   **Producción:**
   ```
   Domains: tu-dominio.vercel.app
   Return URLs: https://tu-dominio.vercel.app/auth/callback
   
   Y también:
   Domains: tuproyecto.supabase.co
   Return URLs: https://tuproyecto.supabase.co/auth/v1/callback
   ```

5. Click **Save** > **Continue** > **Save**

---

## ✅ Verificar que funciona

### **Registro con Apple:**

1. Ve a `http://localhost:3000/registro`
2. Haz clic en **"Continuar con Apple"**
3. Serás redirigido a Apple
4. Selecciona tu Apple ID
5. Elige compartir o ocultar tu email:
   - **Compartir email**: Se usa tu email real
   - **Ocultar email**: Apple crea un email relay privado
6. Click **Continue**
7. ✅ Serás redirigido de vuelta y registrado automáticamente

### **Login con Apple:**

1. Ve a `http://localhost:3000/login`
2. Haz clic en **"Continuar con Apple"**
3. Apple te reconocerá automáticamente
4. ✅ Serás autenticado y redirigido al inicio

---

## 🔐 Protección de Email con Apple

Apple ofrece **Hide My Email**:

```
Usuario selecciona "Hide My Email"
  ↓
Apple crea email relay: abc123@privaterelay.appleid.com
  ↓
Tu app recibe el email relay
  ↓
Correos enviados al relay se reenvían al usuario
  ↓
Usuario mantiene privacidad ✅
```

**Ventajas:**
- Usuario mantiene su email privado
- Apple reenvía correos automáticamente
- Funciona transparente para tu app
- Usuario puede deshabilitar relay en cualquier momento

**Consideraciones:**
- Si el usuario deshabilita el relay, no recibirá correos
- El email relay es único por usuario y por app
- Es un email válido para tu sistema

---

## 🛠️ Solución de Problemas

### **Error: "invalid_client"**

**Causa:** Services ID, Team ID o Key ID incorrectos

**Solución:**
1. Verifica que los IDs en Supabase coincidan con Apple Developer
2. Asegúrate de usar el Services ID (no el App ID)
3. Verifica que el Team ID sea correcto (10 caracteres)

### **Error: "invalid_request"**

**Causa:** Return URL no configurada correctamente en Apple

**Solución:**
1. Ve a Apple Developer > Tu Services ID
2. Verifica que la Return URL sea exacta:
   ```
   https://TU-PROYECTO.supabase.co/auth/v1/callback
   ```
3. Debe incluir `https://` y `/auth/v1/callback`

### **Error: "invalid_grant"**

**Causa:** Private Key (.p8) incorrecta o mal formateada

**Solución:**
1. Vuelve a copiar el contenido del archivo .p8
2. Asegúrate de incluir las líneas BEGIN y END
3. No debe haber espacios extra o saltos de línea adicionales

### **No recibo correos con email relay**

**Causa:** Usuario deshabilitó el relay o hay problema de entregabilidad

**Solución:**
1. Verifica en Supabase > Authentication > Users que el email se guardó
2. Prueba enviar correo de prueba desde Supabase
3. Si el usuario deshabilitó relay, debe usar otro método de login

### **Botón de Apple no aparece**

**Causa:** Apple provider no está habilitado en Supabase

**Solución:**
1. Ve a Supabase Dashboard > Authentication > Providers
2. Verifica que Apple esté activado
3. Guarda cambios y recarga la página

---

## 📊 Monitorear Usuarios de Apple

### **Ver usuarios autenticados con Apple:**

```sql
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as nombre,
  raw_user_meta_data->>'provider' as provider,
  created_at
FROM auth.users
WHERE raw_user_meta_data->>'provider' = 'apple'
ORDER BY created_at DESC;
```

### **Identificar emails relay:**

```sql
SELECT 
  email,
  CASE 
    WHEN email LIKE '%@privaterelay.appleid.com' THEN '🍎 Email Oculto'
    ELSE '📧 Email Real'
  END as tipo_email
FROM auth.users
WHERE raw_user_meta_data->>'provider' = 'apple';
```

---

## 💰 Costos

| Ítem | Costo |
|------|-------|
| Apple Developer Program | $99 USD/año |
| Sign in with Apple | Gratis (incluido) |
| Supabase Auth | Gratis hasta 50k users |

**Total inicial:** $99 USD/año

---

## 📝 Mejores Prácticas

1. **Manejo de Email Relay:**
   - Trata los emails relay como emails normales
   - No asumas que son temporales
   - Respeta la privacidad del usuario

2. **Seguridad del Private Key:**
   - NUNCA compartas el archivo .p8
   - Guárdalo en un gestor de contraseñas
   - Si lo pierdes, genera uno nuevo

3. **Testing:**
   - Prueba con email real y email oculto
   - Verifica que los correos lleguen en ambos casos
   - Prueba el flujo completo de registro y login

4. **Experiencia de Usuario:**
   - Muestra claramente la opción de Apple
   - Explica que pueden ocultar su email
   - Soporta usuarios que cambien de email relay a real

---

## 🎯 Diferencias con Google OAuth

| Característica | Google | Apple |
|----------------|--------|-------|
| **Costo** | Gratis | $99/año |
| **Email oculto** | No | Sí (Hide My Email) |
| **Configuración** | Más simple | Más compleja |
| **Private Key** | No requerida | Requerida (.p8) |
| **Popularidad** | Mayor | Creciente |
| **iOS/macOS** | Estándar | Nativo y preferido |

---

## 🎉 ¡Listo!

Ahora tu aplicación soporta:
- ✅ **Registro con Google** (email real)
- ✅ **Registro con Apple** (email real u oculto)
- ✅ **Registro manual** (con verificación)
- ✅ **Login con cualquier método**
- ✅ **Protección de privacidad** con Apple relay

**Los usuarios de iOS/macOS preferirán Sign in with Apple por su integración nativa y privacidad mejorada.** 🍎
