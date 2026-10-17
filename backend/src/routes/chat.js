import { Router } from 'express'
import { Chat } from '../models/index.js'
import { addXp, checkDaily, getUser, nowIso, updateUser } from '../services/state.js'
import * as tutor from '../services/tutor.js'
import { asyncHandler, HttpError } from '../errors.js'

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
    const premium = Boolean(user.premium)
    const limit = premium ? 1000 : 20

    if (used >= limit && !premium) {
      throw new HttpError(
        402,
        'Límite del plan gratuito alcanzado. Mejora a Premium para chat ilimitado.'
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
