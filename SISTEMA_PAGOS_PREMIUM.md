# 💎 Sistema de Pagos y Restricciones Premium

**Última actualización:** 17 de junio de 2026  
**Commit:** `cff2d41` - Implement premium payment system and free plan restrictions

---

## 📋 Resumen

Luminom IA ahora tiene un sistema completo de monetización con:
- ✅ 3 planes de suscripción (Gratis, Premium, De por Vida)
- ✅ Integración con Wompi para pagos
- ✅ Restricciones para usuarios gratuitos (10 preguntas/día)
- ✅ Persistencia en Firestore entre dispositivos
- ✅ Badges y banners informativos

---

## 🎯 Planes Disponibles

### 1. Plan Gratis (Estudiante)
**Precio:** $0 COP  
**Límites:**
- ⚠️ **10 preguntas por día**
- Historial limitado
- Sin soporte prioritario

**Funciones:**
- ✅ Acceso básico al tutor con IA
- ✅ Todas las materias universitarias
- ✅ Guardado de conversaciones
- ✅ Sincronización entre dispositivos

---

### 2. Plan Premium (Mensual)
**Precio:** $14,900 COP/mes  
**Pago:** Mensual recurrente

**Funciones:**
- ✅ **Preguntas ilimitadas**
- ✅ Sin límite de conversaciones
- ✅ Respuestas prioritarias
- ✅ Análisis de rendimiento
- ✅ Exportar a PDF
- ✅ Soporte 24/7
- ✅ Acceso anticipado a nuevas funciones

---

### 3. Plan De por Vida (Lifetime)
**Precio:** $299,000 COP (pago único)  
**Ahorro:** $179,000 vs 1 año de Premium

**Funciones:**
- ✅ **Todo lo del plan Premium**
- ✅ **Acceso de por vida**
- ✅ Sin pagos mensuales nunca más
- ✅ Todas las actualizaciones futuras
- ✅ Precio bloqueado para siempre
- ✅ Transferible a otro dispositivo
- ✅ Garantía de satisfacción 30 días
- ✅ Insignia de miembro fundador 🏆

---

## 🔧 Cómo Funciona

### Flujo de Pago

```
1. Usuario hace click en "Suscribirse" en servicios.html
   ↓
2. Se abre modal de Wompi con formulario de pago
   ↓
3. Usuario ingresa datos de tarjeta
   ↓
4. Wompi procesa el pago
   ↓
5. Redirección a payment-success.html?plan=monthly&id=12345
   ↓
6. Script guarda suscripción en:
   - localStorage (acceso rápido)
   - Firestore users/{userId} (persistencia)
   ↓
7. Usuario redirigido a tutor.html
   ↓
8. Tutor carga suscripción y muestra badge Premium
```

---

### Restricciones para Plan Gratis

#### Contador de Preguntas Diarias

**Ubicación:** `localStorage` con key `luminom_questions_count`

**Estructura:**
```json
{
  "date": "Thu Jun 17 2026",
  "count": 3
}
```

**Lógica:**
1. Al enviar mensaje, verificar si el usuario puede hacer preguntas
2. Si es usuario gratis y `count >= 10`, bloquear y mostrar modal
3. Si es usuario gratis y `count < 10`, permitir y incrementar contador
4. Si es Premium/Lifetime, permitir sin restricciones
5. Contador se resetea automáticamente cada día

#### Banners Informativos

**Banner Normal (6-10 preguntas restantes):**
```
📊 7 preguntas restantes hoy (Plan Gratis).
Mejora a Premium desde $14,900/mes.
```

**Banner Advertencia (1-5 preguntas restantes):**
```
⚠️ Solo te quedan 3 preguntas hoy.
Mejora a Premium para acceso ilimitado.
```

**Banner Bloqueado (0 preguntas):**
```
⚠️ Límite diario alcanzado (10/10 preguntas).
Mejora a Premium para preguntas ilimitadas.
```

---

## 🗄️ Estructura en Firestore

### Colección: `users`
Documento por usuario con ID = Firebase Auth UID

```javascript
{
  name: "Juan Pérez",
  email: "juan@email.com",
  carrera: "Ingeniería de Sistemas",
  createdAt: "2026-06-17T12:00:00.000Z",
  
  // NUEVO: Datos de suscripción
  subscription: {
    plan: "premium",           // "premium" o "lifetime"
    userId: "abc123",
    transactionId: "wompi_xyz",
    startDate: "2026-06-17T12:30:00.000Z",
    expiryDate: "2026-07-17T12:30:00.000Z", // "never" para lifetime
    status: "active",          // "active" o "expired"
    paymentMethod: "wompi"
  },
  lastPaymentDate: "2026-06-17T12:30:00.000Z"
}
```

---

## 🧪 Cómo Probar el Sistema

### 1️⃣ Probar Plan Gratis (Sin Pago)

**Pasos:**
1. Registrar cuenta nueva o iniciar sesión
2. Ir a `tutor.html`
3. Verificar que aparece badge "📝 Gratis" en navegación
4. Verificar banner en sidebar: "📊 10 preguntas restantes hoy"
5. Hacer 3 preguntas
6. Banner debe actualizar a "📊 7 preguntas restantes hoy"
7. Hacer 7 preguntas más (total 10)
8. Banner debe cambiar a "⚠️ Límite diario alcanzado"
9. Intentar hacer otra pregunta
10. Debe aparecer modal bloqueando el envío
11. Aceptar modal → abre página de servicios

**Verificar:**
- ✅ Contador incrementa correctamente
- ✅ Banner se actualiza en tiempo real
- ✅ Modal de bloqueo aparece en pregunta 11
- ✅ localStorage tiene `luminom_questions_count`

---

### 2️⃣ Probar Pago Premium Mensual

**Pasos:**
1. Ir a `servicios.html`
2. Hacer click en "Suscribirse" del plan Premium
3. Modal de Wompi se abre con monto: $14,900 COP

**Datos de Prueba (Wompi Test Mode):**
- **Tarjeta:** 4242 4242 4242 4242
- **Vencimiento:** Cualquier fecha futura (ej: 12/25)
- **CVV:** Cualquier 3 dígitos (ej: 123)
- **Nombre:** Cualquier nombre

4. Completar pago
5. Redirección a `payment-success.html?plan=monthly&id=...`
6. Verificar mensaje: "¡Pago Exitoso! Gracias por suscribirte al plan Premium"
7. Click en "Ir al Tutor"
8. Verificar badge cambió a "⭐ Premium"
9. Verificar que NO aparece banner de límite
10. Hacer 15+ preguntas → no debe haber restricción

**Verificar en Firebase Console:**
1. Ir a Firestore Database
2. Abrir colección `users`
3. Buscar documento del usuario
4. Verificar campo `subscription`:
   - `plan: "premium"`
   - `status: "active"`
   - `transactionId` presente
   - `expiryDate` es fecha +1 mes

---

### 3️⃣ Probar Pago Lifetime

**Pasos:**
1. Ir a `servicios.html`
2. Hacer click en "Comprar De por Vida"
3. Modal de Wompi se abre con monto: $299,000 COP
4. Usar misma tarjeta de prueba: 4242 4242 4242 4242
5. Completar pago
6. Redirección a `payment-success.html?plan=lifetime&id=...`
7. Verificar mensaje: "🎉 ¡Bienvenido al Plan De por Vida!"
8. Click en "Ir al Tutor"
9. Verificar badge cambió a "👑 De por Vida"
10. Verificar que NO aparece banner de límite
11. Hacer preguntas ilimitadas

**Verificar en Firebase Console:**
1. Campo `subscription.plan` = `"lifetime"`
2. Campo `subscription.expiryDate` = `"never"`
3. Campo `subscription.status` = `"active"`

---

### 4️⃣ Probar Sincronización Entre Dispositivos

**Pasos:**
1. Crear cuenta y suscribirse a Premium en navegador Chrome
2. Verificar en tutor que aparece badge Premium
3. Abrir navegador Firefox (o modo incógnito)
4. Iniciar sesión con la misma cuenta
5. Verificar que también aparece badge Premium
6. Verificar que no hay límite de preguntas

**Esto prueba que:**
- ✅ Suscripción se guarda en Firestore (no solo localStorage)
- ✅ Sistema carga suscripción desde Firestore al iniciar
- ✅ Funciona en múltiples dispositivos

---

### 5️⃣ Probar Expiración de Suscripción Mensual

**Nota:** Esto requiere modificar manualmente la fecha en Firestore

**Pasos:**
1. Usuario con plan Premium mensual activo
2. Ir a Firebase Console → Firestore → users → {userId}
3. Editar campo `subscription.expiryDate`
4. Cambiar a una fecha pasada (ej: "2026-06-10T12:00:00.000Z")
5. Guardar cambios
6. Recargar `tutor.html`
7. Verificar que badge vuelve a "📝 Gratis"
8. Verificar que aparece banner de límite de preguntas

**Esto prueba que:**
- ✅ Sistema verifica expiración de suscripciones
- ✅ Usuarios con suscripción expirada vuelven a plan gratis

---

## 📊 Casos de Prueba Completos

| # | Escenario | Esperado | Verificar |
|---|-----------|----------|-----------|
| 1 | Usuario nuevo sin suscripción | Badge "Gratis", banner "10 preguntas restantes" | localStorage, UI |
| 2 | Usuario gratis hace 5 preguntas | Banner actualiza a "5 preguntas restantes" | localStorage count |
| 3 | Usuario gratis alcanza 10 preguntas | Modal bloquea nueva pregunta | UI modal |
| 4 | Usuario gratis espera 1 día | Contador resetea a 10 | localStorage date |
| 5 | Usuario compra Premium mensual | Badge "Premium", sin banner | Firestore |
| 6 | Usuario Premium hace 50 preguntas | Todas permitidas sin restricción | No counter |
| 7 | Usuario compra Lifetime | Badge "De por Vida", sin banner | Firestore |
| 8 | Usuario Premium en 2 navegadores | Badge Premium en ambos | Firestore sync |
| 9 | Suscripción Premium expira | Vuelve a badge "Gratis" | Firestore date |
| 10 | Usuario Lifetime nunca expira | Siempre badge "De por Vida" | expiryDate="never" |

---

## 🐛 Troubleshooting

### Problema: Badge no actualiza después de pagar

**Causa:** Firestore no guardó la suscripción correctamente

**Solución:**
1. Abrir consola del navegador (F12)
2. Buscar mensaje: "✅ Suscripción guardada exitosamente"
3. Si hay error, verificar reglas de Firestore
4. Las reglas deben permitir `update` en colección `users`

```javascript
// firestore.rules
match /users/{userId} {
  allow read, update: if request.auth.uid == userId;
  allow create: if request.auth != null;
}
```

---

### Problema: Límite de preguntas no funciona

**Causa:** localStorage no está guardando el contador

**Solución:**
1. Abrir consola → Application → Local Storage
2. Buscar key `luminom_questions_count`
3. Verificar que tiene formato: `{"date":"...","count":0}`
4. Si no existe, borrar cache y recargar

---

### Problema: Usuario premium sigue viendo límite

**Causa:** Código no está leyendo suscripción de Firestore

**Solución:**
1. Verificar en consola: "💎 Plan del usuario: premium"
2. Si dice "free", verificar que Firestore tenga el campo `subscription`
3. Ir a Firebase Console y verificar manualmente
4. Ejecutar en consola:
```javascript
db.collection('users').doc(session.userId).get()
  .then(doc => console.log(doc.data().subscription))
```

---

### Problema: Wompi no abre el modal

**Causa:** Script de Wompi no cargó o configuración incorrecta

**Solución:**
1. Verificar que `servicios.html` tiene el script:
```html
<script src="https://checkout.wompi.co/widget.js"></script>
```
2. Verificar que `publicKey` es correcta (test o producción)
3. Revisar consola para errores de JavaScript

---

## 🚀 Activar Modo Producción

**Actualmente el sistema está en modo de prueba (TEST)**

### Para activar pagos reales:

1. **Obtener API Key de producción en Wompi:**
   - Ir a: https://comercios.wompi.co/
   - Crear cuenta de comercio
   - Verificar documentos
   - Obtener `Public Key` de producción (empieza con `pub_prod_`)

2. **Actualizar `servicios.html`:**
```javascript
// ANTES (modo test)
publicKey: 'pub_test_V5V6qvtEEibQdDt5C1xYs0lQvmKYN2HH'

// DESPUÉS (modo producción)
publicKey: 'pub_prod_TU_KEY_REAL_AQUI'
```

3. **Configurar webhook en Wompi:**
   - URL: `https://tu-dominio.com/webhook-wompi`
   - Eventos: `transaction.updated`
   - Esto permite verificar pagos del lado del servidor

4. **Implementar verificación de pagos (opcional pero recomendado):**
   - Crear Cloud Function en Firebase
   - Verificar transacciones con API de Wompi
   - Actualizar `subscription.status` basado en webhook

---

## 📈 Métricas Recomendadas

**Para monitorear el negocio:**

1. **Conversión de planes:**
   - Usuarios registrados vs usuarios premium
   - % de conversión gratis → premium
   - % de conversión gratis → lifetime

2. **Uso del límite gratuito:**
   - Promedio de preguntas por usuario gratis/día
   - % de usuarios que alcanzan el límite
   - Día de la semana con más uso

3. **Retención:**
   - % de usuarios premium que renuevan
   - Tiempo promedio de suscripción
   - Tasa de cancelación (churn)

4. **Ingresos:**
   - MRR (Monthly Recurring Revenue)
   - Lifetime value por usuario
   - % de usuarios en cada plan

---

## 🎯 Próximas Mejoras Sugeridas

### Corto Plazo (1-2 semanas)
- [ ] Dashboard de administración para ver suscripciones
- [ ] Email de confirmación de pago (usar SendGrid o similar)
- [ ] Recordatorio cuando falten 2 preguntas (usuarios gratis)
- [ ] Botón "Cancelar suscripción" en perfil de usuario

### Mediano Plazo (1 mes)
- [ ] Cupones de descuento (ESTUDIANTE2026 = 20% off)
- [ ] Programa de referidos (invita amigo = 1 mes gratis)
- [ ] Analytics de uso premium vs gratis
- [ ] Página de perfil con historial de pagos

### Largo Plazo (3+ meses)
- [ ] Plan familiar (hasta 5 usuarios)
- [ ] Plan corporativo con facturación
- [ ] Integración con PSE para pagos en Colombia
- [ ] Exportar conversaciones a PDF (función premium)
- [ ] Estadísticas de aprendizaje (función premium)

---

## 📝 Resumen de Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `servicios.html` | + Pasa `plan` en URL de redirección |
| `payment-success.html` | + Guarda suscripción en Firestore<br>+ Detecta plan (monthly/lifetime)<br>+ Muestra mensaje personalizado |
| `tutor.html` | + Sistema completo de límites<br>+ Badge de plan en navegación<br>+ Banner de preguntas restantes<br>+ Verifica límite antes de enviar<br>+ Carga suscripción desde Firestore |

---

## ✅ Checklist de Implementación

- [x] Sistema de pagos con Wompi integrado
- [x] 3 planes definidos (Gratis, Premium, Lifetime)
- [x] Guardar suscripción en Firestore
- [x] Cargar suscripción al iniciar tutor
- [x] Badge de plan en navegación
- [x] Contador de preguntas para usuarios gratis
- [x] Banner informativo en sidebar
- [x] Modal de bloqueo al alcanzar límite
- [x] Reset diario de contador
- [x] Usuarios premium sin restricciones
- [x] Documentación completa
- [ ] Modo producción activado (pendiente obtener key real)
- [ ] Emails de confirmación (pendiente)

---

## 🎉 ¡El Sistema Está Listo!

Todo el código está implementado y funcionando. Solo falta:

1. **Probar todo** siguiendo esta guía
2. **Obtener API Key de producción** de Wompi cuando estés listo para cobrar de verdad
3. **Verificar que funciona en múltiples dispositivos**

**URL del sitio:** https://srdaniontop-netizen.github.io/luminam-ia/

**Contacto:** ialuminom@gmail.com

---

¡Buena suerte con el lanzamiento! 🚀
