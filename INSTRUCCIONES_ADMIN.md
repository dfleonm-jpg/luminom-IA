# 👑 Guía del Panel de Administración

## 🔐 Acceso al Panel

**URL:** https://srdaniontop-netizen.github.io/luminam-ia/admin.html

**Acceso restringido solo a:** `admin@luminom.com`

---

## 🎯 Cómo Acceder

### 1. Crear la Cuenta de Admin (Primera vez)

1. Ir a: https://srdaniontop-netizen.github.io/luminam-ia/login.html?tab=register
2. Llenar el formulario:
   - **Nombre:** Admin Luminom (o el que quieras)
   - **Email:** `admin@luminom.com` ⚠️ **DEBE ser exactamente este email**
   - **Contraseña:** Tu contraseña segura
   - **Carrera:** Administración (o cualquier otra)
3. Click en "Crear cuenta"
4. ✅ Listo - ahora puedes acceder al panel

### 2. Acceder al Panel (Después de crear la cuenta)

1. Iniciar sesión con `admin@luminom.com` en: https://srdaniontop-netizen.github.io/luminam-ia/login.html
2. Ir directamente a: https://srdaniontop-netizen.github.io/luminam-ia/admin.html
3. O escribir la URL en el navegador: `/admin.html`

**Nota:** El enlace a admin NO está en el menú de navegación - solo se accede por URL directa.

---

## 📊 Funciones del Panel

### 1️⃣ Estadísticas en Tiempo Real

Al abrir el panel verás 4 tarjetas con:

```
👥 Usuarios Registrados: 15
⭐ Usuarios Premium: 3
👑 Usuarios De por Vida: 1
💬 Conversaciones Totales: 127
```

**Se actualizan automáticamente** cada vez que recargas la página.

---

### 2️⃣ Tabla de Usuarios

Muestra TODOS los usuarios registrados con:

| Columna | Descripción |
|---------|-------------|
| **Nombre** | Nombre completo del usuario |
| **Email** | Correo electrónico |
| **Carrera** | Carrera que estudia |
| **Plan** | Badge de plan actual (Gratis/Premium/Lifetime) |
| **Fecha Registro** | Cuándo se registró |
| **Acciones** | Botones para dar o quitar premium |

---

### 3️⃣ Dar Premium GRATIS a un Usuario

**Casos de uso:**
- Promociones especiales
- Influencers/Embajadores
- Premios de concursos
- Testing interno
- Amigos/Familia

**Pasos:**

1. Buscar al usuario en la tabla
2. El usuario debe tener badge "📝 Gratis"
3. Click en uno de estos botones:
   - **"Dar Premium"** → Plan mensual por 12 meses
   - **"Dar Lifetime"** → Plan de por vida (para siempre)
4. Confirmar en el modal que aparece
5. ✅ ¡Listo! El usuario ahora tiene premium

**Lo que pasa automáticamente:**
- Se actualiza en Firebase Firestore
- El usuario ve su badge cambiar a "⭐ Premium" o "👑 De por Vida"
- Desaparece el límite de 10 preguntas/día
- Puede usar el tutor ilimitadamente
- Se sincroniza en todos sus dispositivos

---

### 4️⃣ Quitar Premium de un Usuario

**Casos de uso:**
- La promoción terminó
- Comportamiento inadecuado
- Terminó periodo de prueba

**Pasos:**

1. Buscar al usuario con badge "⭐ Premium" o "👑 De por Vida"
2. Click en botón **"Quitar Premium"** (rojo)
3. Confirmar en el modal
4. ✅ El usuario vuelve al plan Gratis

**Lo que pasa automáticamente:**
- Se elimina la suscripción de Firebase
- Badge vuelve a "📝 Gratis"
- Límite de 10 preguntas/día se reactiva
- Se sincroniza en todos sus dispositivos

---

## 🧪 Ejemplo de Uso Paso a Paso

### Escenario: Darle Premium gratis a un influencer

**Situación:** Un influencer universitario quiere probar Luminom IA para hacer review en Instagram.

**Paso 1:** El influencer se registra normal:
- Va a la página
- Se registra con su email: `influencer@email.com`
- Tiene plan Gratis (10 preguntas/día)

**Paso 2:** Tú le das Premium gratis:
1. Iniciar sesión como admin
2. Ir a `admin.html`
3. Buscar en la tabla: `influencer@email.com`
4. Click en "Dar Lifetime" (para que tenga acceso ilimitado permanente)
5. Confirmar

**Paso 3:** El influencer ve el cambio:
- Badge cambia a "👑 De por Vida"
- Ya no tiene límite de preguntas
- Puede hacer review del producto sin restricciones

**Paso 4 (Opcional):** Si quieres quitarle el acceso después:
- Click en "Quitar Premium"
- Vuelve a plan Gratis

---

## 💡 Tips y Mejores Prácticas

### ✅ Cuándo Dar Premium Gratis

- **Influencers/Creadores de contenido** → Lifetime (para que hagan reviews)
- **Beta testers** → Premium por 12 meses (para testing)
- **Ganadores de concursos** → Lifetime (como premio)
- **Amigos/Familia** → Lo que quieras 😊
- **Embajadores universitarios** → Lifetime (para que promuevan)

### ⚠️ Cuándo Quitar Premium

- **Abuso del servicio** (spam, comportamiento inadecuado)
- **Promoción temporal terminó** (ej: acceso por 1 mes)
- **Usuario dejó de ser embajador**
- **Testing interno terminó**

### 🔒 Seguridad

- **Solo `admin@luminom.com` puede acceder** al panel
- Si alguien más intenta entrar → Alerta: "Acceso denegado"
- Todos los cambios se registran en Firestore con timestamp
- Campo `grantedBy: "admin@luminom.com"` para auditoría

---

## 📋 Registro de Cambios en Firestore

Cuando das premium gratis, se guarda esto en Firebase:

```javascript
subscription: {
  plan: "lifetime",                    // o "premium"
  userId: "abc123",
  transactionId: "admin-granted-1234", // Identificador único
  startDate: "2026-06-17T...",
  expiryDate: "never",                 // o fecha +12 meses
  status: "active",
  paymentMethod: "admin-gift",         // 🎁 Indica que fue regalo
  grantedBy: "admin@luminom.com",      // Quién lo dio
  grantedAt: "2026-06-17T..."          // Cuándo
}
```

**Beneficio:** Puedes ver en Firebase Console quién dio premium y cuándo.

---

## 🔍 Verificar que Funcionó

### Opción 1: En el Panel de Admin
- Recargar la página
- Buscar al usuario en la tabla
- Verificar que el badge cambió

### Opción 2: En Firebase Console
1. Ir a: https://console.firebase.google.com/project/luminom-ia
2. Firestore Database → Colección `users`
3. Buscar el documento del usuario (por email)
4. Verificar que existe campo `subscription` con `status: "active"`

### Opción 3: Preguntarle al Usuario
- El usuario debe ver badge "⭐ Premium" o "👑 De por Vida" en la esquina superior derecha
- El contador de preguntas debe desaparecer
- Puede hacer preguntas ilimitadas sin bloqueo

---

## ❓ Preguntas Frecuentes

### ¿Cuántos usuarios puedo hacer premium gratis?

¡Los que quieras! No hay límite. Esto es útil para:
- Promociones de lanzamiento
- Programa de embajadores
- Marketing con influencers

### ¿El premium gratis expira?

- **Plan Premium (botón "Dar Premium"):** Sí, expira en 12 meses
- **Plan Lifetime (botón "Dar Lifetime"):** NO, es para siempre

### ¿Puedo cambiar de Premium a Lifetime?

Sí, simplemente:
1. Click en "Quitar Premium" (para limpiar)
2. Luego click en "Dar Lifetime"

### ¿Se puede dar premium a mí mismo (admin)?

¡Sí! Solo búscate en la tabla y date premium 😊

### ¿Qué pasa si el usuario ya pagó?

Si un usuario YA pagó (tiene `transactionId` de Wompi), aparecerá con badge Premium/Lifetime. Puedes quitárselo si quieres, pero **generalmente NO deberías** porque ya pagó.

**Identificador:** Los pagos reales tienen `transactionId` que empieza con números Wompi. Los gratis tienen `admin-granted-...`

---

## 🚀 Casos de Uso Reales

### 1. Lanzamiento con Influencers

**Objetivo:** 10 influencers universitarios hagan review

**Acción:**
1. Crear lista de emails de los influencers
2. Pedirles que se registren
3. Darles a todos "Lifetime" gratis
4. Ellos hacen contenido con acceso ilimitado

### 2. Concurso en Redes Sociales

**Objetivo:** "Gana 1 año de Premium gratis"

**Acción:**
1. Ganador se registra
2. Darle "Premium" (expira en 12 meses)
3. Anunciar ganador con screenshot del panel

### 3. Programa de Embajadores

**Objetivo:** 20 estudiantes promuevan en sus universidades

**Acción:**
1. Darles a todos "Lifetime"
2. A cambio ellos traen nuevos usuarios
3. Si dejan de ser embajadores → "Quitar Premium"

---

## 📝 Notas Técnicas

### Diferencias: Premium vs Lifetime (Otorgado Gratis)

| Característica | Premium (Gratis) | Lifetime (Gratis) |
|----------------|------------------|-------------------|
| Duración | 12 meses | Para siempre |
| `expiryDate` | Fecha futura | `"never"` |
| `transactionId` | `admin-granted-...` | `admin-granted-...` |
| `paymentMethod` | `admin-gift` | `admin-gift` |

### Permisos Requeridos

El email `admin@luminom.com` debe:
- ✅ Estar registrado en Firebase Authentication
- ✅ Tener documento en Firestore `users/{userId}`
- ✅ Firestore rules deben permitir lectura de todos los usuarios

### Firestore Rules Necesarias

```javascript
match /users/{userId} {
  // Admin puede leer todos los usuarios
  allow read: if request.auth.token.email == 'admin@luminom.com' 
              || request.auth.uid == userId;
  
  // Admin puede actualizar cualquier usuario
  allow update: if request.auth.token.email == 'admin@luminom.com' 
                || request.auth.uid == userId;
}
```

---

## ✅ Checklist de Primera Vez

- [ ] Crear cuenta con email `admin@luminom.com`
- [ ] Iniciar sesión como admin
- [ ] Ir a `admin.html`
- [ ] Verificar que ves las 4 tarjetas de estadísticas
- [ ] Verificar que ves tabla de usuarios
- [ ] Crear una cuenta de prueba normal
- [ ] Darle Premium gratis a esa cuenta de prueba
- [ ] Iniciar sesión con esa cuenta y verificar badge Premium
- [ ] Quitar premium a la cuenta de prueba
- [ ] Verificar que vuelve a plan Gratis

---

## 🎉 ¡Todo Listo!

Ahora puedes:
- ✅ Ver todos tus usuarios
- ✅ Dar premium gratis para promociones
- ✅ Gestionar suscripciones manualmente
- ✅ Monitorear estadísticas en tiempo real

**URL del Panel:** https://srdaniontop-netizen.github.io/luminam-ia/admin.html

**Email de Admin:** admin@luminom.com

---

**¿Dudas?** Contacto: ialuminom@gmail.com
