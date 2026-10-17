/** Siembra materias + contenido base sin arrancar el servidor HTTP. */
import { connectDB, disconnectDB } from '../config/db.js'
import { seed } from '../services/seed.js'

try {
  await connectDB()
  await seed()
  console.log('✅ Seed completado')
} catch (err) {
  console.error(`❌ ${err.message}`)
  process.exitCode = 1
} finally {
  await disconnectDB()
}
