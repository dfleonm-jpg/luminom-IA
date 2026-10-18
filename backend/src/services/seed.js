import { Account, Lesson, Quiz, Subject } from '../models/index.js'
import { DEFAULT_SUBJECTS } from '../config/subjects.js'
import { BOOTSTRAP_ADMIN } from '../config/env.js'
import { getContent } from './content.js'
import { hashPassword } from './auth.js'
import { getUser, nowIso } from './state.js'

/** Crea/asegura la cuenta admin inicial a partir de BOOTSTRAP_ADMIN ("email:pass:Nombre"). */
async function seedAdmin() {
  if (!BOOTSTRAP_ADMIN) return
  const idx1 = BOOTSTRAP_ADMIN.indexOf(':')
  const idx2 = BOOTSTRAP_ADMIN.indexOf(':', idx1 + 1)
  if (idx1 < 0 || idx2 < 0) return
  const email = BOOTSTRAP_ADMIN.slice(0, idx1).trim().toLowerCase()
  const password = BOOTSTRAP_ADMIN.slice(idx1 + 1, idx2)
  const name = BOOTSTRAP_ADMIN.slice(idx2 + 1).trim()
  if (!email || !password) return

  const existing = await Account.findOne({ email })
  if (existing) {
    // Asegura que siga siendo admin (por si se registró como user)
    if (existing.role !== 'admin') {
      existing.role = 'admin'
      await existing.save()
      console.log(`🔑 Cuenta ${email} promovida a admin`)
    }
    return
  }
  await Account.create({ email, passwordHash: hashPassword(password), name, role: 'admin' })
  console.log(`🔑 Admin inicial creado: ${email}`)
}

/** Crea el usuario, las materias y el contenido base la primera vez. */
export async function seed() {
  await getUser()
  await seedAdmin()

  if ((await Subject.estimatedDocumentCount()) === 0) {
    await Subject.insertMany(DEFAULT_SUBJECTS)
    console.log(`🌱 ${DEFAULT_SUBJECTS.length} materias insertadas`)
  }

  const subjects = await Subject.find().sort({ _id: 1 })
  const byName = new Map(subjects.map((s) => [s.name, s]))
  const { BASE_LESSONS = {}, BASE_QUIZZES = {} } = getContent()

  if ((await Lesson.estimatedDocumentCount()) === 0) {
    const docs = []
    for (const [subjectName, lessons] of Object.entries(BASE_LESSONS)) {
      const subject = byName.get(subjectName)
      if (!subject) continue
      for (const lesson of lessons) {
        docs.push({
          subject_id: String(subject._id),
          title: lesson.title,
          content: lesson.content || '',
          summary: lesson.summary || '',
          duration_min: lesson.duration_min || 10,
          is_ai: false,
          completed: false,
        })
      }
    }
    if (docs.length) {
      await Lesson.insertMany(docs)
      console.log(`🌱 ${docs.length} lecciones base insertadas`)
    }
  }

  if ((await Quiz.estimatedDocumentCount()) === 0) {
    const docs = []
    for (const [subjectName, quizzes] of Object.entries(BASE_QUIZZES)) {
      const subject = byName.get(subjectName)
      if (!subject) continue
      for (const quiz of quizzes) {
        docs.push({
          subject_id: String(subject._id),
          title: quiz.title,
          questions: quiz.questions || [],
          is_ai: false,
          created_at: nowIso(),
        })
      }
    }
    if (docs.length) {
      await Quiz.insertMany(docs)
      console.log(`🌱 ${docs.length} quizzes base insertados`)
    }
  }
}
