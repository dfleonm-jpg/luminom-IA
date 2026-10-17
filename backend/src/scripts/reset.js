/** Borra la base de datos y la vuelve a sembrar (24 materias, lecciones y quizzes base). */
import { connectDB, disconnectDB } from '../config/db.js'
import { seed } from '../services/seed.js'

try {
  const conn = await connectDB()
  const name = conn.name
  await conn.dropDatabase()
  console.log(`🗑️  Base de datos "${name}" borrada`)
  await seed()
  console.log('✅ Base de datos reiniciada (solo contenido base)')
} catch (err) {
  console.error(`❌ ${err.message}`)
  process.exitCode = 1
} finally {
  await disconnectDB()
}
