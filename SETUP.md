# 🚀 Configuración Rápida - Luminom IA

## ⚡ Obtener tu API Key GRATIS

### **Paso 1: Crear cuenta en Groq**

1. Ve a: https://console.groq.com/
2. Click en **"Sign Up"** (registrarse)
3. Usa tu cuenta de Google o GitHub (más rápido)

### **Paso 2: Obtener API Key**

1. Una vez dentro, ve a **"API Keys"** en el menú lateral
2. Click en **"Create API Key"**
3. Dale un nombre: `luminom-ia`
4. Click en **"Submit"**
5. **COPIA LA KEY** (empieza con `gsk_...`)

### **Paso 3: Configurar en el código**

1. Abre el archivo `tutor.html`
2. Busca la línea 275 (aproximadamente):
   ```javascript
   const API_CONFIG = {
     url: 'https://api.groq.com/openai/v1/chat/completions',
     key: 'gsk_' + 'REEMPLAZA_CON_TU_API_KEY', // ← AQUÍ
     model: 'llama-3.3-70b-versatile'
   };
   ```
3. Reemplaza `REEMPLAZA_CON_TU_API_KEY` con tu key (sin el `gsk_`)

   **Ejemplo:**
   ```javascript
   key: 'gsk_' + 'xyz123abc456def789...',  // Tu key real
   ```

### **Paso 4: ¡Listo!**

Guarda el archivo y tu tutor IA funcionará perfectamente.

---

## 📊 Límites de la API Gratuita

- **Requests por día**: 14,400 (más que suficiente)
- **Requests por minuto**: 30
- **Tokens por request**: 32,000
- **Costo**: $0 USD (completamente gratis)

---

## 🎯 API Alternativas Gratuitas

Si quieres probar otros modelos:

### **1. Hugging Face**
- URL: https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct
- Crea cuenta en: https://huggingface.co/
- Obtén token en: Settings → Access Tokens

### **2. Together AI**
- URL: https://api.together.xyz/v1/chat/completions
- Crea cuenta en: https://together.ai/
- $25 USD de créditos gratis al registrarte

---

## ⚠️ Importante

- **NO compartas** tu API key en públic
o
- **NO la subas** a GitHub
- Si se expone, revócala y crea una nueva

---

## 🆘 Problemas Comunes

### **"Failed to fetch"**
- Verifica que tu API key sea correcta
- Asegúrate de tener internet
- Revisa la consola del navegador (F12) para ver el error exacto

### **"Rate limit exceeded"**
- Estás haciendo demasiadas requests
- Espera 1 minuto y vuelve a intentar
- Con la API gratuita tienes 30 requests/minuto

### **"Invalid API key"**
- Tu API key está mal escrita o expiró
- Crea una nueva en console.groq.com
- Reemplázala en `tutor.html`

---

**¿Necesitas más ayuda? Abre un issue en GitHub** 🚀
