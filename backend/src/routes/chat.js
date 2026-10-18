import { Router } from 'express'
import { Chat, Account } from '../models/index.js'
import { addXp, checkDaily, getUser, nowIso, updateUser } from '../services/state.js'
import * as tutor from '../services/tutor.js'
import { verifyToken } from '../services/auth.js'
import { asyncHandler, HttpError } from '../errors.js'

// Determina el plan efectivo del usuario autenticado (si envía token)
async function planFromRequest(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const payload = token ? verifyToken(token) : null
  if (!payload) return null
  const account = await Account.findById(payload.sub)
  if (!account) return null
  let plan = account.plan || 'free'
  if (plan === 'premium' && account.planExpires && new Date(account.planExpires) < new Date()) {
    plan = 'free'
  }
  return { plan, status: account.status }
}

const router = Router()

async function getChatHistory(limit = 60) {
  const rows = await Chat.find().sort({ _id: -1 }).limit(limit)
  return rows.reverse().map((r) => ({ role: r.role, content: r.content }))
}

export async function addChat(role, content) {
  await Chat.create({ role, content, created_at: nowIso() })
}

// POST /api/chat
router.post(
  '/chat',
  asyncHandler(async (req, res) => {
    const message = req.body && req.body.message
    if (typeof message !== 'string' || !message.trim()) {
      throw new HttpError(400, 'El mensaje no puede estar vacío')
    }

    const user = await getUser()
    const used = await checkDaily(user)

    // Límite según el plan REAL del usuario autenticado (si envía token).
    // free = 10/día, premium y lifetime = ilimitado.
    const info = await planFromRequest(req)
    if (info && info.status === 'suspended') {
      throw new HttpError(403, 'Tu cuenta está suspendida.')
    }
    const plan = info ? info.plan : 'free'
    const isPaid = plan === 'premium' || plan === 'lifetime'
    const limit = isPaid ? 100000 : 10

    if (!isPaid && used >= limit) {
      throw new HttpError(
        402,
        'Límite diario del plan gratuito alcanzado (10 preguntas). Mejora a Premium para chat ilimitado.'
      )
    }

    await addChat('user', message)
    const history = await getChatHistory()
    const result = await tutor.chat(history, user)

    if (result.ok) {
      await addChat('assistant', result.content)
      await updateUser({ daily_messages: used + 1 })
      await addXp(5)
      result.xp_gained = 5
    }

    res.json(result)
  })
)

// POST /api/chat/reset
router.post(
  '/chat/reset',
  asyncHandler(async (req, res) => {
    await Chat.deleteMany({})
    res.json({ ok: true })
  })
)

export default router
