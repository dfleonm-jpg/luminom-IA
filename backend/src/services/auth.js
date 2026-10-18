/**
 * Autenticación: hash de contraseñas (scrypt nativo) y tokens JWT.
 * Usa solo módulos nativos de Node para el hash (sin dependencias nativas problemáticas en la nube).
 */
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_EXPIRES } from '../config/env.js'

// ----- Hash de contraseña (scrypt) -----
// Formato guardado: "scrypt:<saltHex>:<hashHex>"
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex')
  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  if (typeof stored !== 'string') return false
  const [scheme, salt, hash] = stored.split(':')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const check = crypto.scryptSync(String(password), salt, 64).toString('hex')
  // Comparación en tiempo constante
  const a = Buffer.from(hash, 'hex')
  const b = Buffer.from(check, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

// ----- JWT -----
export function signToken(account) {
  return jwt.sign(
    { sub: String(account._id), email: account.email, role: account.role, name: account.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

// Middleware: exige un token válido (pone req.auth)
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  const payload = token ? verifyToken(token) : null
  if (!payload) {
    return res.status(401).json({ detail: 'No autenticado' })
  }
  req.auth = payload
  next()
}

// Middleware: exige rol admin
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.auth.role !== 'admin') {
      return res.status(403).json({ detail: 'Requiere permisos de administrador' })
    }
    next()
  })
}
