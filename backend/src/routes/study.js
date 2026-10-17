import { Router } from 'express'
import { isValidObjectId } from 'mongoose'
import { Attempt, Plan, Prediction, Quiz, Scan } from '../models/index.js'
import { addXp, nowIso } from '../services/state.js'
import * as tutor from '../services/tutor.js'
import { asyncHandler, HttpError } from '../errors.js'

const router = Router()

// POST /api/scan  (imagen base64)
router.post(
  '/scan',
  asyncHandler(async (req, res) => {
    const image = (req.body || {}).image
    if (!image || image.length < 100) throw new HttpError(400, 'Imagen no válida')

    const result = await tutor.scanNotes(image)
    if (!result.ok) throw new HttpError(502, result.error || 'Error analizando la imagen')

    await Scan.create({
      subject: 'Apuntes',
      extracted_text: '',
      summary: result.analysis,
      created_at: nowIso(),
    })
    await addXp(15)
    res.json({ ok: true, ...result, xp_gained: 15 })
  })
)

// POST /api/predict
router.post(
  '/predict',
  asyncHandler(async (req, res) => {
    const { subject, topics, days_left } = req.body || {}
    if (!subject) throw new HttpError(400, 'Falta la materia')

    const attempts = await Attempt.find().sort({ _id: -1 }).limit(10)
    const history = []
    for (const a of attempts) {
      let title = ''
      if (isValidObjectId(a.quiz_id)) {
        const quiz = await Quiz.findById(a.quiz_id)
        if (quiz) title = quiz.title
      }
      history.push({ title, score: a.score, total: a.total })
    }

    const result = await tutor.predictExam(subject, history, topics || [], days_left || 7)
    if (!result.ok) throw new HttpError(502, result.error || 'Error generando predicción')

    await Prediction.create({ subject, data: result, created_at: nowIso() })
    await addXp(15)
    res.json({ ok: true, ...result, xp_gained: 15 })
  })
)

// POST /api/plans
router.post(
  '/plans',
  asyncHandler(async (req, res) => {
    const { subject, exam_date, topics, hours_per_day } = req.body || {}
    if (!subject) throw new HttpError(400, 'Falta la materia')

    const result = await tutor.createPlan(
      subject,
      exam_date || new Date().toLocaleDateString('es-ES'),
      topics || [],
      hours_per_day || 1.5
    )
    if (!result.ok) throw new HttpError(502, result.error || 'Error generando plan')

    const plan = await Plan.create({
      title: result.title,
      data: { days: result.days, subject },
      created_at: nowIso(),
    })
    await addXp(15)
    res.json({ ok: true, id: String(plan._id), ...result, xp_gained: 15 })
  })
)

// GET /api/plans
router.get(
  '/plans',
  asyncHandler(async (req, res) => {
    const plans = await Plan.find().sort({ _id: -1 }).limit(20)
    res.json(plans)
  })
)

// POST /api/explain
router.post(
  '/explain',
  asyncHandler(async (req, res) => {
    const { topic, level } = req.body || {}
    if (!topic) throw new HttpError(400, 'Falta el tema')

    const result = await tutor.explainTopic(topic, level || 'principiante')
    if (!result.ok) throw new HttpError(502, result.error || 'Error generando explicación')

    await addXp(5)
    res.json({ ok: true, ...result, xp_gained: 5 })
  })
)

// POST /api/flashcards
router.post(
  '/flashcards',
  asyncHandler(async (req, res) => {
    const { subject, topic } = req.body || {}
    if (!subject) throw new HttpError(400, 'Falta la materia')

    const result = await tutor.generateFlashcards(subject, topic || null)
    if (!result.ok) throw new HttpError(502, result.error || 'Error generando tarjetas')

    await addXp(10)
    res.json({ ok: true, ...result, xp_gained: 10 })
  })
)

// POST /api/mock-exam
router.post(
  '/mock-exam',
  asyncHandler(async (req, res) => {
    const { subject, topic, minutes } = req.body || {}
    if (!subject) throw new HttpError(400, 'Falta la materia')

    const result = await tutor.generateMockExam(subject, topic || null)
    if (!result.ok) throw new HttpError(502, result.error || 'Error generando simulacro')

    await addXp(10)
    res.json({ ok: true, minutes: minutes || 10, ...result, xp_gained: 10 })
  })
)

// POST /api/mock-exam/submit  (autocorrección: preguntas + respuestas del cliente)
router.post(
  '/mock-exam/submit',
  asyncHandler(async (req, res) => {
    const { questions = [], answers = [] } = req.body || {}
    if (questions.length !== answers.length) {
      throw new HttpError(400, 'Cantidad de respuestas incorrecta')
    }

    let score = 0
    const details = []
    const weak = []
    questions.forEach((question, i) => {
      const ok = answers[i] === question.correct
      if (ok) score += 1
      else weak.push(question.q || 'Pregunta')
      details.push({
        question: question.q || '',
        ok,
        correct: question.correct,
        explain: question.explain || '',
      })
    })

    const total = questions.length
    await addXp(score * 10)
    res.json({
      ok: true,
      score,
      total,
      percentage: total ? Math.round((score / total) * 1000) / 10 : 0,
      details,
      weak_points: weak,
      xp_gained: score * 10,
    })
  })
)

// POST /api/oral
router.post(
  '/oral',
  asyncHandler(async (req, res) => {
    const { subject, topic } = req.body || {}
    if (!subject) throw new HttpError(400, 'Falta la materia')

    const result = await tutor.generateOralExam(subject, topic || null)
    if (!result.ok) throw new HttpError(502, result.error || 'Error generando examen oral')

    await addXp(10)
    res.json({ ok: true, ...result, xp_gained: 10 })
  })
)

// POST /api/oral/evaluate
router.post(
  '/oral/evaluate',
  asyncHandler(async (req, res) => {
    const { question, answer, ideal } = req.body || {}
    if (!question || !answer) throw new HttpError(400, 'Faltan la pregunta o la respuesta')

    const result = await tutor.evaluateOralAnswer(question, answer, ideal || null)
    if (!result.ok) throw new HttpError(502, result.error || 'Error evaluando respuesta')

    await addXp(5)
    res.json({ ok: true, ...result, xp_gained: 5 })
  })
)

// POST /api/memory
router.post(
  '/memory',
  asyncHandler(async (req, res) => {
    const { subject, topic } = req.body || {}
    if (!subject) throw new HttpError(400, 'Falta la materia')

    const result = await tutor.generateMemoryGame(subject, topic || null)
    if (!result.ok) throw new HttpError(502, result.error || 'Error generando juego')

    await addXp(10)
    res.json({ ok: true, ...result, xp_gained: 10 })
  })
)

export default router
