import { Router } from 'express'
import { isValidObjectId } from 'mongoose'
import { Attempt, Lesson, Quiz, Subject } from '../models/index.js'
import { addXp, nowIso } from '../services/state.js'
import * as tutor from '../services/tutor.js'
import { asyncHandler, HttpError } from '../errors.js'

const router = Router()

const subjectFilter = (subjectId) => {
  if (!subjectId) return {}
  if (!isValidObjectId(subjectId)) return { subject_id: '__no_existe__' }
  return { subject_id: String(subjectId) }
}

export async function findSubjectByName(name) {
  if (!name) return null
  return Subject.findOne({ name })
}

// ---------- Lecciones ----------

// GET /api/lessons?subject_id=...
router.get(
  '/lessons',
  asyncHandler(async (req, res) => {
    const lessons = await Lesson.find(subjectFilter(req.query.subject_id)).sort({ _id: 1 })
    res.json(lessons)
  })
)

// POST /api/lessons/generate
router.post(
  '/lessons/generate',
  asyncHandler(async (req, res) => {
    const { subject, topic } = req.body || {}
    if (!subject) throw new HttpError(400, 'Falta la materia')

    const generated = await tutor.generateLesson(subject, topic || null)
    if (!generated.ok) throw new HttpError(502, generated.error || 'Error generando lección')

    const subj = await findSubjectByName(subject)
    if (subj) {
      await Lesson.create({
        subject_id: String(subj._id),
        title: generated.title,
        content: generated.content,
        summary: generated.summary,
        duration_min: generated.duration_min,
        is_ai: true,
        completed: false,
      })
    }

    await addXp(10)
    res.json({ ok: true, ...generated, xp_gained: 10 })
  })
)

// POST /api/lessons/:id/complete
router.post(
  '/lessons/:id/complete',
  asyncHandler(async (req, res) => {
    if (isValidObjectId(req.params.id)) {
      await Lesson.updateOne({ _id: req.params.id }, { $set: { completed: true } })
    }
    await addXp(20)
    res.json({ ok: true, xp_gained: 20 })
  })
)

// ---------- Quizzes ----------

// GET /api/quizzes?subject_id=... (sin la respuesta correcta)
router.get(
  '/quizzes',
  asyncHandler(async (req, res) => {
    const quizzes = await Quiz.find(subjectFilter(req.query.subject_id)).sort({ _id: 1 })
    const payload = quizzes.map((q) => {
      const quiz = q.toJSON()
      quiz.questions = (quiz.questions || []).map(({ correct, ...rest }) => rest)
      return quiz
    })
    res.json(payload)
  })
)

// POST /api/quizzes/generate
router.post(
  '/quizzes/generate',
  asyncHandler(async (req, res) => {
    const { subject, topic } = req.body || {}
    if (!subject) throw new HttpError(400, 'Falta la materia')

    const generated = await tutor.generateQuiz(subject, topic || null)
    if (!generated.ok) throw new HttpError(502, generated.error || 'Error generando quiz')

    const subj = await findSubjectByName(subject)
    if (subj) {
      await Quiz.create({
        subject_id: String(subj._id),
        title: generated.title,
        questions: generated.questions,
        is_ai: true,
        created_at: nowIso(),
      })
    }

    await addXp(10)
    res.json({ ok: true, ...generated, xp_gained: 10 })
  })
)

// POST /api/quizzes/:id/submit
router.post(
  '/quizzes/:id/submit',
  asyncHandler(async (req, res) => {
    const answers = (req.body || {}).answers
    if (!Array.isArray(answers)) throw new HttpError(400, 'Respuestas inválidas')
    if (!isValidObjectId(req.params.id)) throw new HttpError(404, 'Quiz no encontrado')

    const quiz = await Quiz.findById(req.params.id)
    if (!quiz) throw new HttpError(404, 'Quiz no encontrado')

    const questions = quiz.questions || []
    if (answers.length !== questions.length) {
      throw new HttpError(400, 'Cantidad de respuestas incorrecta')
    }

    let score = 0
    const details = []
    questions.forEach((question, i) => {
      const ok = answers[i] === question.correct
      if (ok) score += 1
      details.push({ question: question.q, ok, correct: question.correct })
    })

    const total = questions.length
    await Attempt.create({
      quiz_id: String(quiz._id),
      score,
      total,
      answers,
      created_at: nowIso(),
    })
    await addXp(score * 10)

    res.json({
      ok: true,
      score,
      total,
      percentage: total ? Math.round((score / total) * 1000) / 10 : 0,
      details,
      xp_gained: score * 10,
    })
  })
)

export default router
