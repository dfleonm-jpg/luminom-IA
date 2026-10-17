# 🔑 Información sobre tu API Key de Groq

## Cómo obtener tu API Key

Para usar Luminom IA, necesitas tu propia API Key gratuita de Groq:

1. Ve a [https://console.groq.com](https://console.groq.com)
2. Crea una cuenta (gratis, sin tarjeta)
3. Ve a **API Keys** → **Create API Key**
4. Copia tu key (empieza con `gsk_...`)

**IMPORTANTE**: Guarda tu key en un lugar seguro. Solo se muestra una vez.

---

## ¿Qué hacer si no funciona?

Si aparece el error **"Invalid API Key"**, sigue estos pasos:

### Opción 1: Verifica tu key actual

1. Ve a [https://console.groq.com/keys](https://console.groq.com/keys)
2. Inicia sesión con tu cuenta
3. Verifica que la key de arriba aparece en tu lista
4. Si no aparece, significa que fue eliminada o expiró

### Opción 2: Genera una nueva key

1. Ve a [https://console.groq.com/keys](https://console.groq.com/keys)
2. Haz clic en **"Create API Key"**
3. Dale un nombre (ejemplo: "Luminom IA")
4. Haz clic en **"Submit"**
5. **Copia la nueva key** (empieza con `gsk_`)
6. En tu tutor, haz clic en **"🔑 API KEY"** y pégala

---

## Límites del Plan Gratuito

Tu plan gratuito de Groq incluye:

- ✅ **14,400 requests por día**
- ✅ **30 requests por minuto**
- ✅ **Modelo Llama 3.3 70B** (muy potente)
- ✅ **Sin tarjeta de crédito requerida**

Si excedes estos límites:
- Recibirás un error 429 (Rate Limit)
- Espera 1 minuto o 24 horas según el límite
- O considera el plan de pago de Groq (muy barato)

---

## Solución de Problemas Comunes

### Error: "Invalid API Key"

**Causa**: La key es incorrecta, expiró o fue eliminada.

**Solución**:
1. Verifica que la copiaste completa (empieza con `gsk_`)
2. Genera una nueva en console.groq.com
3. Actualízala en el tutor (botón 🔑)

### Error: "Rate Limit Exceeded"

**Causa**: Hiciste demasiadas preguntas en poco tiempo.

**Solución**:
- Espera 1 minuto (límite por minuto)
- O espera 24 horas (límite diario)

### Error: "Failed to fetch"

**Causa**: Problemas de conexión o Groq está saturado.

**Solución**:
- Verifica tu internet
- Espera 10-30 segundos
- Recarga la página

---

## Cómo usar tu key en la app

Hay dos maneras:

### Método 1: Popup automático (Recomendado)

1. Ve a [https://srdaniontop-netizen.github.io/luminam-ia/tutor.html](https://srdaniontop-netizen.github.io/luminam-ia/tutor.html)
2. Aparecerá un popup pidiendo la key
3. Pega tu key
4. Haz clic en **"GUARDAR"**
5. ¡Listo! Ya puedes usar el tutor

### Método 2: Botón manual

1. Haz clic en **"🔑 API KEY"** en la esquina superior
2. Confirma que quieres cambiarla
3. Pega tu key
4. Haz clic en **"GUARDAR"**

---

## Seguridad de tu Key

### ¿Dónde se guarda?

Tu API Key se guarda **solo en tu navegador** usando `localStorage`:

- ❌ **NO** se envía a nuestros servidores (no tenemos servidor)
- ❌ **NO** está en GitHub (fue eliminada del código)
- ✅ Solo se usa para llamadas directas a Groq API
- ✅ Puedes borrarla cuando quieras

### ¿Es segura esta forma?

**Sí**, para una app de frontend estática es la mejor opción:

- No hay servidor que hackear
- Nadie más tiene acceso a tu navegador
- Puedes borrar tu key en cualquier momento

### ¿Puedo compartir mi key?

**NO**. Si compartes tu key:
- Otros pueden usar tu cuota de requests
- Podrías exceder los límites del plan gratuito
- Violarías los términos de servicio de Groq

---

## Crear cuenta en Groq (Paso a Paso)

Si aún no tienes cuenta:

1. Ve a [https://console.groq.com](https://console.groq.com)
2. Haz clic en **"Sign Up"**
3. Ingresa tu email y contraseña
4. Verifica tu email
5. Inicia sesión
6. Ve a **"API Keys"** en el menú lateral
7. Haz clic en **"Create API Key"**
8. Copia tu key (empieza con `gsk_`)
9. ¡Listo! Ya tienes tu key gratuita

**Tiempo estimado**: 2-3 minutos

---

## Alternativas si Groq no funciona

Si por alguna razón Groq no te funciona, puedes modificar el código para usar:

### Hugging Face (Gratis)

```javascript
const API_CONFIG = {
  url: 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct',
  key: 'TU_HF_API_KEY',
  model: ''
};
```

### OpenAI (De pago)

```javascript
const API_CONFIG = {
  url: 'https://api.openai.com/v1/chat/completions',
  key: 'TU_OPENAI_API_KEY',
  model: 'gpt-4'
};
```

---

## Contacto y Soporte

Si tienes problemas:

1. Revisa esta guía primero
2. Abre un [Issue en GitHub](https://github.com/srdaniontop-netizen/luminam-ia/issues)
3. Incluye el mensaje de error completo
4. **NUNCA** compartas tu API Key en el issue

---

**¡Disfruta usando Luminom IA! 🚀**
