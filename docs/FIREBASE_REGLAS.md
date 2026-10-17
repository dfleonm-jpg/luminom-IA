# 🔒 Configurar Reglas de Seguridad en Firebase

## ⚠️ IMPORTANTE: Debes configurar esto YA

Las reglas de seguridad protegen tus datos. Sin ellas, cualquiera puede ver/borrar todo.

---

## 📋 Paso 1: Ir a Firestore

1. Ve a: **https://console.firebase.google.com/**
2. Selecciona tu proyecto: **luminom-ia**
3. En el menú lateral, haz clic en **"Firestore Database"**
4. Haz clic en la pestaña **"Reglas"**

---

## 📝 Paso 2: Copiar las Reglas

Verás un editor de texto. **BORRA TODO** y pega esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de usuarios
    match /users/{userId} {
      // Solo el usuario autenticado puede leer/escribir sus datos
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // El admin puede leer todos los usuarios
      allow read: if request.auth != null && 
                     exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email == 'admin@luminom.com';
    }
    
    // Colección de chats
    match /chats/{chatId} {
      // Solo el dueño del chat puede leer/escribir
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      // Al crear, el userId debe ser el del usuario autenticado
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      // El admin puede leer todos los chats
      allow read: if request.auth != null && 
                     exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.email == 'admin@luminom.com';
    }
  }
}
```

---

## ✅ Paso 3: Publicar

1. Haz clic en **"Publicar"** (arriba a la derecha)
2. Espera 5 segundos
3. Verás un mensaje: "Reglas publicadas correctamente"

---

## 🔐 ¿Qué hacen estas reglas?

### Para Usuarios Normales:
- ✅ Pueden ver **solo** sus propios datos
- ✅ Pueden crear/editar **solo** sus propios chats
- ❌ NO pueden ver datos de otros usuarios
- ❌ NO pueden borrar chats de otros

### Para Admin (admin@luminom.com):
- ✅ Puede ver todos los usuarios
- ✅ Puede ver todos los chats
- ✅ Acceso completo para el panel admin

---

## 🚨 ¿Qué pasa si NO configuras las reglas?

Después de 30 días, Firebase cerrará tu base de datos automáticamente por seguridad.

**Mensaje de error:**
```
Missing or insufficient permissions
```

---

## ✅ Verificar que funciona

1. Abre tu sitio: `https://srdaniontop-netizen.github.io/luminam-ia/`
2. Regístrate con un nuevo usuario
3. Crea una conversación
4. Si no hay errores → ¡Funciona! ✅

---

## 📞 ¿Problemas?

### Error: "Missing or insufficient permissions"
- ❌ Las reglas están mal
- ✅ Vuelve a copiar y pegar las reglas exactamente

### Error: "PERMISSION_DENIED"
- ❌ El usuario no está autenticado
- ✅ Cierra sesión e inicia sesión de nuevo

---

**¡Listo!** Tus datos ahora están protegidos 🔒
