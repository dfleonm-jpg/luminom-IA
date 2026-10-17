import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

// Carga .env siempre desde la raíz de backend-node (da igual desde dónde se lance node)
dotenv.config({ path: path.join(ROOT, '.env') })

const env = process.env

export const PORT = Number(env.PORT || 8000)
export const MONGODB_URI = env.MONGODB_URI || 'mongodb://127.0.0.1:27017/astra'

// CORS: lista separada por comas, o '*' para permitir todo (desarrollo)
export const CORS_ORIGIN = (env.CORS_ORIGIN || '*').trim()

// Arranque automático de mongod si nadie lo está ejecutando
export const MONGOD_PATH = env.MONGOD_PATH || ''
export const MONGO_DBPATH = env.MONGO_DBPATH || path.join(ROOT, 'mongo-data')

// IA local (Ollama)
export const OLLAMA_URL = env.OLLAMA_URL || 'http://127.0.0.1:11434'
export const CHAT_MODEL = env.CHAT_MODEL || 'qwen2.5:7b'
export const VISION_MODEL = env.VISION_MODEL || 'qwen2.5vl:3b'

// Rutas
export const PDF_DIR = path.join(ROOT, 'data', 'pdfs')
export const CONTENT_FILE = path.join(ROOT, 'data', 'content.json')
export const ICFES_BANK_FILE = path.join(ROOT, 'data', 'icfes_bank.json')
export const DIST_DIR = path.resolve(ROOT, '..', 'frontend', 'dist')
