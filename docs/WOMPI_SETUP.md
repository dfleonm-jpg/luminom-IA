# 💳 Guía: Pagos con Wompi (Pasarela Colombiana)

## ¿Qué es Wompi?

**Wompi** es la pasarela de pagos #1 en Colombia, ideal para Luminom IA porque:

✅ **100% Colombiano** - Acepta PSE, Nequi, Daviplata  
✅ **Fácil de integrar** - Solo frontend, sin backend  
✅ **Comisiones bajas** - 2.99% + $900 COP por transacción  
✅ **Sin mensualidad** - Solo pagas por transacción  
✅ **Modo de prueba gratis** - Para probar sin dinero real  

---

## 📝 Paso 1: Crear Cuenta en Wompi

### 1.1 Registro

1. Ve a: **https://comercios.wompi.co/register**
2. Llena el formulario:
   - Nombre completo
   - Email
   - Teléfono
   - Contraseña
3. Verifica tu email
4. **IMPORTANTE**: Guarda tu cédula a mano, la pedirán

### 1.2 Completar Información del Negocio

1. Inicia sesión en: **https://comercios.wompi.co/**
2. Completa el perfil:
   - Nombre del negocio: `Luminom IA`
   - Tipo: `Software/Educación`
   - NIT o Cédula
   - Dirección
   - Cuenta bancaria (para recibir pagos)

---

## 🔑 Paso 2: Obtener API Keys

### 2.1 Keys de Prueba (Para Testing)

1. Ve a **Configuración → Integraciones**
2. Copia la **Public Key de Prueba**:
   ```
   pub_test_XXXXXXXXXXXXXXXXXXXXX
   ```
3. Esta key YA está configurada en `servicios.html`

### 2.2 Keys de Producción (Para Pagos Reales)

1. Completa el proceso de verificación de Wompi:
   - Subir cédula
   - Verificar cuenta bancaria
   - Esperar aprobación (1-2 días)

2. Una vez aprobado, copia la **Public Key de Producción**:
   ```
   pub_prod_XXXXXXXXXXXXXXXXXXXXX
   ```

3. **Reemplaza** en `servicios.html` línea ~213:
   ```javascript
   publicKey: 'pub_prod_TU_KEY_AQUI', // ← Pega tu key de producción
   ```

---

## 💰 Paso 3: Configurar Precios

### Precio Actual: $14,900 COP/mes

En `servicios.html` línea ~215:
```javascript
amountInCents: 1490000, // $14,900 COP (en centavos)
```

### Para cambiar el precio:

```javascript
// $19,900 COP
amountInCents: 1990000,

// $9,900 COP
amountInCents: 990000,

// $29,900 COP
amountInCents: 2990000,
```

**Importante:** Wompi trabaja en centavos, así que multiplica el precio por 100.

---

## 🧪 Paso 4: Probar Pagos (Modo Prueba)

### Tarjetas de Prueba de Wompi:

| Tarjeta | Número | CVV | Resultado |
|---------|--------|-----|-----------|
| Visa exitosa | `4242 4242 4242 4242` | `123` | ✅ Aprobada |
| Mastercard exitosa | `5555 5555 5555 4444` | `123` | ✅ Aprobada |
| Visa rechazada | `4000 0000 0000 0002` | `123` | ❌ Rechazada |

### Cómo Probar:

1. Abre tu sitio: `https://TU_USUARIO.github.io/luminam-ia/servicios.html`
2. Haz clic en **"Suscribirme Ahora"** (plan Premium)
3. Usa una tarjeta de prueba
4. Fecha: Cualquier mes/año futuro
5. CVV: `123`
6. Email: Tu email real
7. Haz clic en **"Pagar"**

Si todo funciona, serás redirigido a `payment-success.html` 🎉

---

## ✅ Paso 5: Activar Pagos Reales

### 5.1 Verificación de Wompi

Wompi necesita verificar tu identidad:

1. **Documento de identidad** (cédula o NIT)
2. **Cuenta bancaria** (para recibir dinero)
3. **Información fiscal** (RUT si aplica)

**Tiempo de aprobación:** 1-3 días hábiles

### 5.2 Cambiar a Producción

Una vez aprobado:

1. En `servicios.html` línea ~213, cambia:
   ```javascript
   publicKey: 'pub_prod_TU_KEY_REAL', // ← Tu key de producción
   ```

2. Cambia la línea ~217:
   ```javascript
   redirectUrl: window.location.origin + '/luminam-ia/payment-success.html'
   // Asegúrate de que la URL sea correcta
   ```

3. Sube los cambios a GitHub:
   ```bash
   git add servicios.html
   git commit -m "Activate production payments"
   git push origin main
   ```

---

## 💸 Comisiones y Costos

### Plan Sin Mensualidad (Recomendado)

- **Comisión por transacción:** 2.99% + $900 COP
- **Sin costo mensual**
- **Sin mínimo de ventas**

### Ejemplo con plan Premium ($14,900):

```
Precio de venta: $14,900 COP
Comisión Wompi: $445 COP (2.99%) + $900 COP = $1,345 COP
Tú recibes: $13,555 COP (91%)
```

### Costos por Método de Pago:

| Método | Comisión Extra |
|--------|----------------|
| Tarjeta crédito/débito | Incluida |
| PSE | +$500 COP |
| Nequi | +$300 COP |
| Daviplata | +$300 COP |

---

## 🔒 Seguridad

### ¿Es seguro Wompi?

✅ **Certificado PCI-DSS** (máxima seguridad)  
✅ **Encriptación SSL** en todas las transacciones  
✅ **Tokens únicos** por transacción  
✅ **Nunca guardamos tarjetas** (Wompi lo hace)  

### Protección contra Fraude:

Wompi incluye:
- Verificación 3D Secure automática
- Detección de fraude con IA
- Límites de transacciones
- Reversión automática de pagos sospechosos

---

## 📊 Recibir Dinero

### Cuándo recibes el dinero:

- **Transferencia automática** cada 2-3 días hábiles
- **A tu cuenta bancaria** registrada
- **Sin costo de transferencia**

### Ver tus Ventas:

1. Ve a **https://comercios.wompi.co/**
2. Dashboard → Transacciones
3. Filtrar por fecha, estado, método

---

## 🎯 Suscripciones Recurrentes

### ¿Wompi soporta suscripciones?

❌ **NO directamente**, pero hay 2 opciones:

### Opción 1: Manual (Simple)
- El usuario paga cada mes manualmente
- Recibes email cuando expira
- Envías recordatorio por email

### Opción 2: Con Backend (Avanzado)
- Usas Wompi + Stripe Billing o Paddle
- Cobros automáticos cada mes
- Requiere backend (Node.js, etc.)

**Recomendación:** Empieza con la Opción 1 (simple).

---

## 🚨 Solución de Problemas

### Error: "Public key inválida"
- ❌ Estás usando key de prueba en producción
- ✅ Cambia a `pub_prod_...`

### Error: "Transaction declined"
- ❌ Tarjeta sin fondos o bloqueada
- ✅ Pide al usuario que use otra tarjeta

### El botón no hace nada
- ❌ Script de Wompi no cargó
- ✅ Verifica que `<script src="https://checkout.wompi.co/widget.js">` esté al final de `servicios.html`

### No recibo el dinero
- ❌ Cuenta bancaria no verificada
- ✅ Ve a Wompi → Configuración → Cuenta Bancaria

---

## 🔄 Alternativas a Wompi

Si Wompi no funciona para ti:

### 1. **PayU** (Colombiano)
- Comisión: 3.49% + $900
- Más caro pero más conocido

### 2. **Stripe** (Internacional)
- Comisión: 3.95% + $300
- Requiere cuenta en USD
- Ideal si quieres vender internacionalmente

### 3. **Mercado Pago** (Latinoamérica)
- Comisión: 4.99%
- Popular pero más caro

---

## 📞 Soporte Wompi

¿Problemas con Wompi?

- 📧 **Email:** soporte@wompi.co
- 💬 **Chat:** https://comercios.wompi.co/ (esquina inferior derecha)
- 📱 **Teléfono:** +57 (1) 580 9030
- 📚 **Docs:** https://docs.wompi.co/

---

## ✅ Checklist Final

Antes de lanzar pagos reales:

- [ ] Cuenta de Wompi verificada
- [ ] Public key de producción configurada
- [ ] Cuenta bancaria conectada
- [ ] Probado con tarjetas de prueba
- [ ] Email de confirmación configurado
- [ ] Página de éxito (`payment-success.html`) funciona
- [ ] Política de reembolsos definida
- [ ] Términos y condiciones listos

---

## 🎉 ¡Listo para Cobrar!

Con Wompi configurado, puedes:

✅ Cobrar plan Premium ($14,900/mes)  
✅ Aceptar PSE, Nequi, Daviplata, tarjetas  
✅ Recibir dinero en 2-3 días  
✅ Sin mensualidad, solo por transacción  
✅ Totalmente seguro y confiable  

---

**Actualizado:** 17 de Junio, 2026  
**Versión:** 5.0 - Sistema de Pagos con Wompi
