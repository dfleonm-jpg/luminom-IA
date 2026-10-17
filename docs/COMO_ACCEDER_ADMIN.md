# 🔐 Cómo Acceder al Panel de Administración

## Acceso Directo

Simplemente ve a:

**https://srdaniontop-netizen.github.io/luminam-ia/admin.html**

---

## Características del Panel Admin

El panel de administración muestra:

### 📊 **Estadísticas en Tiempo Real**
- **Total de usuarios**: Cantidad de usuarios registrados
- **Usuarios activos hoy**: Sesiones iniciadas hoy
- **Conversaciones totales**: Número total de chats realizados
- **Preguntas respondidas**: Total de respuestas generadas por la IA

### 👥 **Lista de Usuarios**
Tabla con información de todos los usuarios registrados:
- Nombre completo
- Email
- Carrera
- Fecha de registro
- Última actividad

### 📈 **Gráficos y Análisis**
- Distribución de carreras
- Actividad por día
- Materias más consultadas
- Tasa de retención

---

## ⚙️ Datos Demo

Actualmente, el panel muestra datos **simulados/demo** porque:
- El sistema usa localStorage (almacenamiento local del navegador)
- No hay backend real ni base de datos
- Los datos solo existen en el navegador de cada usuario

### Para ver datos reales:

1. **Regístrate** en `login.html`
2. **Crea conversaciones** en `tutor.html`
3. Luego verás tus datos en `admin.html`

---

## 🔒 Seguridad del Panel

### Actualmente (Demo):
- ❌ **NO** tiene autenticación
- ❌ **NO** valida si eres administrador
- ✅ Es solo una **interfaz visual** con datos de ejemplo

### Para Producción (Implementación Real):

Deberías agregar:

```javascript
// Verificar si es admin
const Auth = {
  isAdmin() {
    const session = this.getSession();
    return session && session.email === 'admin@luminom.com';
  },
  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }
};

// Al inicio del admin.html
if (!Auth.requireAdmin()) {
  document.body.innerHTML = 'Acceso denegado';
}
```

---

## 💡 Mejoras Sugeridas

### 1. **Backend Real**
- Implementar servidor (Node.js, Python, etc.)
- Base de datos (MongoDB, PostgreSQL)
- API REST para gestionar datos

### 2. **Autenticación Admin**
- Crear cuenta de administrador especial
- Verificar rol antes de mostrar panel
- Encriptar datos sensibles

### 3. **Funcionalidades Adicionales**
- **Exportar datos** a CSV/Excel
- **Filtrar usuarios** por fecha, carrera, actividad
- **Banear usuarios** problemáticos
- **Ver conversaciones** completas de usuarios
- **Estadísticas avanzadas** con gráficos
- **Notificaciones** de nuevos registros
- **Logs de actividad** del sistema

### 4. **Seguridad**
- **HTTPS** obligatorio
- **JWT** para autenticación
- **Rate limiting** para prevenir abuso
- **Logs de acceso** al panel admin
- **Permisos granulares** (admin, moderador, viewer)

---

## 📝 Estructura Actual

```
luminam-ia/
├── index.html          → Página principal
├── login.html          → Login/Registro
├── tutor.html          → Chat con IA (requiere login)
├── admin.html          → Panel admin (abierto, demo)
├── servicios.html      → Planes y precios
└── README.md          → Documentación
```

---

## 🚀 Próximos Pasos

1. **Crear cuenta de prueba**
   - Ve a `login.html?tab=register`
   - Regístrate con tu email

2. **Usar el tutor**
   - Configura tu API Key de Groq
   - Haz algunas preguntas

3. **Ver el panel admin**
   - Abre `admin.html`
   - Verás tus datos (solo demo por ahora)

---

## 🔑 Credenciales Admin (Futuro)

Cuando implementes autenticación real:

```
Email: admin@luminom.com
Password: [tu contraseña segura]
```

---

## 📧 Contacto

¿Necesitas ayuda implementando el backend?

- GitHub: [@srdaniontop-netizen](https://github.com/srdaniontop-netizen)
- Repo: [luminam-ia](https://github.com/srdaniontop-netizen/luminam-ia/issues)

---

**Nota**: Este es un proyecto demo/educativo. Para producción, implementa un backend completo con autenticación, base de datos y seguridad robusta.
