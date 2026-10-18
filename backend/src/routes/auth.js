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

export default router
