# 🚀 Guía de Despliegue - Luminom IA

Esta guía te ayudará a desplegar **Luminom IA** en producción.

---

## 📋 Opciones de Despliegue

1. **Heroku** (Recomendado para principiantes)
2. **Railway** (Fácil y moderno)
3. **Render** (Tier gratuito generoso)
4. **DigitalOcean** (VPS profesional)
5. **AWS EC2** (Escalable y robusto)

---

## 🎯 Opción 1: Heroku (Recomendado)

### Requisitos Previos
- Cuenta en Heroku (gratis)
- Heroku CLI instalado
- MongoDB Atlas configurado

### Paso 1: Instalar Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Windows
# Descarga desde: https://devcenter.heroku.com/articles/heroku-cli

# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh
```

### Paso 2: Login en Heroku

```bash
heroku login
```

### Paso 3: Crear Aplicación

```bash
cd luminam-ia
heroku create luminom-ia  # Cambia el nombre si ya existe
```

### Paso 4: Configurar Variables de Entorno

```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="tu_connection_string_de_atlas"
heroku config:set JWT_SECRET="tu_jwt_secret_seguro"
heroku config:set ANTHROPIC_API_KEY="tu_clave_de_claude"
heroku config:set ADMIN_EMAIL="admin@luminom.ia"
heroku config:set ADMIN_PASSWORD="TuPasswordSeguro123!"
heroku config:set PORT=5000
```

### Paso 5: Crear Procfile

```bash
echo "web: node backend/server.js" > Procfile
```

### Paso 6: Deploy

```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main  # o master según tu rama
```

### Paso 7: Abrir App

```bash
heroku open
```

### Verificar Logs

```bash
heroku logs --tail
```

---

## 🚂 Opción 2: Railway

### Paso 1: Crear Cuenta

Ve a https://railway.app y crea una cuenta con GitHub.

### Paso 2: Conectar Repositorio

1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Autoriza Railway para acceder a tus repos
4. Selecciona `luminam-ia`

### Paso 3: Configurar Variables

En la pestaña "Variables":

```
NODE_ENV=production
MONGODB_URI=tu_connection_string
JWT_SECRET=tu_jwt_secret
ANTHROPIC_API_KEY=tu_clave_claude
ADMIN_EMAIL=admin@luminom.ia
ADMIN_PASSWORD=TuPasswordSeguro!
PORT=5000
```

### Paso 4: Configurar Start Command

En Settings > Deploy:
```
Start Command: cd backend && npm start
```

### Paso 5: Deploy

Railway despliega automáticamente. Espera a que termine.

### Paso 6: Obtener URL

Railway te dará una URL como: `https://luminom-ia.up.railway.app`

---

## 🎨 Opción 3: Render

### Paso 1: Crear Cuenta

Ve a https://render.com y crea una cuenta.

### Paso 2: Nuevo Web Service

1. Click en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub

### Paso 3: Configurar

```
Name: luminom-ia
Environment: Node
Region: US (o el más cercano)
Branch: main
Build Command: cd backend && npm install
Start Command: cd backend && npm start
Instance Type: Free (o el que prefieras)
```

### Paso 4: Variables de Entorno

Agrega en "Environment":

```
NODE_ENV=production
MONGODB_URI=tu_connection_string
JWT_SECRET=tu_jwt_secret
ANTHROPIC_API_KEY=tu_clave_claude
ADMIN_EMAIL=admin@luminom.ia
ADMIN_PASSWORD=TuPasswordSeguro!
PORT=5000
```

### Paso 5: Deploy

Click en "Create Web Service". Render empezará el deploy automáticamente.

---

## 🖥️ Opción 4: DigitalOcean (VPS)

### Paso 1: Crear Droplet

1. Crea cuenta en DigitalOcean
2. Crea un Droplet Ubuntu 22.04 LTS
3. Elige el plan ($6/mes es suficiente)
4. Selecciona tu región

### Paso 2: Conectar por SSH

```bash
ssh root@tu_ip_del_droplet
```

### Paso 3: Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y git
```

### Paso 4: Instalar PM2

```bash
sudo npm install -g pm2
```

### Paso 5: Clonar Repositorio

```bash
cd /var/www
git clone https://github.com/tu-usuario/luminam-ia.git
cd luminam-ia/backend
npm install --production
```

### Paso 6: Configurar Variables

```bash
nano .env
```

Pega tus variables de producción.

### Paso 7: Iniciar con PM2

```bash
pm2 start server.js --name luminom-ia
pm2 save
pm2 startup
```

### Paso 8: Configurar Nginx

```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/luminom-ia
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/luminom-ia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Paso 9: SSL con Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

---

## 🔒 Checklist de Seguridad Pre-Producción

Antes de desplegar, verifica:

- [ ] `NODE_ENV=production` en variables de entorno
- [ ] `JWT_SECRET` único y seguro (64+ caracteres random)
- [ ] Contraseña de admin cambiada
- [ ] MongoDB con autenticación activada
- [ ] MongoDB solo acepta conexiones de tu servidor
- [ ] CORS configurado con tu dominio específico
- [ ] Rate limiting activado
- [ ] Helmet configurado
- [ ] Variables sensibles en `.env`, nunca en código
- [ ] `.env` en `.gitignore`
- [ ] HTTPS configurado (SSL/TLS)
- [ ] Logs estructurados activados
- [ ] Backup de MongoDB configurado

---

## 📊 Post-Despliegue

### Monitoreo

#### Heroku
```bash
heroku logs --tail --app luminom-ia
```

#### PM2 (VPS)
```bash
pm2 logs luminom-ia
pm2 monit
```

### Métricas Importantes

- ✅ Tiempo de respuesta del servidor
- ✅ Tasa de errores 500
- ✅ Uso de memoria
- ✅ Uso de CPU
- ✅ Conexiones activas a MongoDB
- ✅ Rate limit hits
- ✅ Tokens consumidos de Claude API

### Herramientas Recomendadas

- **Logging**: [Logtail](https://logtail.com/) o [Papertrail](https://papertrailapp.com/)
- **Monitoreo**: [UptimeRobot](https://uptimerobot.com/) o [Pingdom](https://www.pingdom.com/)
- **APM**: [New Relic](https://newrelic.com/) o [Datadog](https://www.datadoghq.com/)
- **Error Tracking**: [Sentry](https://sentry.io/)

---

## 🔄 Actualizar en Producción

### Heroku
```bash
git add .
git commit -m "Update: descripción del cambio"
git push heroku main
```

### Railway/Render
Solo haz push a GitHub:
```bash
git push origin main
```
Se desplegará automáticamente.

### VPS con PM2
```bash
ssh root@tu_ip
cd /var/www/luminam-ia
git pull origin main
cd backend
npm install --production
pm2 restart luminom-ia
```

---

## 🗄️ Backup de MongoDB

### MongoDB Atlas (Automático)

Atlas hace backups automáticos. Configura:

1. Ve a tu cluster
2. Click en "Backup"
3. Activa "Continuous Cloud Backup"
4. Configura retención (7 días recomendado)

### Backup Manual

```bash
# Backup
mongodump --uri="tu_mongodb_uri" --out=./backup-$(date +%Y%m%d)

# Restore
mongorestore --uri="tu_mongodb_uri" ./backup-20260617
```

---

## 🌐 Configurar Dominio Personalizado

### En Heroku
```bash
heroku domains:add www.luminom.ia
```

En tu proveedor de DNS:
```
CNAME www luminom-ia.herokuapp.com
```

### En Railway/Render

1. Ve a Settings > Domains
2. Click en "Add Custom Domain"
3. Sigue las instrucciones de DNS

---

## 📈 Escalar la Aplicación

### Vertical (más recursos)

**Heroku**:
```bash
heroku ps:scale web=1:standard-2x
```

**DigitalOcean**:
- Resize Droplet desde el panel

### Horizontal (más instancias)

**Heroku**:
```bash
heroku ps:scale web=3
```

**Railway**:
- Configurar auto-scaling en el dashboard

---

## 🐛 Solución de Problemas en Producción

### Error: "Application Error"

**Causa**: Crash del servidor

**Solución**:
```bash
heroku logs --tail  # Ver logs
heroku restart      # Reiniciar
```

### Error: "Cannot connect to MongoDB"

**Causa**: MongoDB no accesible

**Solución**:
- Verifica IP whitelist en Atlas
- Verifica connection string
- Chequea credenciales

### Error: "Rate limit exceeded" (Claude)

**Causa**: Sin créditos en Anthropic

**Solución**:
- Ve a console.anthropic.com
- Agrega más créditos

---

## ✅ Checklist Final

Antes de considerar el deploy completo:

- [ ] App funciona en producción
- [ ] Admin puede acceder al panel
- [ ] Usuarios pueden registrarse
- [ ] Chat con IA funciona correctamente
- [ ] HTTPS está activado
- [ ] Dominio personalizado configurado (opcional)
- [ ] Backups de MongoDB activos
- [ ] Monitoreo configurado
- [ ] Logs accesibles
- [ ] Documentación actualizada
- [ ] README tiene URL de producción

---

## 🎉 ¡Listo!

Tu aplicación **Luminom IA** está en producción y lista para recibir estudiantes.

### Próximos Pasos

1. ✅ Compartir con usuarios beta
2. ✅ Recoger feedback
3. ✅ Iterar y mejorar
4. ✅ Escalar según demanda

---

## 📞 Soporte

¿Problemas con el deploy?

- 📖 Revisa los [logs](#monitoreo)
- 🐛 Abre un issue en GitHub
- 💬 Contacta: soporte@luminom.ia

---

**¡Feliz deploy! 🚀**
