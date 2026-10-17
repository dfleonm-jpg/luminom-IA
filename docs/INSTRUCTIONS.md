# 🚀 Instrucciones Rápidas - Luminom IA

## Para USUARIOS (Estudiantes)

### 1️⃣ Obtén tu API Key GRATIS

1. Ve a **https://console.groq.com**
2. Haz clic en **Sign Up** (registrarse)
3. Completa tu email y contraseña
4. Ve a la sección **API Keys** en el menú lateral
5. Haz clic en **Create API Key**
6. Dale un nombre (ejemplo: "Luminom IA")
7. Haz clic en **Submit**
8. **Copia la key** (empieza con `gsk_...`)

⚠️ **IMPORTANTE**: Guarda esta key en un lugar seguro. Solo se muestra una vez.

### 2️⃣ Usa el Tutor

1. Ve a: **https://srdaniontop-netizen.github.io/luminam-ia/**
2. Haz clic en **"Empezar Gratis"**
3. Cuando aparezca el popup, **pega tu API Key**
4. Haz clic en **OK**
5. ¡Empieza a hacer preguntas! 🎉

### 3️⃣ Cambiar o Actualizar tu API Key

Si necesitas cambiar tu API Key:

1. En el tutor, haz clic en el botón **"🔑 API Key"**
2. Confirma que quieres cambiarla
3. Pega tu nueva key
4. ¡Listo!

---

## Para DESARROLLADORES (Deployment)

### Opción 1: GitHub Pages (Recomendado)

1. **Fork este repositorio** en tu cuenta de GitHub
2. Ve a **Settings** → **Pages**
3. En **Source**, selecciona:
   - Branch: `main`
   - Folder: `/root`
4. Haz clic en **Save**
5. Espera 1-2 minutos
6. Tu sitio estará en: `https://TU-USUARIO.github.io/luminam-ia/`

### Opción 2: Vercel

```bash
# Instala Vercel CLI
npm i -g vercel

# Deploy
cd luminam-ia
vercel
```

### Opción 3: Netlify

1. Arrastra la carpeta del proyecto a [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. ¡Listo!

---

## ❓ Preguntas Frecuentes

### ¿Es realmente gratis?

**Sí**. Groq ofrece un plan gratuito con:
- 14,400 requests por día
- 30 requests por minuto
- Acceso al modelo Llama 3.3 70B

No necesitas tarjeta de crédito.

### ¿Por qué necesito una API Key?

Porque la IA corre en servidores de Groq (no nuestros). La key:
- Te da tu propia cuota de uso
- Evita abuso del servicio
- Es **gratis** de obtener

### ¿Es segura mi API Key?

**Sí**. Tu key se guarda **solo en tu navegador** (localStorage):
- ❌ NO se envía a nuestros servidores (no tenemos)
- ❌ NO se guarda en GitHub
- ✅ Solo se usa para llamadas directas a Groq
- ✅ Puedes borrarla cuando quieras

### ¿Puedo usar esto sin API Key?

No directamente. Necesitas una key para acceder a la IA.

**Alternativas**:
1. Obtén una key gratis en Groq (2 minutos)
2. Si eres desarrollador, puedes modificar el código para usar otra IA

### ¿Funciona en móviles?

**Sí**, el diseño es 100% responsive. Funciona en:
- 📱 Celulares (iOS/Android)
- 💻 Tablets
- 🖥️ Computadores

### ¿Qué pasa si excedo los límites?

El plan gratuito de Groq es muy generoso (14,400 req/día). Si lo excedes:
- Recibirás un error 429
- Espera 24 horas y se restablece
- O considera el plan de pago de Groq (muy barato)

---

## 🔧 Personalización Rápida

### Cambiar Colores

Edita `tutor.html` (o cualquier HTML), busca `:root`:

```css
:root {
  --primary: #6366F1;    /* Color principal */
  --secondary: #8B5CF6;  /* Color secundario */
  --accent: #EC4899;     /* Color de acento */
}
```

### Cambiar Modelo de IA

En `tutor.html`, línea ~406:

```javascript
model: 'llama-3.3-70b-versatile'  // Cambia esto
```

Opciones:
- `llama-3.3-70b-versatile` - Más inteligente (recomendado)
- `llama-3.1-8b-instant` - Más rápido
- `mixtral-8x7b-32768` - Balance

### Cambiar Nombre del Tutor

En `tutor.html`, busca `systemPrompt`:

```javascript
const systemPrompt = `Eres [TU NOMBRE], un tutor...`;
```

---

## 🆘 Soporte

¿Tienes problemas?

1. **Revisa las FAQ** arriba
2. **Abre un Issue**: [GitHub Issues](https://github.com/srdaniontop-netizen/luminam-ia/issues)
3. **Contacta**: Deja un comentario en el repo

---

## 📜 Licencia

MIT - Usa libremente, modifica, distribuye

---

**¡Disfruta aprendiendo con IA! 🚀**
