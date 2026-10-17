import { Lesson, Quiz, Subject } from '../models/index.js'
import { DEFAULT_SUBJECTS } from '../config/subjects.js'
import { getContent } from './content.js'
import { getUser, nowIso } from './state.js'

/** Crea el usuario, las materias y el contenido base la primera vez. */
export async function seed() {
  await getUser()

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
