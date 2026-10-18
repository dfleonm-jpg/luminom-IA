import { Router } from 'express'
import { Account } from '../models/index.js'
import { asyncHandler, HttpError } from '../errors.js'
import { hashPassword, verifyPassword, signToken, requireAuth, requireAdmin } from '../services/auth.js'

const router = Router()

const isEmail = (s) => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

// POST /api/auth/register  { name, email, password, carrera }
router.post(
  '/auth/register',
  asyncHandler(async (req, res) => {
    const { name = '', email = '', password = '', carrera = '' } = req.body || {}
    if (!isEmail(email)) throw new HttpError(400, 'Correo electrónico inválido')
    if (String(password).length < 6) throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres')

    const normalized = email.trim().toLowerCase()
    const exists = await Account.findOne({ email: normalized })
    if (exists) throw new HttpError(409, 'Este correo ya está registrado')

    const account = await Account.create({
      email: normalized,
      passwordHash: hashPassword(password),
      name: String(name).trim(),
      carrera: String(carrera).trim(),
      role: 'user',
    })

    const token = signToken(account)
    res.json({ ok: true, token, user: account.toJSON() })
  })
)

// POST /api/auth/login  { email, password }
router.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const { email = '', password = '' } = req.body || {}
    const normalized = String(email).trim().toLowerCase()

    const account = await Account.findOne({ email: normalized })
    if (!account || !verifyPassword(password, account.passwordHash)) {
      throw new HttpError(401, 'Correo o contraseña incorrectos')
    }
    if (account.status === 'suspended') {
      throw new HttpError(403, 'Tu cuenta ha sido suspendida. Contacta al administrador.')
    }

    account.lastLogin = new Date().toISOString()
    await account.save()

    const token = signToken(account)
    res.json({ ok: true, token, user: account.toJSON() })
  })
)

// GET /api/auth/me  (con token)
router.get(
  '/auth/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const account = await Account.findById(req.auth.sub)
    if (!account) throw new HttpError(404, 'Cuenta no encontrada')
    res.json(account.toJSON())
  })
)

// GET /api/admin/accounts  (solo admin) — lista de cuentas para el panel
router.get(
  '/admin/accounts',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const accounts = await Account.find().sort({ createdAt: -1 })
    res.json(accounts.map((a) => a.toJSON()))
  })
)

// GET /api/admin/stats  (solo admin) — métricas para el dashboard
router.get(
  '/admin/stats',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const [total, admins, Chat, Subject, Lesson, Quiz] = await Promise.all([
      Account.countDocuments(),
      Account.countDocuments({ role: 'admin' }),
      import('../models/index.js').then((m) => m.Chat.countDocuments()),
      import('../models/index.js').then((m) => m.Subject.countDocuments()),
      import('../models/index.js').then((m) => m.Lesson.countDocuments()),
      import('../models/index.js').then((m) => m.Quiz.countDocuments()),
    ])

    // Registros de los últimos 7 días
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const [recent, premiumN, lifetimeN, suspendedN] = await Promise.all([
      Account.countDocuments({ createdAt: { $gte: since } }),
      Account.countDocuments({ plan: 'premium' }),
      Account.countDocuments({ plan: 'lifetime' }),
      Account.countDocuments({ status: 'suspended' }),
    ])
    // "free" = todo lo que no es premium ni lifetime (incluye cuentas antiguas sin campo plan)
    const freeN = total - premiumN - lifetimeN

    res.json({
      total_accounts: total,
      admins,
      users: total - admins,
      new_last_7_days: recent,
      free: freeN,
      premium: premiumN,
      lifetime: lifetimeN,
      suspended: suspendedN,
      chats: Chat,
      subjects: Subject,
      lessons: Lesson,
      quizzes: Quiz,
    })
  })
)

// POST /api/admin/accounts  (solo admin) — crear una cuenta
router.post(
  '/admin/accounts',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { name = '', email = '', password = '', carrera = '', role = 'user', plan = 'free' } = req.body || {}
    if (!isEmail(email)) throw new HttpError(400, 'Correo electrónico inválido')
    if (String(password).length < 6) throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres')
    if (!['user', 'admin'].includes(role)) throw new HttpError(400, 'Rol inválido')
    if (!['free', 'premium', 'lifetime'].includes(plan)) throw new HttpError(400, 'Plan inválido')

    const normalized = email.trim().toLowerCase()
    if (await Account.findOne({ email: normalized })) throw new HttpError(409, 'Este correo ya está registrado')

    const account = await Account.create({
      email: normalized,
      passwordHash: hashPassword(password),
      name: String(name).trim(),
      carrera: String(carrera).trim(),
      role,
      plan,
      planExpires: plan === 'premium' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : '',
    })
    res.json({ ok: true, user: account.toJSON() })
  })
)

// PATCH /api/admin/accounts/:id  (solo admin) — editar nombre/carrera/rol
router.patch(
  '/admin/accounts/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.id)
    if (!account) throw new HttpError(404, 'Cuenta no encontrada')

    const { name, carrera, role, plan, planExpires, status } = req.body || {}

    // No permitir que un admin se quite su propio rol (evita quedarte fuera)
    if (role && role !== account.role && String(account._id) === req.auth.sub && role !== 'admin') {
      throw new HttpError(400, 'No puedes quitarte tu propio rol de administrador')
    }
    // No permitir degradar al último admin
    if (role === 'user' && account.role === 'admin') {
      const adminCount = await Account.countDocuments({ role: 'admin' })
      if (adminCount <= 1) throw new HttpError(400, 'Debe existir al menos un administrador')
    }
    if (role && !['user', 'admin'].includes(role)) throw new HttpError(400, 'Rol inválido')
    if (plan && !['free', 'premium', 'lifetime'].includes(plan)) throw new HttpError(400, 'Plan inválido')
    if (status && !['active', 'suspended'].includes(status)) throw new HttpError(400, 'Estado inválido')
    // No permitir suspenderte a ti mismo
    if (status === 'suspended' && String(account._id) === req.auth.sub) {
      throw new HttpError(400, 'No puedes suspender tu propia cuenta')
    }

    if (typeof name === 'string') account.name = name.trim()
    if (typeof carrera === 'string') account.carrera = carrera.trim()
    if (role) account.role = role
    if (plan) {
      account.plan = plan
      // Al poner premium sin fecha, dar 30 días por defecto; lifetime/free limpian la fecha
      if (plan === 'premium') {
        account.planExpires = planExpires || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      } else {
        account.planExpires = ''
      }
    }
    if (typeof planExpires === 'string' && plan === 'premium') account.planExpires = planExpires
    if (status) account.status = status
    await account.save()

    res.json({ ok: true, user: account.toJSON() })
  })
)

// POST /api/admin/accounts/:id/reset-password  (solo admin) — cambiar contraseña
router.post(
  '/admin/accounts/:id/reset-password',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { password = '' } = req.body || {}
    if (String(password).length < 6) throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres')
    const account = await Account.findById(req.params.id)
    if (!account) throw new HttpError(404, 'Cuenta no encontrada')
    account.passwordHash = hashPassword(password)
    await account.save()
    res.json({ ok: true })
  })
)

// DELETE /api/admin/accounts/:id  (solo admin) — eliminar cuenta
router.delete(
  '/admin/accounts/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const account = await Account.findById(req.params.id)
    if (!account) throw new HttpError(404, 'Cuenta no encontrada')

    if (String(account._id) === req.auth.sub) {
      throw new HttpError(400, 'No puedes eliminar tu propia cuenta')
    }
    if (account.role === 'admin') {
      const adminCount = await Account.countDocuments({ role: 'admin' })
      if (adminCount <= 1) throw new HttpError(400, 'No puedes eliminar al último administrador')
    }
    await account.deleteOne()
    res.json({ ok: true })
  })
)

export default router
