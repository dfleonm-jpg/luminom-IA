# 📥 Guía de Instalación Detallada - Luminom IA

Esta guía te llevará paso a paso para instalar y configurar **Luminom IA** en tu máquina local.

---

## 📋 Índice

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Instalación de Dependencias](#instalación-de-dependencias)
3. [Configuración de MongoDB](#configuración-de-mongodb)
4. [Obtener API Key de Claude](#obtener-api-key-de-claude)
5. [Configuración del Proyecto](#configuración-del-proyecto)
6. [Ejecutar el Proyecto](#ejecutar-el-proyecto)
7. [Verificación](#verificación)
8. [Solución de Problemas](#solución-de-problemas)

---

## 1️⃣ Requisitos del Sistema

### Software Necesario

- **Node.js**: versión 16.x o superior
- **npm**: versión 8.x o superior (viene con Node.js)
- **MongoDB**: versión 5.x o superior
- **Git**: para clonar el repositorio
- **Editor de código**: VS Code recomendado

### Verificar Instalaciones

```bash
# Verificar Node.js
node --version
# Debe mostrar v16.x.x o superior

# Verificar npm
npm --version
# Debe mostrar 8.x.x o superior

# Verificar MongoDB (si usas local)
mongod --version
# Debe mostrar db version v5.x.x o superior

# Verificar Git
git --version
```

---

## 2️⃣ Instalación de Dependencias

### Instalar Node.js (si no lo tienes)

#### Windows
1. Descarga desde: https://nodejs.org/
2. Instala la versión LTS (Long Term Support)
3. Reinicia tu terminal

#### macOS
```bash
# Usando Homebrew
brew install node
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Instalar MongoDB

#### Opción 1: MongoDB Local

**Windows**:
1. Descarga desde: https://www.mongodb.com/try/download/community
2. Instala el paquete
3. Inicia MongoDB desde Services

**macOS**:
```bash
brew tap mongodb/brew
brew install mongodb-community@5.0
brew services start mongodb-community@5.0
```

**Linux (Ubuntu/Debian)**:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Opción 2: MongoDB Atlas (Cloud - Recomendado)

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo cluster (tier gratuito disponible)
4. Configura acceso de red (0.0.0.0/0 para desarrollo)
5. Crea un usuario de base de datos
6. Obtén tu connection string

---

## 3️⃣ Obtener API Key de Claude

### Paso a paso:

1. **Crear cuenta en Anthropic**
   - Ve a: https://console.anthropic.com/
   - Haz clic en "Sign Up"
   - Completa el registro

2. **Obtener API Key**
   - Una vez dentro, ve a "API Keys"
   - Haz clic en "Create Key"
   - Copia la clave (solo se muestra una vez)
   - Guárdala en un lugar seguro

3. **Agregar créditos** (si es necesario)
   - Claude requiere créditos para funcionar
   - Ve a "Billing" y agrega créditos
   - $5 USD es suficiente para empezar

---

## 4️⃣ Configuración del Proyecto

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/luminam-ia.git
cd luminam-ia
```

### Paso 2: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

Esto instalará:
- Express
- Mongoose
- Anthropic SDK
- JWT y bcrypt
- Helmet, CORS
- Y más...

### Paso 3: Crear el Archivo .env

```bash
# Desde la carpeta raíz del proyecto
cp .env.example .env
```

### Paso 4: Editar el Archivo .env

Abre el archivo `.env` con tu editor favorito y configura:

```env
# Puerto del servidor (puedes dejarlo en 5000)
PORT=5000

# Base de datos MongoDB
# OPCIÓN A: MongoDB Local
MONGODB_URI=mongodb://localhost:27017/luminom-ia

# OPCIÓN B: MongoDB Atlas (recomendado)
# Reemplaza con tu connection string
# MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/luminom-ia?retryWrites=true&w=majority

# JWT Secret - GENERA UNO ÚNICO
# Ejecuta: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Y pega el resultado aquí
JWT_SECRET=tu_clave_secreta_generada_aqui

# API Key de Anthropic Claude
# Pega la clave que obtuviste en el paso 3
ANTHROPIC_API_KEY=sk-ant-api03-tu-clave-de-claude-aqui

# Credenciales del administrador inicial
ADMIN_EMAIL=admin@luminom.ia
ADMIN_PASSWORD=Admin2026Luminom!

# Entorno
NODE_ENV=development

# URL del frontend (para CORS)
FRONTEND_URL=http://localhost:5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Paso 5: Generar JWT Secret Único

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado y pégalo en `JWT_SECRET` en tu `.env`.

---

## 5️⃣ Ejecutar el Proyecto

### Modo Desarrollo (con auto-reload)

```bash
cd backend
npm run dev
```

Verás algo como:

```
🚀 ════════════════════════════════════════════════════
   LUMINOM IA - Servidor Backend
   ════════════════════════════════════════════════════
   🌐 Servidor corriendo en puerto: 5000
   📦 Entorno: development
   🤖 IA: Claude API (Anthropic)
   🔐 Autenticación: JWT
   ════════════════════════════════════════════════════
```

### Modo Producción

```bash
cd backend
npm start
```

---

## 6️⃣ Verificación

### 1. Verificar que el servidor esté corriendo

Abre tu navegador y ve a: http://localhost:5000

Deberías ver la landing page de Luminom IA.

### 2. Verificar la API

Ve a: http://localhost:5000/api/health

Deberías ver:
```json
{
  "success": true,
  "message": "Luminom IA Backend está funcionando correctamente",
  "timestamp": "2026-06-17T...",
  "environment": "development"
}
```

### 3. Verificar MongoDB

Si el servidor inició sin errores de conexión, MongoDB está funcionando correctamente.

### 4. Crear tu primera cuenta

1. Ve a: http://localhost:5000/register.html
2. Completa el formulario de registro
3. Inicia sesión
4. Ve al tutor: http://localhost:5000/tutor.html
5. Haz tu primera pregunta al tutor IA

### 5. Acceder al Panel Admin

1. Ve a: http://localhost:5000/admin.html
2. Inicia sesión con las credenciales del admin:
   - Email: `admin@luminom.ia`
   - Password: `Admin2026Luminom!`
3. Explora las estadísticas

---

## 7️⃣ Solución de Problemas

### ❌ Error: "Cannot connect to MongoDB"

**Causa**: MongoDB no está corriendo o el connection string es incorrecto.

**Solución**:
```bash
# Si usas MongoDB local:
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Verifica el estado
sudo systemctl status mongod
```

Si usas MongoDB Atlas, verifica:
- ✅ Tu connection string está correcto
- ✅ Tu IP está en la whitelist (o usa 0.0.0.0/0)
- ✅ Tu usuario y contraseña son correctos

### ❌ Error: "ANTHROPIC_API_KEY is not defined"

**Causa**: No configuraste la API key de Claude.

**Solución**:
1. Verifica que tu archivo `.env` tenga `ANTHROPIC_API_KEY`
2. Verifica que la clave sea válida (empieza con `sk-ant-`)
3. Reinicia el servidor

### ❌ Error: "Port 5000 is already in use"

**Causa**: Otro proceso está usando el puerto 5000.

**Solución**:
```bash
# Opción 1: Cambia el puerto en .env
PORT=3000

# Opción 2: Encuentra y mata el proceso (Linux/macOS)
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID_NUMERO> /F
```

### ❌ Error: "Module not found"

**Causa**: No se instalaron las dependencias correctamente.

**Solución**:
```bash
cd backend
rm -rf node_modules
rm package-lock.json
npm install
```

### ❌ Error: "JWT malformed" o "Token inválido"

**Causa**: Token corrupto o expirado.

**Solución**:
- Cierra sesión
- Limpia el localStorage del navegador (F12 > Application > Local Storage > Clear)
- Vuelve a iniciar sesión

### ❌ El chat no responde

**Causa**: Problema con la API de Claude.

**Solución**:
1. Verifica tu API key
2. Verifica que tengas créditos en tu cuenta de Anthropic
3. Revisa la consola del navegador (F12) por errores
4. Revisa los logs del servidor

---

## 🎉 ¡Listo!

Si seguiste todos los pasos, **Luminom IA** debería estar funcionando perfectamente en tu máquina local.

### Próximos pasos:

1. ✅ Explora la aplicación
2. ✅ Crea algunas cuentas de prueba
3. ✅ Chatea con el tutor IA
4. ✅ Revisa el panel de admin
5. ✅ Lee el README.md completo para entender la arquitectura

---

## 📞 ¿Necesitas más ayuda?

Si sigues teniendo problemas:

1. 📖 Revisa el [README.md](README.md) completo
2. 🐛 Abre un issue en GitHub
3. 💬 Únete a nuestra comunidad de Discord
4. 📧 Escríbenos a: soporte@luminom.ia

---

**¡Feliz coding! 🚀**
