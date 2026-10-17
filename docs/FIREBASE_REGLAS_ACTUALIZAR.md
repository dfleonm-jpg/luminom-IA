# 🔥 ACTUALIZAR REGLAS DE FIREBASE (URGENTE)

## ⚠️ PROBLEMA DETECTADO

Las reglas actuales de Firestore están **bloqueando el registro de nuevos usuarios**. Cuando alguien intenta registrarse, Firebase Auth crea la cuenta correctamente, pero luego falla al intentar guardar los datos en Firestore porque el usuario "no tiene permiso".

## ✅ SOLUCIÓN

Necesitas actualizar las reglas de Firestore en la consola de Firebase.

### Paso 1: Ir a Firebase Console

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **luminom-ia**
3. En el menú lateral, haz click en **Firestore Database**
4. Ve a la pestaña **Reglas** (Rules)

### Paso 2: Reemplazar las reglas

Copia y pega estas reglas (están en el archivo `firestore.rules`):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de usuarios
    match /users/{userId} {
      // Permitir creación durante el registro (cuando auth.uid coincide)
      allow create: if request.auth != null && request.auth.uid == userId;
      // Solo el usuario autenticado puede leer/escribir sus datos
      allow read, update: if request.auth != null && request.auth.uid == userId;
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

### Paso 3: Publicar

Haz click en el botón **"Publicar"** (Publish)

## 🧪 VERIFICAR QUE FUNCIONA

Después de actualizar las reglas:

1. Ve a tu sitio: https://srdaniontop-netizen.github.io/luminam-ia/test-firebase.html
2. Prueba el botón "Registrar Usuario"
3. Si sale ✅ verde, las reglas están correctas
4. Si sale ❌ rojo, revisa el mensaje de error

## 📝 QUÉ CAMBIÓ

**ANTES (problema):**
```javascript
allow read, write: if request.auth != null && request.auth.uid == userId;
```
❌ Esto bloqueaba la **creación** de usuarios nuevos

**DESPUÉS (solución):**
```javascript
allow create: if request.auth != null && request.auth.uid == userId;
allow read, update: if request.auth != null && request.auth.uid == userId;
```
✅ Esto permite crear el documento del usuario durante el registro

## ⏱️ TIEMPO DE PROPAGACIÓN

Las reglas se aplican **inmediatamente** después de publicarlas (no hay que esperar).
