import { Router } from 'express'
import coreRoutes from './core.js'
import authRoutes from './auth.js'
import chatRoutes from './chat.js'
import learnRoutes from './learn.js'
import studyRoutes from './study.js'
import icfesRoutes from './icfes.js'
import pdfRoutes from './pdfs.js'

const router = Router()

router.use(authRoutes)
router.use(coreRoutes)
router.use(chatRoutes)
router.use(learnRoutes)
router.use(studyRoutes)
router.use(icfesRoutes)
router.use(pdfRoutes)

// 404 sólo para /api/*
router.use((req, res) => {
  res.status(404).json({ detail: `Ruta no encontrada: ${req.method} /api${req.path}` })
})

export default router
