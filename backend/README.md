# Astra AI Tutor — Backend Node.js + Express + MongoDB

Backend de **Astra** reescrito en **Node.js + Express + MongoDB (Mongoose)**.
Mantiene **exactamente la misma API** (`/api/...`) que el backend Python/FastAPI,
así que el frontend (`frontend/`) funciona sin cambiar una sola línea.

## Requisitos

| Herramienta | Versión usada | Notas |
|---|---|---|
| Node.js | 24.x (mínimo 18) | `node -v` |
| npm | 11.x | `npm.cmd install` |
| MongoDB | 8.2.4 (Community) | Ver "Instalar MongoDB" |
| Ollama | opcional | IA local: `qwen2.5:7b` (texto) y `qwen2.5vl:3b` (visión) |

## Instalación rápida

```bash
cd backend
npm install
copy .env.example .env   # y ajusta MONGOD_PATH / MONGODB_URI si hace falta
npm start
```

El servidor arranca en **http://localhost:8000** (el proxy de Vite ya apunta ahí).

- Si **MongoDB no está corriendo**, el backend intenta arrancarlo solo usando `MONGOD_PATH`.
- Si la base está vacía, siembra automáticamente: 24 materias, 62 lecciones y 29 quizzes base
  (migrados desde `backend/app/tutor_content.py`).

Comprobación rápida:

```bash
npm test        # 7 pruebas del parser de JSON del modelo (rápidas, sin IA)
npm run smoke   # 25 pruebas de todos los endpoints
npm run test:ai # 10 endpoints de IA reales (lento: Ollama, varios minutos)
npm run reset   # borra la BD y deja solo el contenido base
```

## Instalar MongoDB Community (Windows, sin permisos de administrador)

1. Descarga el ZIP del servidor: <https://www.mongodb.com/try/download/community>
   (en este equipo ya está en `%LOCALAPPDATA%\Programs\MongoDB\mongodb-win32-x86_64-windows-8.2.4`).
2. Descomprímelo y crea la carpeta de datos:
   ```powershell
   New-Item -ItemType Directory -Force "$env:LOCALAPPDATA\Programs\MongoDB\data\db"
   ```
3. Arranca el motor:
   ```powershell
   & "$env:LOCALAPPDATA\Programs\MongoDB\mongodb-win32-x86_64-windows-8.2.4\bin\mongod.exe" `
     --dbpath "$env:LOCALAPPDATA\Programs\MongoDB\data\db" --bind_ip 127.0.0.1 --port 27017
   ```
   (o simplemente ejecuta `Iniciar_Astra_Node.bat`, que lo levanta solo si hace falta).

## Estructura

```
backend/
├── .env                    # configuración (puerto, Mongo, Ollama)
├── data/
│   ├── content.json        # lecciones y quizzes base      (era tutor_content.py)
│   ├── icfes_bank.json     # 250 preguntas ICFES            (era banco_icfes.py)
│   └── pdfs/               # PDFs subidos
├── scripts/
│   ├── smoke-test.js       # 25 pruebas de la API
│   ├── test-extract-json.mjs  # pruebas del parser de JSON
│   └── test-ai-endpoints.mjs  # 10 endpoints de IA reales (lento)
└── src/
    ├── server.js           # arranque: conecta Mongo, siembra y escucha
    ├── app.js              # Express: CORS, JSON, rutas, frontend estático, errores
    ├── errors.js           # HttpError (formato { detail } como FastAPI)
    ├── scripts/            # seed.js y reset.js (ejecutables con npm run seed/reset)
    ├── config/
    │   ├── env.js          # lectura de .env y rutas del proyecto
    │   ├── db.js           # conexión a Mongoose + auto-arranque de mongod
    │   └── subjects.js     # las 24 materias por defecto
    ├── models/index.js     # colecciones Mongoose (User, Subject, Lesson, Quiz, ...)
    ├── routes/
    │   ├── core.js         # /health /user /subjects /stats /domain
    │   ├── chat.js         # /chat /chat/reset
    │   ├── learn.js        # /lessons /quizzes (+ generate, complete, submit)
    │   ├── study.js        # /scan /predict /plans /explain /flashcards
    │   │                   # /mock-exam /oral /memory
    │   ├── icfes.js        # /icfes/bank /icfes/submit /icfes/predict
    │   └── pdfs.js         # /pdfs (subir, listar, descargar, borrar)
    ├── services/
    │   ├── ai.js           # cliente de Ollama (era ai.py)
    │   ├── tutor.js        # prompts y lógica del tutor (era tutor.py)
    │   ├── icfes.js        # puntaje Saber 11 (era icfes.py)
    │   ├── seed.js         # datos iniciales
    │   ├── state.js        # usuario, XP, nivel, racha, límite diario
    │   └── content.js      # carga content.json / icfes_bank.json
    └── utils/extractJson.js# JSON tolerante a errores del modelo
```

## Endpoints (idénticos al backend Python)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado de Ollama y modelos disponibles |
| GET | `/api/user` | Usuario, XP, nivel, racha, mensajes de hoy |
| GET | `/api/subjects` | Materias |
| GET | `/api/stats` | Contadores globales |
| GET | `/api/domain` | Dominio por materia + próxima lección |
| POST | `/api/chat` | Chat con el tutor (+5 XP) |
| POST | `/api/chat/reset` | Borra el historial |
| GET | `/api/lessons` | Lecciones (`?subject_id=`) |
| POST | `/api/lessons/generate` | Lección con IA (+10 XP) |
| POST | `/api/lessons/:id/complete` | Marca completada (+20 XP) |
| GET | `/api/quizzes` | Quizzes sin la respuesta correcta (`?subject_id=`) |
| POST | `/api/quizzes/generate` | Quiz con IA (+10 XP) |
| POST | `/api/quizzes/:id/submit` | Corrige (+10 XP por acierto) |
| POST | `/api/scan` | Analiza apuntes en foto con visión (+15 XP) |
| POST | `/api/predict` | Predice la nota del parcial (+15 XP) |
| GET/POST | `/api/plans` | Lista / crea planes de estudio (+15 XP) |
| POST | `/api/explain` | Explica un tema (+5 XP) |
| POST | `/api/flashcards` | Tarjetas de memorización (+10 XP) |
| POST | `/api/mock-exam` | Simulacro con IA (+10 XP) |
| POST | `/api/mock-exam/submit` | Corrige simulacro (autocorrección local) |
| POST | `/api/oral` | Examen oral con IA (+10 XP) |
| POST | `/api/oral/evaluate` | Evalúa respuesta oral (+5 XP) |
| POST | `/api/memory` | Pares para juego de memoria (+10 XP) |
| GET | `/api/icfes/bank` | Estructura oficial + 250 preguntas sin respuesta |
| POST | `/api/icfes/submit` | Puntaje Saber 11 con niveles oficiales (+25 XP) |
| GET | `/api/pdfs` | Lista PDFs del banco |
| POST | `/api/pdfs/upload` | Sube un PDF (multipart, campo `file`) |
| GET | `/api/pdfs/:name/download` | Descarga un PDF |
| DELETE | `/api/pdfs/:name` | Borra un PDF |

Los errores respetan el formato de FastAPI: `{ "detail": "mensaje" }` con su código HTTP
(402 al agotar el plan gratuito, 404, 400, 502 si Ollama falla).

## Diferencias con el backend Python

- **IDs**: en SQLite eran enteros; aquí son los `_id` de MongoDB (string, 24 hex).
  La API expone igualmente un campo `id` en cada documento, y el frontend los trata
  como valores opacos, así que todo sigue funcionando. Los `subject_id` se guardan como texto.
- **MongoDB** reemplaza a SQLite (`data/tutor.db`). El esquema de colecciones es equivalente:
  `users, subjects, lessons, quizzes, attempts, chats, scans, predictions, plans, flashcards`.
- **Parser de JSON mejorado**: el backend Python fallaba con "JSON inválido en la respuesta"
  cuando el modelo devolvía LaTeX con barras simples (`\(\frac{1}{3}\)`) en `/plans`, `/mock-exam`,
  `/flashcards`, etc. Aquí `src/utils/extractJson.js` repara escapes inválidos, comandos LaTeX,
  comas finales, vallas ```json ``` y JSON devuelto como string. Es la única mejora funcional
  sobre el original; el resto de la lógica es un port fiel.
- El modelo `Flashcard` (repaso espaciado Leitner) está definido como en el esquema original,
  pero el endpoint `/api/flashcards` sigue generando y devolviendo tarjetas sin persistirlas,
  igual que en el backend Python (el SRS quedó sin exponer).
- La IA sigue siendo local (Ollama), igual que antes: si no responde, los endpoints devuelven 502.

## .env

```ini
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/astra
MONGOD_PATH=C:\Users\<usuario>\AppData\Local\Programs\MongoDB\mongodb-win32-x86_64-windows-8.2.4\bin\mongod.exe
MONGO_DBPATH=C:\Users\<usuario>\AppData\Local\Programs\MongoDB\data\db
OLLAMA_URL=http://127.0.0.1:11434
CHAT_MODEL=qwen2.5:7b
VISION_MODEL=qwen2.5vl:3b
```

Para usar **MongoDB Atlas** en lugar de local: pega tu cadena en `MONGODB_URI`
(`mongodb+srv://usuario:clave@cluster.mongodb.net/astra`) y deja `MONGOD_PATH` vacío.

Tanto `.env` como `node_modules/`, `data/pdfs/*` y `mongo-data/` están en `.gitignore`
para que puedas subirlo a GitHub sin secretos ni binarios.

## Desplegar en la nube (Render / Railway)

GitHub Pages solo sirve el frontend estático, así que el backend necesita un host aparte
con IP pública. Pasos generales (ejemplo con **Render**):

1. Crea una base de datos en **MongoDB Atlas** (plan gratis) y copia su cadena de conexión.
2. En Render: **New → Web Service**, apunta al repo y usa:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Define las variables de entorno (pestaña *Environment*):
   - `MONGODB_URI` = tu cadena de Atlas
   - `CORS_ORIGIN` = `https://dfleonm-jpg.github.io`
   - `MONGOD_PATH` y `MONGO_DBPATH` → **vacías** (no se auto-arranca mongod en la nube)
   - `PORT` → la plataforma la inyecta sola; no la fijes a mano.
4. Deploy. La API quedará en algo como `https://tu-servicio.onrender.com/api/health`.

> La IA (Ollama) es **local**: en la nube los endpoints de IA devolverán 502 salvo que
> apuntes `OLLAMA_URL` a un host de Ollama accesible o migres a otro proveedor.

## Conectar el frontend

El frontend de este repo (en la raíz) usa Firebase por ahora. Cuando quieras que consuma
esta API, define en el frontend una URL base (local `http://localhost:8000/api`,
producción `https://tu-servicio.onrender.com/api`) y reemplaza las llamadas por `fetch`
a esos endpoints.
