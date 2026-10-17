import { User } from '../models/index.js'

export const pad = (n) => String(n).padStart(2, '0')

export function todayStr(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function yesterdayStr() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return todayStr(d)
}

export function nowIso() {
  const d = new Date()
  return (
    `${todayStr(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}

/** Usuario único de la app (equivalente a la fila id=1 del backend original). */
export async function getUser() {
  let user = await User.findOne({ key: 'main' })
  if (!user) {
    user = await User.create({
      key: 'main',
      name: 'Mi Tutor',
      premium: true,
      xp: 0,
      level: 1,
      streak: 0,
      last_active: nowIso(),
      daily_messages: 0,
      daily_date: todayStr(),
    })
  }
  return user
}

export async function updateUser(fields) {
  const user = await User.findOneAndUpdate(
    { key: 'main' },
    { $set: fields },
    { new: true, upsert: true }
  )
  return user
}

/** +XP y recálculo de nivel (nivel = xp // 500 + 1). */
export async function addXp(points) {
  const user = await getUser()
  const xp = user.xp + points
  const level = Math.floor(xp / 500) + 1
  await updateUser({ xp, level })
}

/**
 * Reinicia el contador diario si cambió la fecha.
 * Devuelve los mensajes enviados hoy.
 */
export async function checkDaily(user) {
  const today = todayStr()
  if (user.daily_date !== today) {
    await updateUser({
      daily_date: today,
      daily_messages: 0,
      last_active: nowIso(),
    })
    return 0
  }
  return user.daily_messages || 0
}

/** Actualiza la racha de estudio al abrir la app. */
export async function refreshStreak(user) {
  const today = todayStr()
  const lastDate = user.last_active ? user.last_active.split('T')[0] : ''
  if (lastDate === today) return user

  const patch = {}
  if (lastDate) {
    const y = yesterdayStr()
    if (lastDate === y) patch.streak = (user.streak || 0) + 1
    else if (lastDate < y) patch.streak = 0
  }
  patch.last_active = nowIso()
  return updateUser(patch)
}
