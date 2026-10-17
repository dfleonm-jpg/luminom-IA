# 🗑️ CÓMO BORRAR USUARIOS ANTIGUOS DE FIREBASE

## ⚠️ IMPORTANTE

Esto borrará TODOS los usuarios registrados antes de configurar Firestore correctamente. Hazlo solo si estás seguro.

---

## 📋 MÉTODO 1: Borrar usuarios uno por uno (Recomendado)

### Paso 1: Ve a Firebase Console
```
https://console.firebase.google.com/
```

### Paso 2: Selecciona tu proyecto
- Click en **luminom-ia**

### Paso 3: Ve a Authentication
- En el menú lateral: **Authentication**
- Click en la pestaña **"Users"** (Usuarios)

### Paso 4: Borrar usuarios
1. Verás la lista de usuarios registrados
2. Para cada usuario:
   - Haz click en el **icono de tres puntos** (⋮) al lado derecho
   - Click en **"Delete user"** (Eliminar usuario)
   - Confirma

### ✅ Resultado:
- Todos los usuarios antiguos eliminados
- Los nuevos registros funcionarán correctamente con Firestore

---

## 📋 MÉTODO 2: Borrar todos los datos de Firestore

Si quieres empezar de cero completamente:

### Paso 1: Ve a Firestore Database
- Firebase Console → **Firestore Database**
- Pestaña **"Datos"**

### Paso 2: Borrar colecciones
1. Si ves la colección **"users"**:
   - Click en el icono de tres puntos (⋮)
   - Click en **"Delete collection"**
   - Confirma

2. Si ves la colección **"chats"**:
   - Click en el icono de tres puntos (⋮)
   - Click en **"Delete collection"**
   - Confirma

### ✅ Resultado:
- Firestore limpio
- Pero los usuarios en Authentication siguen ahí
- Necesitas borrarlos también con el Método 1

---

## 🔄 MÉTODO 3: Borrar solo datos de Firestore manteniendo Authentication

Si quieres mantener los usuarios pero limpiar sus chats:

### Paso 1: Ve a Firestore Database
- Firebase Console → **Firestore Database** → **"Datos"**

### Paso 2: Borrar solo la colección "chats"
1. Click en **"chats"**
2. Click en los tres puntos (⋮)
3. Click en **"Delete collection"**
4. Confirma

### ✅ Resultado:
- Los usuarios pueden seguir iniciando sesión
- Pero no tienen historial de chats
- Empiezan de cero

---

## 🎯 RECOMENDACIÓN

**Para tu caso (empezar limpio):**

1. **Borra TODOS los usuarios de Authentication** (Método 1)
2. **Borra TODAS las colecciones de Firestore** (Método 2)
3. **Registra un usuario nuevo de prueba**
4. **Envía un mensaje**
5. **Verifica que aparece en Firestore → chats**

---

## ⚙️ DESPUÉS DE LIMPIAR

### Verifica que todo funciona:

1. **Regístrate con un email nuevo:**
   - Ve a: `https://srdaniontop-netizen.github.io/luminam-ia/login.html`
   - Click en "Registrarse"
   - Usa un email NUEVO

2. **Envía un mensaje en el tutor:**
   - Escribe: "Hola, esto es una prueba"
   - Espera la respuesta

3. **Verifica en Firebase Console:**
   - Ve a **Firestore Database** → **"Datos"**
   - Deberías ver:
     - Colección **"users"** con 1 documento
     - Colección **"chats"** con 1 documento

4. **Recarga la página:**
   - Ctrl + Shift + R
   - Deberías ver tu chat en el historial

5. **Cierra sesión y vuelve a entrar:**
   - Click en "Salir"
   - Vuelve a iniciar sesión
   - El historial debe seguir ahí

---

## 🐛 Si hay problemas después de limpiar:

### Problema: "Usuario no encontrado en la base de datos"

**Causa:** El usuario está en Authentication pero no en Firestore

**Solución:**
1. Borra el usuario de Authentication
2. Regístrate de nuevo
3. Ahora sí se creará en ambos lados

### Problema: "Permission denied"

**Causa:** Las reglas de Firestore están mal configuradas

**Solución:**
1. Ve a Firestore Database → Reglas
2. Usa: `https://srdaniontop-netizen.github.io/luminam-ia/generar-reglas-firebase.html`
3. Copia las reglas
4. Pega en Firebase Console
5. Publica

### Problema: Los chats no se guardan

**Causa:** Firestore no está creado o las reglas están mal

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca el error exacto
3. Si dice "failed-precondition" → Firestore no está creado
4. Si dice "permission-denied" → Reglas mal configuradas

---

## ✅ CHECKLIST FINAL

- [ ] Borré todos los usuarios antiguos de Authentication
- [ ] Borré todas las colecciones de Firestore (users, chats)
- [ ] Las reglas de Firestore están publicadas
- [ ] Me registré con un email NUEVO
- [ ] Envié un mensaje de prueba
- [ ] El chat aparece en Firestore → Datos
- [ ] El historial se carga al recargar la página
- [ ] Puedo cerrar sesión y volver a entrar

---

## 📧 ¿Necesitas ayuda?

**Nuevo email de contacto:** ialuminom@gmail.com

---

**Última actualización:** 17 de Junio, 2026
