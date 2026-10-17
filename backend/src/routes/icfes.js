import { Router } from 'express'
import { AREAS, TOTAL_MINUTOS, TOTAL_PREGUNTAS, computeTotal } from '../services/icfes.js'
import { getIcfesBank } from '../services/content.js'
import { addXp } from '../services/state.js'
import { asyncHandler, HttpError } from '../errors.js'

const router = Router()

// GET /api/icfes/bank -> estructura del examen + preguntas SIN la respuesta correcta
router.get(
  '/icfes/bank',
  asyncHandler(async (req, res) => {
    const bank = getIcfesBank()

    const areas = AREAS.map((a) => ({
      ...a,
      pregunta_ids: bank.filter((q) => q.area === a.key).map((q) => q.id),
    }))

    const questions = bank.map((q) => ({
      id: q.id,
      area: q.area,
      producto: q.producto || 'P1',
      q: q.q,
      options: q.options,
    }))

    res.json({
      ok: true,
      areas,
      questions,
      total_preguntas: TOTAL_PREGUNTAS,
      total_minutos: TOTAL_MINUTOS,
    })
  })
)

// POST /api/icfes/submit -> corrige y calcula el puntaje 0-500 con niveles oficiales
async function submitIcfes(req, res) {
  const bank = getIcfesBank()
  const answers = (req.body || {}).answers || {}
  if (typeof answers !== 'object') throw new HttpError(400, 'Respuestas inválidas')

  const byArea = {}
  const keyedDetails = {}

  for (const area of AREAS) {
    const key = area.key
    const chosen = Array.isArray(answers[key]) ? answers[key] : []
    const areaQuestions = bank.filter((q) => q.area === key)

    let aciertos = 0
    keyedDetails[key] = []

    for (let idx = 0; idx < chosen.length && idx < areaQuestions.length; idx++) {
      const q = areaQuestions[idx]
      const ok = chosen[idx] === q.correct
      if (ok) aciertos += 1
      keyedDetails[key].push({
        id: q.id,
        q: q.q,
        ok,
        correct: q.correct,
        chosen: chosen[idx],
        explain: q.explain || '',
      })
    }

    byArea[key] = { aciertos, total: areaQuestions.length }
  }

  const report = computeTotal(byArea)
  for (const area of AREAS) {
    report.areas[area.key].details = keyedDetails[area.key]
  }

  report.ok = true
  await addXp(25)
  report.xp_gained = 25

  res.json(report)
}

router.post('/icfes/submit', asyncHandler(submitIcfes))
router.post('/icfes/predict', asyncHandler(submitIcfes))

export default router
