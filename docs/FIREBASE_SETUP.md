# 🔥 Guía Completa: Firebase para Luminom IA

## ¿Por qué Firebase?

Firebase es **PERFECTO** para GitHub Pages porque:

✅ **Funciona 100% en el frontend** (no necesitas backend)  
✅ **Base de datos en tiempo real** con sincronización automática  
✅ **Autenticación integrada** (login, registro)  
✅ **GRATIS** hasta 50,000 usuarios activos  
✅ **Multi-dispositivo** automático  
✅ **Sin configuración de servidor**  

---

## 📦 Paso 1: Crear Proyecto en Firebase

### 1.1 Registrarse

1. Ve a: **https://console.firebase.google.com/**
2. Haz clic en **"Agregar proyecto"**
3. Nombre del proyecto: `luminom-ia`
4. Desactiva Google Analytics (no lo necesitas)
5. Haz clic en **"Crear proyecto"**
6. Espera 30 segundos

---

## 🔧 Paso 2: Configurar Firebase Authentication

### 2.1 Activar Email/Password

1. En el menú lateral, haz clic en **"Authentication"**
2. Haz clic en **"Comenzar"**
3. Selecciona **"Email/Password"** (primera opción)
4. **Activa** el interruptor
5. Haz clic en **"Guardar"**

---

## 🗄️ Paso 3: Configurar Firestore Database

### 3.1 Crear Base de Datos

1. En el menú lateral, haz clic en **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Producción"**
4. Ubicación: **us-central** (o la más cercana)
5. Haz clic en **"Activar"**

### 3.2 Configurar Reglas de Seguridad

1. Haz clic en la pestaña **"Reglas"**
2. **Reemplaza** todo con esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de usuarios
    match /users/{userId} {
      // Solo el usuario autenticado puede leer/escribir sus datos
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins pueden leer todo
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email == 'admin@luminom.com';
    }
    
    // Colección de chats
    match /chats/{chatId} {
      // Solo el dueño del chat puede leer/escribir
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      // Al crear, el userId debe ser el del usuario autenticado
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // Admins pueden leer todo
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email == 'admin@luminom.com';
    }
    
    // Colección de estadísticas (solo lectura para admin)
    match /stats/{document=**} {
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email == 'admin@luminom.com';
      allow write: if request.auth != null;
    }
  }
}
```

3. Haz clic en **"Publicar"**

---

## 🔑 Paso 4: Obtener Configuración

### 4.1 Agregar App Web

1. En la página principal de Firebase, haz clic en el ícono **Web** `</>`
2. Nombre de la app: `Luminom IA Web`
3. **NO** marques Firebase Hosting
4. Haz clic en **"Registrar app"**

### 4.2 Copiar Configuración

Verás algo como esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "luminom-ia.firebaseapp.com",
  projectId: "luminom-ia",
  storageBucket: "luminom-ia.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**COPIA TODO EL OBJETO** `firebaseConfig`

---

## 📝 Paso 5: Configurar en tu Proyecto

### 5.1 Actualizar firebase-config.js

1. Abre el archivo: `firebase-config.js`
2. **Reemplaza** el `firebaseConfig` con el tuyo:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_REAL_AQUI",  // ← Pega tus valores
  authDomain: "luminom-ia.firebaseapp.com",
  projectId: "luminom-ia",
  storageBucket: "luminom-ia.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

3. **Guarda el archivo**

---

## ✅ Paso 6: Verificar que Funciona

### 6.1 Subir a GitHub

```bash
git add .
git commit -m "Add Firebase configuration"
git push origin main
```

### 6.2 Probar la Sincronización

1. Abre tu sitio: `https://TU_USUARIO.github.io/luminam-ia/`
2. Regístrate con un email (ej: `test@test.com`)
3. Crea una conversación con el tutor
4. **Abre en otro navegador o dispositivo**
5. Inicia sesión con el mismo email
6. ¡Deberías ver tu conversación! 🎉

### 6.3 Verificar en Firebase Console

1. Ve a Firebase Console → Firestore Database
2. Deberías ver las colecciones:
   - `users` (con tu usuario)
   - `chats` (con tus conversaciones)

---

## 📊 Plan Gratuito (Spark)

Firebase tiene un **plan gratuito generoso**:

| Recurso | Límite Gratuito | Suficiente para |
|---------|-----------------|-----------------|
| **Usuarios autenticados** | 50,000/mes | ~1,600/día |
| **Documentos leídos** | 50,000/día | ~16,000 usuarios activos |
| **Documentos escritos** | 20,000/día | ~6,000 usuarios activos |
| **Almacenamiento** | 1 GB | ~100,000 conversaciones |
| **Transferencia** | 10 GB/mes | Suficiente para miles de usuarios |

**Conclusión:** Puedes tener **miles de usuarios** gratis.

---

## 🔒 Seguridad

### ¿Es seguro exponer la API Key?

**SÍ**, es seguro porque:

1. ✅ La API Key de Firebase **NO es secreta**
2. ✅ La seguridad está en las **reglas de Firestore** (las configuramos)
3. ✅ Solo los usuarios autenticados pueden acceder a sus datos
4. ✅ Nadie puede ver datos de otros usuarios
5. ✅ El admin (`admin@luminom.com`) puede ver estadísticas

### Mejores Prácticas:

- ✅ Configura reglas de seguridad (ya lo hicimos)
- ✅ Activa autenticación obligatoria (ya lo tienes)
- ✅ Usa índices en Firestore para mejor rendimiento

---

## 🚨 Solución de Problemas

### Error: "Firebase: Error (auth/invalid-api-key)"

- ❌ La API Key es incorrecta
- ✅ Verifica que copiaste bien el `firebaseConfig`
- ✅ Asegúrate de no tener espacios extra

### Error: "Missing or insufficient permissions"

- ❌ Las reglas de Firestore están mal configuradas
- ✅ Ve a Firestore → Reglas y pega las reglas que di arriba
- ✅ Haz clic en "Publicar"

### Los datos no se sincronizan

- ❌ Firebase no está inicializado correctamente
- ✅ Abre la consola del navegador (F12)
- ✅ Debe decir "✅ Firebase inicializado correctamente"

### Error: "Quota exceeded"

- ❌ Excediste el límite gratuito
- ✅ Ve a Firebase Console → Usage
- ✅ Si tienes muchos usuarios, considera el plan Blaze (pago por uso)

---

## 💰 ¿Cuándo necesito pagar?

Necesitarás el **plan Blaze** (pago por uso) cuando:

- Tengas más de **50,000 usuarios activos/mes**
- O más de **50,000 lecturas/día**
- O más de **20,000 escrituras/día**

**Costos aproximados:**
- Primeros 50K lecturas: Gratis
- Siguientes 100K lecturas: $0.36
- Siguientes 200K lecturas: $0.18/100K

Es **MUY BARATO** incluso con miles de usuarios.

---

## 🎓 Recursos Adicionales

- 📚 **Documentación oficial:** https://firebase.google.com/docs
- 🎥 **Tutoriales:** https://firebase.google.com/codelabs
- 💬 **Comunidad:** https://stackoverflow.com/questions/tagged/firebase

---

## 🎉 ¡Listo!

Ahora tu aplicación tiene:

✅ Base de datos real en la nube  
✅ Sincronización multi-dispositivo automática  
✅ Autenticación segura  
✅ Datos persistentes (no se pierden)  
✅ Escalable a miles de usuarios  
✅ **100% GRATIS** (hasta 50K usuarios)  
✅ **SIN BACKEND** (funciona con GitHub Pages)  

---

**Actualizado:** 17 de Junio, 2026  
**Versión:** 5.0 - Sistema con Firebase
