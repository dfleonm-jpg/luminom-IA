import { Router } from 'express'
import * as ai from '../services/ai.js'
import { Attempt, Lesson, Quiz, Scan, Subject } from '../models/index.js'
import { checkDaily, getUser, refreshStreak, todayStr } from '../services/state.js'
import { computeDomain } from '../services/tutor.js'
import { asyncHandler } from '../errors.js'

const router = Router()

// GET /api/health
router.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.json(await ai.health())
  })
)

// GET /api/user
router.get(
  '/user',
  asyncHandler(async (req, res) => {
    let user = await getUser()

    const today = todayStr()
    const lastDate = user.last_active ? user.last_active.split('T')[0] : ''
    if (lastDate !== today) {
      user = await refreshStreak(user)
    }

    const messages_today = await checkDaily(user)
    const fresh = await getUser()

    res.json({ ...fresh.toJSON(), messages_today })
  })
)

// GET /api/subjects
router.get(
  '/subjects',
  asyncHandler(async (req, res) => {
    const subjects = await Subject.find().sort({ _id: 1 })
    res.json(subjects)
  })
)

// GET /api/stats
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [total_lessons, completed_lessons, quiz_count, attempts, scans] = await Promise.all([
      Lesson.countDocuments(),
      Lesson.countDocuments({ completed: true }),
      Quiz.countDocuments(),
      Attempt.countDocuments(),
      Scan.countDocuments(),
    ])

    res.json({ total_lessons, completed_lessons, quiz_count, attempts, scans })
  })
)

// GET /api/domain -> dominio por materia + próxima lección
router.get(
  '/domain',
  asyncHandler(async (req, res) => {
    const subjects = await Subject.find().sort({ _id: 1 })
    const attempts = await Attempt.find()

    const result = []
    for (const s of subjects) {
      const id = String(s._id)
      const lessons = await Lesson.find({ subject_id: id }).sort({ _id: 1 })
      const quizzes = await Quiz.find({ subject_id: id }).sort({ _id: 1 })
      result.push({
        id,
        name: s.name,
        emoji: s.emoji,
        color: s.color,
        domain: computeDomain(lessons, quizzes, attempts),
        lesson_count: lessons.length,
        completed_lessons: lessons.filter((l) => l.completed).length,
      })
    }

    let next_lesson = null
    for (const s of subjects) {
      const id = String(s._id)
      const lessons = await Lesson.find({ subject_id: id }).sort({ _id: 1 })
      const pending = lessons.find((l) => !l.completed)
      if (pending) {
        const subject = result.find((x) => x.id === id)
        next_lesson = {
          lesson_id: String(pending._id),
          title: pending.title,
          summary: pending.summary,
          duration_min: pending.duration_min,
          subject: subject ? subject.name : '',
          emoji: subject ? subject.emoji : '📚',
        }
        break
      }
    }

    res.json({ subjects: result, next_lesson })
  })
)

export default router
