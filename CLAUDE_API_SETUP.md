# 🤖 Obtener API Key de Claude (Anthropic)

Guía para obtener tu API Key de Claude para usar en Luminom IA.

---

## 🎯 ¿Qué es Claude?

**Claude** es el modelo de IA desarrollado por Anthropic que usará Luminom IA como cerebro del tutor. Es similar a ChatGPT pero optimizado para conversaciones más largas y tareas educativas.

---

## 💰 Precios (Actualizado 2026)

### **Claude Sonnet 4** (que usa Luminom IA)
- **Input**: ~$3 por millón de tokens
- **Output**: ~$15 por millón de tokens

### **¿Cuánto cuesta en la práctica?**

Para darte una idea:
- **1 conversación típica**: ~2,000 tokens = $0.03 USD
- **100 conversaciones**: ~$3 USD
- **1,000 conversaciones**: ~$30 USD

**💡 Tip**: Con $10 USD puedes hacer ~330 conversaciones completas.

---

## 📋 Paso a Paso para Obtener tu API Key

### **1. Crear Cuenta en Anthropic**

1. Ve a: https://console.anthropic.com/
2. Click en **"Sign Up"** (Registrarse)
3. Opciones de registro:
   - Con Google (más rápido)
   - Con email y contraseña
4. Completa el registro y verifica tu email

---

### **2. Acceder a la Consola**

1. Inicia sesión en: https://console.anthropic.com/
2. Verás el dashboard principal

---

### **3. Agregar Créditos**

⚠️ **IMPORTANTE**: Anthropic requiere que agregues créditos antes de poder usar la API.

1. En el dashboard, busca **"Credits"** o **"Billing"** en el menú
2. Click en **"Add Credits"** o **"Purchase Credits"**
3. Opciones de créditos:
   - Mínimo: $5 USD (recomendado para empezar)
   - Sugerido para pruebas: $10 USD
   - Para producción inicial: $50 USD
4. Ingresa tus datos de pago (tarjeta de crédito)
5. Completa la compra

**💳 Formas de pago aceptadas**:
- Tarjetas de crédito (Visa, MasterCard, Amex)
- Tarjetas de débito internacionales

---

### **4. Crear una API Key**

1. En el menú lateral, busca **"API Keys"**
2. Click en **"Create Key"** o **"+ Create Key"**
3. Configura:
   - **Name**: `luminom-ia-production` (o el nombre que prefieras)
   - **Permissions**: Full access (es la opción por defecto)
4. Click en **"Create"**
5. **⚠️ MUY IMPORTANTE**: Copia la API Key AHORA
   - Se mostrará una sola vez
   - Formato: `sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - Guárdala en un lugar seguro (no la compartas)

**Ejemplo de API Key**:
```
sk-ant-api03-1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqrstuv
```

---

### **5. Guardar tu API Key**

#### **Para desarrollo local**:

En tu archivo `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-tu-clave-completa-aqui
```

#### **Para Vercel**:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   ```
   Key: ANTHROPIC_API_KEY
   Value: sk-ant-api03-tu-clave-completa-aqui
   ```
4. Guarda y redeploy

---

## ✅ Verificar que Funciona

### **Opción 1: Desde tu app local**

1. Configura tu `.env` con la API Key
2. Ejecuta:
   ```bash
   cd backend
   npm run dev
   ```
3. Ve a http://localhost:5000
4. Regístrate e intenta chatear con el tutor
5. Si responde, ¡funciona! 🎉

### **Opción 2: Prueba directa con curl**

```bash
curl https://api.anthropic.com/v1/messages \
  -H "content-type: application/json" \
  -H "x-api-key: TU_API_KEY_AQUI" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 100,
    "messages": [
      {"role": "user", "content": "Hola, ¿cómo estás?"}
    ]
  }'
```

Si recibes una respuesta JSON con texto de Claude, ¡funciona!

---

## 📊 Monitorear Uso y Créditos

### **Ver Créditos Restantes**

1. Ve a https://console.anthropic.com/
2. En el dashboard verás:
   - **Credits Remaining**: Créditos disponibles
   - **Credits Used**: Créditos consumidos
   - **Recent Usage**: Uso reciente

### **Ver Uso Detallado**

1. Click en **"Usage"** en el menú
2. Verás gráficas con:
   - Tokens consumidos por día
   - Costo por request
   - Modelos más usados
   - Errores

### **Configurar Alertas**

1. Ve a **"Settings"** → **"Notifications"**
2. Configura alertas para:
   - Cuando llegues al 50% de tus créditos
   - Cuando llegues al 80% de tus créditos
   - Cuando llegues al 90% de tus créditos

---

## 💡 Tips para Ahorrar Créditos

### **1. Optimiza el Prompt del Sistema**

El prompt del sistema se envía en cada request. Mantenlo conciso pero efectivo. Ya está optimizado en `backend/utils/prompts.js`.

### **2. Limita el Historial de Contexto**

Luminom IA está configurado para enviar solo los últimos 20 mensajes de contexto. Esto es suficiente para conversaciones coherentes sin gastar demasiado.

### **3. Configura max_tokens Apropiadamente**

En `backend/config/anthropic.js`:
```javascript
export const AI_CONFIG = {
  model: 'claude-sonnet-4-20250514',
  maxTokens: 2000, // Ajusta según necesites
  temperature: 0.7,
};
```

- **1000 tokens**: ~750 palabras (respuestas cortas)
- **2000 tokens**: ~1500 palabras (respuestas medias) ← **Configuración actual**
- **4000 tokens**: ~3000 palabras (respuestas largas)

### **4. Cachea Respuestas Comunes (Avanzado)**

Para preguntas muy frecuentes, considera guardar respuestas en la base de datos.

---

## 🔒 Seguridad de tu API Key

### **✅ Buenas Prácticas**

- ✅ **NUNCA** subas tu API Key a GitHub
- ✅ **SIEMPRE** usa variables de entorno
- ✅ Agrega `.env` al `.gitignore` (ya incluido)
- ✅ Rota tu API Key cada 3-6 meses
- ✅ Usa diferentes keys para desarrollo y producción
- ✅ Monitorea el uso regularmente

### **❌ Nunca Hagas Esto**

- ❌ No pongas la API Key directamente en el código
- ❌ No la compartas por email o chat
- ❌ No la subas a repositorios públicos
- ❌ No la uses en el frontend (solo en backend)

### **🚨 Si tu API Key se Expone**

1. Ve inmediatamente a https://console.anthropic.com/
2. **API Keys** → Encuentra tu key
3. Click en el botón de **"Revoke"** (Revocar)
4. Crea una nueva API Key
5. Actualiza tu `.env` y variables de Vercel
6. Redeploy tu app

---

## 🆘 Solución de Problemas

### **Error: "Invalid API Key"**

**Causa**: API Key incorrecta o mal formateada

**Solución**:
- Verifica que copiaste la key completa
- Asegúrate de que empiece con `sk-ant-api03-`
- Verifica que no tenga espacios al inicio o final
- Crea una nueva key si es necesario

### **Error: "Insufficient credits"**

**Causa**: Te quedaste sin créditos

**Solución**:
- Ve a la consola de Anthropic
- Agrega más créditos en "Billing"
- Espera 1-2 minutos y reintenta

### **Error: "Rate limit exceeded"**

**Causa**: Demasiadas peticiones en poco tiempo

**Solución**:
- Anthropic tiene límites de:
  - Tier gratuito: 50 requests/minuto
  - Con créditos: 1,000+ requests/minuto
- Espera 60 segundos y reintenta
- Considera implementar retry logic con backoff

### **Error: "Model not found"**

**Causa**: El modelo especificado no existe

**Solución**:
- Verifica que uses un modelo válido:
  - `claude-sonnet-4-20250514` ← Actual en Luminom IA
  - `claude-3-5-sonnet-20240620`
  - `claude-3-opus-20240229`
- Ve a la documentación para ver modelos disponibles

---

## 📈 Planes y Límites

### **Tier con Créditos** (Actual)
- **Rate Limit**: 1,000 requests/minuto
- **Context Window**: 200,000 tokens
- **Max Output**: 8,192 tokens
- **Precio**: Pay-as-you-go

### **Enterprise** (Contactar ventas)
- Rate limits personalizados
- Soporte prioritario
- SLA garantizado
- Facturación mensual

---

## 🔄 Agregar Más Créditos

### **Manualmente**

1. https://console.anthropic.com/
2. Click en **"Credits"** o **"Billing"**
3. **"Add Credits"**
4. Selecciona el monto
5. Completa el pago

### **Auto-Recarga (Recomendado para Producción)**

1. En la configuración de Billing
2. Activa **"Auto-recharge"**
3. Configura:
   - Límite mínimo: $10 (cuando llegue aquí, recarga)
   - Monto de recarga: $50
   - Límite máximo: $500/mes (para prevenir gastos inesperados)

---

## 📚 Recursos Adicionales

- **Documentación Oficial**: https://docs.anthropic.com/
- **Referencia de la API**: https://docs.anthropic.com/claude/reference/
- **Modelos Disponibles**: https://docs.anthropic.com/claude/docs/models-overview
- **Changelog**: https://docs.anthropic.com/claude/changelog
- **Discord de Anthropic**: https://discord.gg/anthropic (comunidad)

---

## ✅ Checklist Final

- [ ] Cuenta creada en Anthropic
- [ ] Email verificado
- [ ] Créditos agregados ($5+ USD)
- [ ] API Key creada
- [ ] API Key guardada de forma segura
- [ ] API Key agregada al `.env` local
- [ ] API Key agregada a Vercel (si aplica)
- [ ] Probada localmente con éxito
- [ ] Alertas de créditos configuradas
- [ ] Uso monitoreado regularmente

---

## 🎉 ¡Listo!

Tu API Key de Claude está configurada y lista para:
- ✅ Responder preguntas de estudiantes
- ✅ Generar explicaciones personalizadas
- ✅ Resolver ejercicios paso a paso
- ✅ Adaptarse al nivel de cada estudiante
- ✅ Mantener contexto de conversaciones

**¡Luminom IA está listo para enseñar! 🤖🎓**
