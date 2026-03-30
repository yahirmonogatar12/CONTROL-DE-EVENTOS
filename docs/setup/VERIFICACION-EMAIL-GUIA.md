# 📧 Sistema de Verificación de Email

## 🎯 Objetivo

Evitar que usuarios creen múltiples cuentas (multicuentas) mediante la verificación obligatoria de correo electrónico durante el registro.

---

## ✨ Características Implementadas

### 🔒 **Seguridad:**
- ✅ Verificación obligatoria de email antes del login
- ✅ Prevención de multicuentas (un email = una cuenta)
- ✅ Email de confirmación automático
- ✅ Tokens seguros con expiración (24 horas)
- ✅ Protección contra spam de registros

### 📨 **Flujo de Usuario:**
```
1. Usuario se registra (/registro)
   ↓
2. Sistema crea cuenta + envía email de verificación
   ↓
3. Usuario recibe correo con enlace
   ↓
4. Usuario hace clic en enlace
   ↓
5. Email verificado ✅
   ↓
6. Usuario puede iniciar sesión
```

### 🚫 **Sin Verificación:**
```
Login sin verificar → ❌ Error: "Por favor verifica tu correo electrónico"
```

---

## 📋 Configuración en Supabase Dashboard

### 1️⃣ **Activar Verificación de Email**

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. **Authentication** > **Settings**
3. Busca la sección **"Email Auth"**
4. Asegúrate que esté **ACTIVADO**:
   - ✅ **Enable email confirmations** (Obligatorio)
   - ✅ **Secure email change** (Recomendado)
   - ✅ **Double confirm email changes** (Recomendado)

---

### 2️⃣ **Configurar URL de Sitio**

1. En **Authentication** > **URL Configuration**
2. Configura según tu entorno:

   **Desarrollo:**
   ```
   Site URL: http://localhost:3000
   Redirect URLs: http://localhost:3000/auth/callback
   ```

   **Producción:**
   ```
   Site URL: https://tu-dominio.vercel.app
   Redirect URLs: https://tu-dominio.vercel.app/auth/callback
   ```

---

### 3️⃣ **Personalizar Email de Verificación**

1. Ve a **Authentication** > **Email Templates**
2. Selecciona **"Confirm signup"**
3. Personaliza el contenido:

   **Asunto sugerido:**
   ```
   Verifica tu correo - Sistema de Eventos
   ```

   **Cuerpo del email (HTML):**
   ```html
   <h2>¡Bienvenido al Sistema de Eventos!</h2>
   
   <p>Gracias por registrarte. Para completar tu registro y acceder a todos los eventos, necesitas verificar tu correo electrónico.</p>
   
   <p><a href="{{ .ConfirmationURL }}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verificar mi correo</a></p>
   
   <p>O copia y pega este enlace en tu navegador:</p>
   <p>{{ .ConfirmationURL }}</p>
   
   <p><small>Este enlace expira en 24 horas.</small></p>
   
   <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
   
   <hr>
   <p><small>Sistema de Registro de Eventos</small></p>
   ```

4. Haz clic en **Save**

---

### 4️⃣ **Configurar Proveedor de Email (Opcional pero Recomendado)**

Por defecto, Supabase usa su propio servidor SMTP, pero para mejor entregabilidad, configura tu propio SMTP:

1. Ve a **Project Settings** > **Auth** > **SMTP Settings**
2. Configura tu servidor SMTP:

   **Opciones populares:**
   
   **SendGrid:**
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Tu API Key de SendGrid]
   ```

   **Gmail (desarrollo):**
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: tu-email@gmail.com
   Password: [App Password de Gmail]
   ```

   **Resend (recomendado):**
   ```
   Host: smtp.resend.com
   Port: 587
   Username: resend
   Password: [Tu API Key de Resend]
   ```

3. Configura el **Sender email** y **Sender name**

---

### 5️⃣ **Configurar Rate Limiting (Recomendado)**

Para prevenir abuso y spam:

1. **Project Settings** > **Auth** > **Rate Limits**
2. Ajusta los límites:
   ```
   - Email signups: 10 por hora por IP
   - Email verifications: 5 por hora por IP
   - Password recovery: 3 por hora por email
   ```

---

### 6️⃣ **Ejecutar Script SQL**

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `CONFIGURAR-VERIFICACION-EMAIL.sql`
3. Copia y pega el contenido
4. Ejecuta el script
5. Verifica que las políticas se hayan creado correctamente

---

## 🧪 Probar el Sistema

### **Registro exitoso:**

1. Ve a `http://localhost:3000/registro`
2. Completa el formulario:
   - Nombre: Juan Pérez
   - Email: juan@example.com
   - Contraseña: test123
   - Confirmar: test123
3. Haz clic en **"Crear Cuenta"**
4. ✅ Verás el mensaje: "¡Cuenta creada! Te hemos enviado un correo de verificación..."

### **Verificar correo:**

1. Revisa tu bandeja de entrada (y spam)
2. Busca el correo de Supabase
3. Haz clic en el enlace de verificación
4. Serás redirigido a la aplicación
5. ✅ Email verificado

### **Intentar login sin verificar:**

1. Registra una cuenta
2. NO hagas clic en el enlace de verificación
3. Ve a `/login`
4. Intenta iniciar sesión
5. ❌ Verás: "Por favor verifica tu correo electrónico antes de iniciar sesión"

### **Login después de verificar:**

1. Verifica tu correo (clic en enlace)
2. Ve a `/login`
3. Ingresa tus credenciales
4. ✅ Acceso concedido

---

## 📊 Monitorear Usuarios

### **Ver estado de verificación:**

Ejecuta en Supabase SQL Editor:

```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Verificado'
    ELSE '⏳ Pendiente'
  END as estado
FROM auth.users
ORDER BY created_at DESC;
```

### **Usuarios sin verificar:**

```sql
SELECT 
  email,
  created_at,
  NOW() - created_at as tiempo_sin_verificar
FROM auth.users
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
```

### **Reenviar email de verificación (manual):**

Si un usuario no recibió el correo:

1. Ve a **Authentication** > **Users** en Dashboard
2. Busca el usuario
3. Haz clic en los 3 puntos (...)
4. Selecciona **"Resend confirmation email"**

---

## 🛠️ Solución de Problemas

### **El correo no llega:**

1. **Revisar spam/correo no deseado**
   - Los correos de Supabase pueden ir a spam

2. **Verificar SMTP configurado**
   - Dashboard > Project Settings > Auth > SMTP Settings
   - Verifica que las credenciales sean correctas

3. **Revisar logs**
   - Dashboard > Logs > Auth Logs
   - Busca errores de envío de email

4. **Probar con otro correo**
   - Algunos proveedores bloquean correos automatizados

### **Error: "Email not confirmed":**

✅ **Solución:** El usuario debe verificar su correo antes de iniciar sesión. Reenvía el correo de verificación desde el Dashboard.

### **Error: "User already registered":**

✅ **Solución:** El email ya está en uso. El usuario debe usar otro correo o recuperar su contraseña si olvidó sus credenciales.

### **El enlace de verificación expiró:**

✅ **Solución:** Los enlaces expiran en 24 horas. Reenvía un nuevo correo de verificación desde:
- Dashboard > Authentication > Users > [Usuario] > Resend confirmation

### **Usuario verificado pero no puede iniciar sesión:**

1. Verifica en SQL que el usuario existe:
   ```sql
   SELECT * FROM auth.users WHERE email = 'email@example.com';
   SELECT * FROM users WHERE email = 'email@example.com';
   ```

2. Verifica que `email_confirmed_at` no sea NULL

3. Intenta login con Supabase Auth directamente:
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'email@example.com',
     password: 'password'
   })
   ```

---

## 🔐 Prevención de Multicuentas

### **Cómo funciona:**

1. **Email único en Auth:**
   - Supabase Auth no permite registrar el mismo email dos veces
   - Intento de duplicar → Error automático

2. **Email único en DB:**
   - La tabla `users` tiene constraint UNIQUE en `email`
   - Verificación adicional antes de crear usuario

3. **Verificación obligatoria:**
   - Solo emails verificados pueden iniciar sesión
   - Elimina cuentas falsas/temporales

4. **Rate limiting:**
   - Límite de intentos por IP
   - Previene registros masivos automatizados

### **Flujo de validación:**

```
Usuario intenta registrarse
  ↓
¿Email existe en DB? → SÍ → ❌ Error: "Email ya registrado"
  ↓ NO
¿Email existe en Auth? → SÍ → ❌ Error: "Email ya registrado"
  ↓ NO
Crear en Auth → Enviar email → Crear en DB
  ↓
Usuario verifica email
  ↓
Puede iniciar sesión ✅
```

---

## 📝 Mejores Prácticas

1. **Emails de calidad:**
   - Usa un dominio verificado para enviar correos
   - Configura SPF, DKIM, DMARC
   - Usa un servicio SMTP confiable (SendGrid, Resend, etc.)

2. **Experiencia de usuario:**
   - Mensaje claro después del registro
   - Instrucciones para revisar spam
   - Opción de reenviar correo fácilmente

3. **Limpieza de datos:**
   - Elimina usuarios no verificados después de 7 días (opcional)
   - Mantén logs de intentos fallidos

4. **Monitoreo:**
   - Revisa tasas de verificación
   - Identifica problemas de entregabilidad
   - Ajusta rate limits según sea necesario

---

## 🎉 ¡Listo!

Ahora tu sistema tiene:
- ✅ Verificación obligatoria de email
- ✅ Prevención de multicuentas
- ✅ Seguridad mejorada
- ✅ Mejor control de usuarios legítimos

**Los usuarios deben verificar su correo antes de poder iniciar sesión y asistir a eventos.**
