# 🔐 Sistema de Gestión de Usuarios con Supabase y Bcrypt

## ✅ Implementación Completada

Se ha implementado un sistema completo de gestión de usuarios con las siguientes características:

### 🎯 Funcionalidades Implementadas

1. **Login con Supabase**
   - Consulta usuarios directamente desde la base de datos
   - Verifica contraseñas hasheadas con bcrypt
   - Logging detallado con emojis para debugging

2. **Creación de Usuarios**
   - Interfaz en `/admin/usuarios` para crear nuevos usuarios
   - Contraseñas automáticamente hasheadas con bcrypt (10 rounds)
   - Validación de emails duplicados
   - Asignación de roles: user, admin, global-admin

3. **Eliminación de Usuarios**
   - Solo Global Admins pueden eliminar otros admins
   - Protección contra eliminación accidental

4. **Seguridad**
   - Contraseñas nunca almacenadas en texto plano
   - Hash bcrypt con 10 rounds (muy seguro)
   - Validación de permisos por roles

---

## 📋 Pasos para Configurar

### PASO 1: Ejecutar SQL en Supabase

Ve a tu Supabase SQL Editor y ejecuta **TODO** el contenido del archivo:
```
EJECUTAR-EN-SUPABASE.sql
```

Esto creará:
- ✅ 4 tablas: users, cards, events, event_attendees
- ✅ Índices para optimización
- ✅ RLS deshabilitado temporalmente
- ✅ 3 usuarios demo con contraseñas hasheadas

### PASO 2: Verificar Usuarios Creados

En Supabase, ve a "Table Editor" → "users" y verifica que existen 3 usuarios:
- globaladmin@example.com (rol: global-admin)
- admin@example.com (rol: admin)
- user@example.com (rol: user)

Las contraseñas hasheadas deberían verse como: `$2b$10$...` (larga cadena aleatoria)

### PASO 3: Probar el Sistema

1. **Abrir la app**: http://localhost:3000/login

2. **Hacer login** con cualquiera de estos usuarios:
   ```
   Email: globaladmin@example.com
   Password: global123
   
   Email: admin@example.com
   Password: admin123
   
   Email: user@example.com
   Password: user123
   ```

3. **Ir a Gestión de Usuarios**: `/admin/usuarios`
   - Solo admins y global-admins tienen acceso

4. **Crear un nuevo usuario**:
   - Email: test@example.com
   - Password: test123
   - Rol: user

5. **Verificar en Supabase** que el nuevo usuario se guardó con contraseña hasheada

6. **Probar login** con el nuevo usuario creado

---

## 🔍 Debugging

### Ver logs en la consola (F12):

**Login exitoso:**
```
🔐 Intentando login para: globaladmin@example.com
👤 Usuario encontrado, verificando contraseña...
✅ Login exitoso
```

**Login fallido:**
```
🔐 Intentando login para: wrong@example.com
❌ Usuario no encontrado
```

**Crear usuario:**
```
👤 Creando nuevo usuario: test@example.com con rol: user
🔐 Contraseña hasheada
✅ Usuario creado exitosamente
```

---

## 📁 Archivos Modificados

### Backend (lib/auth-context.tsx)
- ✅ `login()`: Consulta Supabase y verifica bcrypt
- ✅ `createUser()`: Crea usuarios con contraseña hasheada
- ✅ `getAllUsers()`: Lista todos los usuarios
- ✅ `deleteUser()`: Elimina usuarios por ID

### Frontend (app/admin/usuarios/page.tsx)
- ✅ Formulario de creación de usuarios
- ✅ Lista de usuarios con filtros
- ✅ Botón de eliminar con validación de permisos
- ✅ Indicadores de carga
- ✅ Mensajes de éxito/error

### Base de Datos (EJECUTAR-EN-SUPABASE.sql)
- ✅ Tabla users con campo password TEXT
- ✅ Usuarios demo con contraseñas hasheadas
- ✅ Índices y RLS deshabilitado

---

## 🔒 Información de Seguridad

### Contraseñas Hasheadas con Bcrypt

Las contraseñas NO se guardan en texto plano. Ejemplo:

**Texto plano:** `global123`
**Hash bcrypt:** `$2b$10$zlPDJ.nb.84WzLXZVt7dF.kN/m9ZH0tuFBhfT.kOHhAkcPlJt.SHW`

- Cada hash es único (incluye salt)
- Irreversible (no se puede "descifrar")
- Seguro contra ataques de fuerza bruta

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **user** | - Ver eventos<br>- Registrarse a eventos<br>- Registrar tarjeta |
| **admin** | - Todo lo de user<br>- Crear eventos<br>- Ver lista de usuarios<br>- Crear usuarios normales |
| **global-admin** | - Todo lo de admin<br>- Crear otros admins<br>- Eliminar cualquier usuario |

---

## 🚀 Próximos Pasos

Una vez que todo funcione:

1. **Vercel**: Agregar variables de entorno
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ygxopmvyrxabvfwxcaws.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

2. **Opcional**: Habilitar RLS con políticas correctas
   - Archivo: `supabase-policies.sql`
   - Modificar: `USING (true)` → `USING (auth.uid() = user_id)`

3. **Testing**: Crear varios usuarios de prueba

---

## ❓ Troubleshooting

### "Usuario no encontrado"
- Verifica que ejecutaste EJECUTAR-EN-SUPABASE.sql
- Revisa en Supabase Table Editor que existen los usuarios

### "Contraseña incorrecta" 
- Las contraseñas son:
  - globaladmin@example.com: `global123`
  - admin@example.com: `admin123`
  - user@example.com: `user123`

### Error al crear usuario
- Revisa que el email no exista ya
- Verifica la consola del navegador (F12)
- Checa Supabase logs

---

## 📞 Soporte

Si algo no funciona:
1. Abre la consola del navegador (F12)
2. Copia los mensajes de error
3. Verifica los logs de Supabase (Dashboard → Logs)
