import app from './app.js'
import { PORT, MONGODB_URI } from './config/env.js'
import { connectDB, disconnectDB } from './config/db.js'
import { seed } from './services/seed.js'

async function main() {
  await connectDB()
  await seed()

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('')
    console.log('====================================================')
    console.log('  🎓 Astra AI Tutor — backend Node/Express/MongoDB')
    console.log(`  Servidor:  http://localhost:${PORT}`)
    console.log(`  API:       http://localhost:${PORT}/api/health`)
    console.log(`  MongoDB:   ${MONGODB_URI}`)
    console.log('====================================================')
    console.log('')
  })

  const shutdown = async (signal) => {
    console.log(`\n⏹  ${signal}: cerrando servidor…`)
    server.close()
    await disconnectDB()
    process.exit(0)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}\n`)
  process.exit(1)
})
