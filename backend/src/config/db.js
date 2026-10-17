import fs from 'node:fs'
import { spawn } from 'node:child_process'
import mongoose from 'mongoose'
import { MONGODB_URI, MONGOD_PATH, MONGO_DBPATH } from './env.js'

let mongodProcess = null
let triedAutoStart = false

function tryStartMongod() {
  if (triedAutoStart) return
  triedAutoStart = true

  if (!MONGOD_PATH) {
    console.warn('⚠️  MONGOD_PATH no está definido en .env: no puedo arrancar MongoDB solo.')
    return
  }
  if (!fs.existsSync(MONGOD_PATH)) {
    console.warn(`⚠️  No existe mongod en: ${MONGOD_PATH}`)
    return
  }

  try {
    fs.mkdirSync(MONGO_DBPATH, { recursive: true })
    mongodProcess = spawn(
      MONGOD_PATH,
      ['--dbpath', MONGO_DBPATH, '--bind_ip', '127.0.0.1', '--port', '27017', '--quiet'],
      { stdio: 'ignore', windowsHide: true }
    )
    mongodProcess.on('error', (err) => {
      console.warn(`⚠️  No pude iniciar mongod: ${err.message}`)
      mongodProcess = null
    })
    mongodProcess.on('exit', (code) => {
      if (code && code !== 0) console.warn(`⚠️  mongod terminó con código ${code}`)
      mongodProcess = null
    })
    console.log('🔄 Arrancando MongoDB local…')
  } catch (err) {
    console.warn(`⚠️  Error al arrancar mongod: ${err.message}`)
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function connectDB({ retries = 15, delayMs = 2000 } = {}) {
  mongoose.set('strictQuery', true)

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 })
      console.log(`✅ MongoDB conectado: ${MONGODB_URI}`)
      return mongoose.connection
    } catch (err) {
      if (attempt === 1) tryStartMongod()
      console.warn(`⚠️  MongoDB no responde (intento ${attempt}/${retries}): ${err.message}`)
      if (attempt === retries) {
        throw new Error(
          `No se pudo conectar a MongoDB (${MONGODB_URI}). ` +
            'Arrántalo manualmente o revisa MONGODB_URI/MONGOD_PATH en backend-node/.env'
        )
      }
      await sleep(delayMs)
    }
  }
}

export async function disconnectDB() {
  await mongoose.disconnect()
  if (mongodProcess) {
    try {
      mongodProcess.kill()
    } catch {
      /* noop */
    }
    mongodProcess = null
  }
}
