# 🗄️ Configurar MongoDB Atlas para Luminom IA

Guía paso a paso para configurar MongoDB Atlas (base de datos en la nube).

---

## 🎯 ¿Por qué MongoDB Atlas?

- ✅ **Gratis** hasta 512 MB (suficiente para empezar)
- ✅ **Automático**: Backups, seguridad, escalabilidad
- ✅ **Compatible** con Vercel, Heroku, etc.
- ✅ **Global**: Servidores en múltiples regiones

---

## 📋 Paso a Paso

### **1. Crear Cuenta en MongoDB Atlas**

1. Ve a: https://www.mongodb.com/cloud/atlas
2. Click en **"Try Free"**
3. Regístrate con:
   - Google
   - GitHub
   - O email/contraseña

### **2. Crear un Cluster**

1. Después de registrarte, click en **"Build a Database"**
2. Selecciona **"M0 FREE"** (el tier gratuito)
3. Configura:
   - **Cloud Provider**: AWS (recomendado)
   - **Region**: Selecciona la más cercana a tus usuarios
     - Para Colombia: **us-east-1** (Virginia) es buena opción
   - **Cluster Name**: `luminom-cluster` (o el que prefieras)
4. Click en **"Create Cluster"**

⏱️ Tomará 3-5 minutos crear el cluster.

---

### **3. Configurar Acceso de Red**

Mientras el cluster se crea:

1. En el menú izquierdo, click en **"Network Access"**
2. Click en **"Add IP Address"**
3. Selecciona **"Allow Access from Anywhere"**
   - IP: `0.0.0.0/0`
   - ⚠️ Para producción, considera restringir solo a las IPs de Vercel
4. Click en **"Confirm"**

**Nota**: Esto permite que Vercel (y cualquier servidor) se conecte a tu base de datos.

---

### **4. Crear Usuario de Base de Datos**

1. En el menú izquierdo, click en **"Database Access"**
2. Click en **"Add New Database User"**
3. Configura:
   - **Authentication Method**: Password
   - **Username**: `luminom-admin` (o el que prefieras)
   - **Password**: Genera una segura (guárdala bien)
     - Evita caracteres especiales como `@`, `!`, `/` (pueden causar problemas en la URL)
   - **Database User Privileges**: "Atlas admin" (o "Read and write to any database")
4. Click en **"Add User"**

**⚠️ GUARDA ESTAS CREDENCIALES**:
```
Username: luminom-admin
Password: tu_password_seguro
```

---

### **5. Obtener Connection String**

1. Ve a **"Database"** en el menú izquierdo
2. En tu cluster, click en **"Connect"**
3. Selecciona **"Connect your application"**
4. Configura:
   - **Driver**: Node.js
   - **Version**: 5.5 o superior
5. Copia el **Connection String**

Se verá así:
```
mongodb+srv://luminom-admin:<password>@luminom-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### **6. Formatear el Connection String**

Tu connection string final debe verse así:

```
mongodb+srv://luminom-admin:TU_PASSWORD@luminom-cluster.xxxxx.mongodb.net/luminom-ia?retryWrites=true&w=majority
```

**Cambios importantes**:
1. Reemplaza `<password>` con tu password real
2. Agrega `/luminom-ia` después del `.net/` (nombre de la base de datos)
3. Si tu password tiene caracteres especiales, debes URL-encodearlos:
   - `@` → `%40`
   - `!` → `%21`
   - `/` → `%2F`
   - `#` → `%23`

**Ejemplo**:
```
Password: MyPass@123!
URL Encoded: MyPass%40123%21

Connection String:
mongodb+srv://luminom-admin:MyPass%40123%21@luminom-cluster.xxxxx.mongodb.net/luminom-ia?retryWrites=true&w=majority
```

---

## ✅ Verificar la Configuración

### **Opción 1: Desde el código local**

1. Copia tu connection string
2. Pégalo en tu archivo `.env`:
   ```env
   MONGODB_URI=mongodb+srv://luminom-admin:password@cluster.mongodb.net/luminom-ia?retryWrites=true&w=majority
   ```
3. Ejecuta tu app localmente:
   ```bash
   cd backend
   npm run dev
   ```
4. Si ves `✅ MongoDB conectado`, ¡funciona!

### **Opción 2: Desde MongoDB Atlas**

1. Ve a tu cluster → **"Collections"**
2. Deberías ver las colecciones creadas después de ejecutar la app:
   - `users`
   - `conversations`
   - `messages`

---

## 🔒 Seguridad Adicional

### **1. Restringir Acceso por IP (Producción)**

Si conoces las IPs de Vercel (o tu servidor):

1. Ve a **"Network Access"**
2. En lugar de `0.0.0.0/0`, agrega IPs específicas
3. Para Vercel, puedes usar sus rangos de IP (consulta la documentación)

### **2. Crear Usuarios con Permisos Limitados**

En lugar de "Atlas admin", crea usuarios con solo permisos de lectura/escritura:

1. **Database Access** → **Add New Database User**
2. **Database User Privileges** → "Read and write to any database"

### **3. Habilitar Auditoria (Opcional)**

Para clusters pagos, puedes habilitar logs de auditoria en **Security** → **Database Auditing**.

---

## 📊 Monitorear tu Base de Datos

### **Ver Métricas en Tiempo Real**

1. Ve a tu cluster
2. Click en **"Metrics"**
3. Verás:
   - Conexiones activas
   - Operaciones por segundo
   - Uso de memoria
   - Network I/O

### **Configurar Alertas**

1. Ve a **"Alerts"**
2. Click en **"Add Alert"**
3. Configura alertas para:
   - Alto uso de conexiones
   - Alto uso de almacenamiento
   - Errores de conexión

---

## 💾 Backups Automáticos

MongoDB Atlas hace backups automáticos en el tier gratuito:

- **Snapshots**: Cada 24 horas
- **Retención**: 2 días (gratis), más con planes pagos
- **Restauración**: Desde el dashboard en cualquier momento

### **Hacer Backup Manual**

1. Ve a tu cluster
2. Click en el botón **"..."** → **"Backup"**
3. Sigue las instrucciones

---

## 🚀 Usar en Vercel

### **1. Agregar Variable de Entorno en Vercel**

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega:
   ```
   Key: MONGODB_URI
   Value: mongodb+srv://luminom-admin:password@cluster.mongodb.net/luminom-ia?retryWrites=true&w=majority
   ```
4. Guarda y redeploy

### **2. Verificar Conexión**

```
https://tu-app.vercel.app/api/health
```

Si ves `"MongoDB conectado"` en los logs, ¡funciona!

---

## 🐛 Solución de Problemas

### **Error: "MongoServerError: bad auth"**

**Causa**: Usuario o password incorrectos

**Solución**:
- Verifica el username y password en Database Access
- Asegúrate de que el password esté URL-encoded si tiene caracteres especiales
- Recrea el usuario si es necesario

### **Error: "MongoTimeoutError"**

**Causa**: IP no está en la whitelist

**Solución**:
- Ve a Network Access
- Verifica que `0.0.0.0/0` esté permitido
- O agrega la IP específica de tu servidor

### **Error: "MongoParseError: Invalid scheme"**

**Causa**: Connection string mal formateado

**Solución**:
- Verifica que empiece con `mongodb+srv://`
- Verifica que el formato sea: `mongodb+srv://user:pass@host/database?options`
- Usa URL encoding para caracteres especiales en el password

### **Error: "Cannot connect to MongoDB"**

**Solución**:
1. Verifica que el cluster esté activo (no pausado)
2. Verifica la connection string completa
3. Asegúrate de incluir el nombre de la base de datos
4. Revisa los logs de Atlas en **"Activity Feed"**

---

## 📈 Escalar tu Base de Datos

### **Tier Gratuito (M0)**
- **RAM**: 512 MB
- **Storage**: 512 MB - 5 GB compartido
- **Connections**: 500 conexiones simultáneas máximo
- **Ideal para**: Desarrollo, proyectos pequeños, prototipos

### **Cuándo Actualizar**

Considera un tier pago si:
- Tienes más de 10,000 usuarios
- Necesitas más de 5 GB de almacenamiento
- Requieres backups con mayor retención
- Necesitas más de 500 conexiones simultáneas

### **Cómo Actualizar**

1. Ve a tu cluster
2. Click en **"..."** → **"Upgrade"**
3. Selecciona el tier que necesites (desde $9/mes)

---

## ✅ Checklist Final

- [ ] Cluster creado en MongoDB Atlas
- [ ] Network Access configurado (0.0.0.0/0)
- [ ] Usuario de base de datos creado
- [ ] Connection string obtenido y formateado
- [ ] Password URL-encoded (si tiene caracteres especiales)
- [ ] Nombre de base de datos incluido (`/luminom-ia`)
- [ ] Connection string probado localmente
- [ ] Variable de entorno agregada en Vercel
- [ ] App conecta correctamente en producción

---

## 🎉 ¡Listo!

Tu base de datos MongoDB Atlas está configurada y lista para:
- ✅ Almacenar usuarios
- ✅ Guardar conversaciones
- ✅ Persistir mensajes del chat
- ✅ Escalar automáticamente
- ✅ Backups automáticos

---

## 📞 Recursos Adicionales

- **Documentación**: https://docs.atlas.mongodb.com/
- **Universidad MongoDB**: https://university.mongodb.com/ (cursos gratis)
- **Soporte**: https://www.mongodb.com/support

---

**¡Tu base de datos está lista para Luminom IA! 🗄️🚀**
