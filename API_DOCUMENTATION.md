# 📡 Documentación de la API - Luminom IA

Esta documentación describe todos los endpoints de la API REST de Luminom IA.

**Base URL**: `http://localhost:5000/api`

---

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Endpoints de Auth](#endpoints-de-auth)
- [Endpoints de Chat](#endpoints-de-chat)
- [Endpoints de Admin](#endpoints-de-admin)
- [Códigos de Estado](#códigos-de-estado)
- [Manejo de Errores](#manejo-de-errores)

---

## 🔐 Autenticación

Luminom IA usa **JWT (JSON Web Tokens)** para la autenticación.

### Obtener un Token

1. Regístrate o inicia sesión usando los endpoints `/auth/register` o `/auth/login`
2. El servidor responderá con un token JWT
3. Incluye este token en el header `Authorization` de tus peticiones

### Formato del Header

```
Authorization: Bearer <tu_token_jwt>
```

### Ejemplo en JavaScript

```javascript
fetch('http://localhost:5000/api/chat/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ message: '¿Qué es una derivada?' })
})
```

---

## 🔑 Endpoints de Auth

### 1. Registrar Usuario

Crea una nueva cuenta de estudiante.

**Endpoint**: `POST /api/auth/register`  
**Autenticación**: No requerida  
**Rate Limit**: 100 requests / 15 min

#### Request Body

```json
{
  "name": "María García",
  "email": "maria@universidad.edu.co",
  "password": "miPassword123",
  "carrera": "Ingeniería de Sistemas"
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Cuenta creada exitosamente. ¡Bienvenido a Luminom IA!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f3a",
      "name": "María García",
      "email": "maria@universidad.edu.co",
      "carrera": "Ingeniería de Sistemas",
      "role": "student"
    }
  }
}
```

#### Errores Posibles

- `400`: Email ya registrado
- `400`: Errores de validación (campos faltantes o inválidos)

---

### 2. Iniciar Sesión

Autentica un usuario existente.

**Endpoint**: `POST /api/auth/login`  
**Autenticación**: No requerida  
**Rate Limit**: 100 requests / 15 min

#### Request Body

```json
{
  "email": "maria@universidad.edu.co",
  "password": "miPassword123"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "¡Bienvenido de nuevo, María!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f3a",
      "name": "María García",
      "email": "maria@universidad.edu.co",
      "carrera": "Ingeniería de Sistemas",
      "role": "student",
      "conversationCount": 5,
      "messageCount": 120
    }
  }
}
```

#### Errores Posibles

- `401`: Correo o contraseña incorrectos
- `403`: Cuenta desactivada

---

### 3. Obtener Perfil Actual

Obtiene la información del usuario autenticado.

**Endpoint**: `GET /api/auth/me`  
**Autenticación**: Requerida  

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f3a",
      "name": "María García",
      "email": "maria@universidad.edu.co",
      "carrera": "Ingeniería de Sistemas",
      "role": "student",
      "conversationCount": 5,
      "messageCount": 120,
      "createdAt": "2026-01-15T10:30:00.000Z",
      "lastLogin": "2026-06-17T08:45:00.000Z"
    }
  }
}
```

#### Errores Posibles

- `401`: Token inválido o expirado

---

### 4. Actualizar Perfil

Actualiza el nombre o carrera del usuario.

**Endpoint**: `PUT /api/auth/me`  
**Autenticación**: Requerida  

#### Request Body

```json
{
  "name": "María García López",
  "carrera": "Ingeniería de Software"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Perfil actualizado correctamente.",
  "data": {
    "user": {
      "id": "60d5ec49f1b2c72b8c8e4f3a",
      "name": "María García López",
      "email": "maria@universidad.edu.co",
      "carrera": "Ingeniería de Software",
      "role": "student"
    }
  }
}
```

---

## 💬 Endpoints de Chat

### 1. Enviar Mensaje al Tutor IA

Envía un mensaje y recibe una respuesta del tutor inteligente.

**Endpoint**: `POST /api/chat/message`  
**Autenticación**: Requerida  

#### Request Body

```json
{
  "message": "¿Puedes explicarme qué es una derivada con un ejemplo?",
  "conversationId": null  // null para crear nueva conversación
}
```

O para continuar una conversación existente:

```json
{
  "message": "¿Y cómo se calcula?",
  "conversationId": "60d5ec49f1b2c72b8c8e4f3b"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "60d5ec49f1b2c72b8c8e4f3b",
      "title": "¿Puedes explicarme qué es una derivada...",
      "subject": "Matemáticas"
    },
    "userMessage": {
      "id": "60d5ec49f1b2c72b8c8e4f3c",
      "content": "¿Puedes explicarme qué es una derivada con un ejemplo?",
      "createdAt": "2026-06-17T10:30:00.000Z"
    },
    "assistantMessage": {
      "id": "60d5ec49f1b2c72b8c8e4f3d",
      "content": "¡Claro, María! La derivada mide la **tasa de cambio instantánea** de una función...",
      "createdAt": "2026-06-17T10:30:02.000Z"
    },
    "metadata": {
      "processingTime": 1850,
      "tokens": 450,
      "model": "claude-sonnet-4-20250514"
    }
  }
}
```

#### Errores Posibles

- `400`: Mensaje vacío o muy largo
- `404`: Conversación no encontrada
- `500`: Error con la API de Claude

---

### 2. Obtener Conversaciones

Lista todas las conversaciones del usuario.

**Endpoint**: `GET /api/chat/conversations`  
**Autenticación**: Requerida  

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4f3b",
        "title": "¿Puedes explicarme qué es una derivada...",
        "subject": "Matemáticas",
        "messageCount": 12,
        "lastMessageAt": "2026-06-17T10:45:00.000Z",
        "createdAt": "2026-06-17T10:30:00.000Z"
      },
      {
        "_id": "60d5ec49f1b2c72b8c8e4f3e",
        "title": "¿Cómo funciona la herencia en POO?",
        "subject": "Programación",
        "messageCount": 8,
        "lastMessageAt": "2026-06-16T15:20:00.000Z",
        "createdAt": "2026-06-16T15:00:00.000Z"
      }
    ],
    "total": 2
  }
}
```

---

### 3. Obtener Mensajes de una Conversación

Obtiene todos los mensajes de una conversación específica.

**Endpoint**: `GET /api/chat/conversations/:id/messages`  
**Autenticación**: Requerida  

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "60d5ec49f1b2c72b8c8e4f3b",
      "title": "¿Puedes explicarme qué es una derivada...",
      "subject": "Matemáticas",
      "messageCount": 4,
      "createdAt": "2026-06-17T10:30:00.000Z"
    },
    "messages": [
      {
        "_id": "60d5ec49f1b2c72b8c8e4f3c",
        "role": "user",
        "content": "¿Puedes explicarme qué es una derivada?",
        "createdAt": "2026-06-17T10:30:00.000Z"
      },
      {
        "_id": "60d5ec49f1b2c72b8c8e4f3d",
        "role": "assistant",
        "content": "¡Claro! La derivada mide...",
        "createdAt": "2026-06-17T10:30:02.000Z",
        "tokens": 450
      }
    ]
  }
}
```

---

### 4. Crear Nueva Conversación

Crea una conversación vacía (opcional - se puede crear automáticamente al enviar el primer mensaje).

**Endpoint**: `POST /api/chat/conversations`  
**Autenticación**: Requerida  

#### Response (201 Created)

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "60d5ec49f1b2c72b8c8e4f3f",
      "title": "Nueva conversación",
      "createdAt": "2026-06-17T11:00:00.000Z"
    }
  }
}
```

---

### 5. Eliminar Conversación

Elimina (soft delete) una conversación.

**Endpoint**: `DELETE /api/chat/conversations/:id`  
**Autenticación**: Requerida  

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Conversación eliminada correctamente."
}
```

---

## 👑 Endpoints de Admin

**Nota**: Todos estos endpoints requieren rol de `admin`.

### 1. Obtener Estadísticas del Dashboard

**Endpoint**: `GET /api/admin/stats`  
**Autenticación**: Requerida (Admin)  

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 150,
      "activeUsers": 142,
      "totalConversations": 450,
      "totalMessages": 3500,
      "newUsersLastWeek": 25,
      "messagesLastWeek": 680,
      "avgMessagesPerConversation": 8
    },
    "topUsers": [...],
    "popularSubjects": [...],
    "dailyActivity": [...]
  }
}
```

---

### 2. Listar Usuarios

**Endpoint**: `GET /api/admin/users`  
**Autenticación**: Requerida (Admin)  
**Query Params**: `page`, `limit`, `search`, `role`

#### Ejemplo

```
GET /api/admin/users?page=1&limit=20&search=maria&role=student
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "total": 150,
      "page": 1,
      "pages": 8
    }
  }
}
```

---

### 3. Obtener Detalles de Usuario

**Endpoint**: `GET /api/admin/users/:id`  
**Autenticación**: Requerida (Admin)  

---

### 4. Activar/Desactivar Usuario

**Endpoint**: `PUT /api/admin/users/:id/toggle-status`  
**Autenticación**: Requerida (Admin)  

---

### 5. Eliminar Usuario

**Endpoint**: `DELETE /api/admin/users/:id`  
**Autenticación**: Requerida (Admin)  

---

## 📊 Códigos de Estado

| Código | Significado |
|--------|-------------|
| 200 | OK - Petición exitosa |
| 201 | Created - Recurso creado exitosamente |
| 400 | Bad Request - Error en los datos enviados |
| 401 | Unauthorized - No autenticado o token inválido |
| 403 | Forbidden - No tienes permisos |
| 404 | Not Found - Recurso no encontrado |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

---

## ⚠️ Manejo de Errores

Todas las respuestas de error siguen este formato:

```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [  // Opcional, para errores de validación
    {
      "field": "email",
      "message": "El correo no es válido"
    }
  ],
  "error": "Stack trace del error"  // Solo en development
}
```

---

## 🔄 Rate Limiting

- **Ventana**: 15 minutos
- **Límite**: 100 peticiones por IP
- **Headers de respuesta**:
  - `X-RateLimit-Limit`: Límite total
  - `X-RateLimit-Remaining`: Peticiones restantes
  - `X-RateLimit-Reset`: Timestamp de reset

---

## 📝 Notas Adicionales

### Tokens JWT

- **Expiración**: 30 días
- **Renovación**: Automática al hacer login
- **Almacenamiento**: LocalStorage (frontend)

### Prompts Personalizados

El sistema construye prompts personalizados automáticamente basándose en:
- Nombre del estudiante
- Carrera universitaria
- Historial de la conversación
- Contexto colombiano

### Límites

- **Mensaje máximo**: 5,000 caracteres
- **Historial de contexto**: Últimos 20 mensajes
- **Tokens por respuesta**: 2,000 (configurable)

---

**¿Necesitas más información?** Consulta el [README.md](README.md) completo del proyecto.
