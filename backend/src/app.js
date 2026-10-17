import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/index.js'
import { DIST_DIR, CORS_ORIGIN } from './config/env.js'

const app = express()

app.disable('x-powered-by')

// CORS configurable: '*' en desarrollo, o lista de orígenes en producción
const corsOptions =
  CORS_ORIGIN === '*'
    ? {}
    : { origin: CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean) }
app.use(cors(corsOptions))

app.use(express.json({ limit: '50mb' }))

// ---------- API ----------
app.use('/api', apiRoutes)

// ---------- Frontend compilado (PWA) ----------
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.get('*', (req, res) => {
    const index = path.join(DIST_DIR, 'index.html')
    if (fs.existsSync(index)) return res.sendFile(index)
    res.json({ detail: 'Frontend no compilado. Ejecuta: cd frontend && npm run build' })
  })
} else {
  app.get('/', (req, res) => {
    res.json({ detail: 'Frontend no compilado. Ejecuta: cd frontend && npm run build' })
  })
}

// ---------- Manejo de errores -> { detail } (igual que FastAPI) ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500
  if (status >= 500) console.error('❌', err)
  res.status(status).json({ detail: err.message || 'Error del servidor' })
})

export default app
