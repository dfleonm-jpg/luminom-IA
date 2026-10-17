/**
 * Lógica del tutor Astra — equivalente a backend/app/tutor.py.
 * Cada función devuelve { ok, ... } igual que el backend original.
 */
import * as ai from './ai.js'
import { extractJson } from '../utils/extractJson.js'

export const TUTOR_SYSTEM = `Eres "Astra", un tutor de IA amable, motivador y claro que habla español.
Normas:
- Explica siempre paso a paso con ejemplos concretos.
- Usa un tono cercano y motivador.
- Si el estudiante responde mal, explícale con paciencia y dale otra oportunidad.
- Adapta la dificultad al nivel del estudiante.
- Usa formato simple con **negritas** y listas; NO uses tablas complejas.
- Si preguntan algo fuera de lo académico, vuelve amablemente al estudio.`

export async function chat(messages, user) {
  const last = messages[messages.length - 1]
  if (!last) return { ok: false, content: 'Empecemos: escríbeme una duda 🌟', using_ai: false }

  const context =
    `El estudiante tiene nivel ${user.level}, ${user.xp} XP ` +
    `y una racha de ${user.streak} días de estudio.\n`

  try {
    const response = await ai.generate(last.content, {
      system: `${TUTOR_SYSTEM}\n${context}`,
      temperature: 0.7,
      timeout: 600,
    })
    return { ok: true, content: response, using_ai: true }
  } catch (e) {
    return { ok: false, content: `No pude contactar a la IA local: ${e.message}`, using_ai: false }
  }
}

const subjectLine = (topic) => (topic ? ` sobre '${topic}'` : '')

export async function generateLesson(subjectName, topic) {
  const prompt =
    `Crea una lección${subjectLine(topic)} de la materia '${subjectName}' ` +
    'para un estudiante de secundaria/bachillerato.\n' +
    'Responde SOLO con JSON válido con esta forma exacta:\n' +
    '{"title": "Título", "summary": "resumen de 1 línea", ' +
    '"content": "la lección completa en Markdown, con secciones ## y ejemplos", ' +
    '"duration_min": 10}'
  try {
    const raw = await ai.generate(prompt, {
      system: 'Eres un profesor experto que genera material didáctico.',
      temperature: 0.6,
    })
    const data = extractJson(raw)
    return {
      ok: true,
      title: data.title || 'Lección',
      summary: data.summary || '',
      content: data.content || '',
      duration_min: Number(data.duration_min || 10) || 10,
    }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function generateQuiz(subjectName, topic, n = 5) {
  const prompt =
    `Genera un quiz de ${n} preguntas de opción múltiple de '${subjectName}'${subjectLine(topic)}.\n` +
    'Responde SOLO con JSON válido con esta forma exacta:\n' +
    '{"title": "Nombre del quiz", "questions": [' +
    '{"q": "pregunta", "options": ["a","b","c","d"], "correct": 0}' +
    ']}\n' +
    "'correct' es el índice (0-3) de la opción correcta."

  for (const attempt of [0, 1]) {
    try {
      const strict = attempt === 1
      const raw = await ai.generate(
        strict
          ? prompt + '\nIMPORTANTE: Devuelve SOLO JSON válido, sin texto extra y sin errores de sintaxis.'
          : prompt,
        {
          system: strict
            ? 'Eres un profesor que diseña exámenes. Solo respondes con JSON válido.'
            : 'Eres un profesor que diseña exámenes.',
          temperature: strict ? 0.2 : 0.6,
          timeout: 600,
        }
      )
      const data = extractJson(raw)
      const qs = data.questions || []
      if (!qs.length) throw new Error('sin preguntas')
      return { ok: true, title: data.title || 'Quiz generado', questions: qs.slice(0, n) }
    } catch (e) {
      if (attempt === 1) return { ok: false, error: e.message }
    }
  }
  return { ok: false, error: 'Error generando quiz' }
}

export async function explainTopic(topic, level = 'principiante') {
  const prompt =
    `Explica '${topic}' a un estudiante ${level}.\n` +
    'Usa ejemplos, pasos claros y termina con una pregunta de práctica. Máximo 400 palabras.'
  try {
    const text = await ai.generate(prompt, {
      system: TUTOR_SYSTEM,
      temperature: 0.6,
      timeout: 600,
    })
    return { ok: true, content: text }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function scanNotes(imageB64) {
  const prompt =
    'Esta es una foto de apuntes o notas de estudio. Extrae el texto legible y organiza el contenido.\n' +
    'Devuelve: 1) TEMAS: lista de temas principales. 2) RESUMEN claro en español.\n' +
    '3) PREGUNTAS: 3 preguntas que el estudiante debería poder responder con estos apuntes.'
  try {
    const text = await ai.vision(imageB64, prompt, { timeout: 600 })
    return { ok: true, analysis: text }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function predictExam(subject, history, topics, daysLeft) {
  const histLines =
    history
      .slice(0, 10)
      .map((h) => `- ${h.title || ''}: ${h.score ?? 0}/${h.total ?? 1}`)
      .join('\n') || '- Sin intentos registrados aún'

  const prompt =
    `Materia: ${subject}. Días hasta el examen: ${daysLeft}.\n` +
    `Temas del examen: ${topics && topics.length ? topics.join(', ') : 'sin especificar'}.\n` +
    `Historial de quizzes: \n${histLines}\n\n` +
    'Como tutor, calcula una predicción realista de la nota (0-10) y un análisis.\n' +
    'Responde SOLO con JSON:\n' +
    '{"predicted_grade": 7.5, "risk": "bajo|medio|alto", ' +
    '"analysis": "explicación breve", ' +
    '"advice": ["consejo 1", "consejo 2", "consejo 3"]}'

  try {
    const raw = await ai.generate(prompt, {
      system: 'Eres un tutor experto en análisis de rendimiento académico.',
      temperature: 0.4,
      timeout: 600,
    })
    const data = extractJson(raw)
    return {
      ok: true,
      ...data,
      predicted_grade: data.predicted_grade ?? 7.0,
      risk: data.risk ?? 'medio',
      analysis: data.analysis ?? '',
      advice: data.advice ?? [],
    }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function createPlan(subject, examDate, topics, hoursPerDay) {
  const prompt =
    `El estudiante quiere preparar un examen de ${subject}.` +
    `El examen es el ${examDate}, estudia ${hoursPerDay} horas/día.` +
    `Temas: ${topics && topics.length ? topics.join(', ') : 'a definir'}.\n` +
    'Crea un plan de estudio día a día hasta el examen.\n' +
    'Responde SOLO con JSON:\n' +
    '{"title": "Plan para ...", "days": [' +
    '{"day": 1, "date": "lun 10", "topic": "tema", ' +
    '"tasks": ["tarea 1", "tarea 2"], "minutes": 45}' +
    ']}\n' +
    'Genera entre 5 y 10 días.'
  try {
    const raw = await ai.generate(prompt, {
      system: 'Eres un coach de estudio experto.',
      temperature: 0.5,
      timeout: 600,
    })
    const data = extractJson(raw)
    const days = data.days || []
    if (!days.length) throw new Error('sin días')
    return { ok: true, title: data.title || 'Plan de estudio', days }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function generateFlashcards(subjectName, topic, n = 8) {
  const prompt =
    `Crea ${n} tarjetas de estudio (flashcards) de '${subjectName}'${subjectLine(topic)} ` +
    'para memorizar conceptos clave.\n' +
    'Responde SOLO con JSON válido:\n' +
    '{"cards": [{"front": "pregunta o concepto", "back": "respuesta clara y breve"}]}'

  for (const attempt of [0, 1]) {
    try {
      const strict = attempt === 1
      const raw = await ai.generate(
        strict ? prompt + '\nDevuelve SOLO JSON válido, sin texto extra.' : prompt,
        {
          system: strict
            ? 'Eres un profesor. Solo respondes JSON válido.'
            : 'Eres un profesor experto en crear tarjetas de memorización.',
          temperature: strict ? 0.2 : 0.6,
          timeout: 600,
        }
      )
      const data = extractJson(raw)
      const cards = data.cards || []
      if (!cards.length) throw new Error('sin tarjetas')
      return { ok: true, cards: cards.slice(0, n) }
    } catch (e) {
      if (attempt === 1) return { ok: false, error: e.message }
    }
  }
  return { ok: false, error: 'Error generando tarjetas' }
}

export async function generateMockExam(subjectName, topic, n = 6) {
  const prompt =
    `Genera un simulacro de examen de ${n} preguntas de opción múltiple de '${subjectName}'${subjectLine(topic)} ` +
    'similar a un examen real de secundaria/bachillerato.\n' +
    'Responde SOLO con JSON válido:\n' +
    '{"title": "Simulacro ...", "questions": [' +
    '{"q": "pregunta", "options": ["a","b","c","d"], "correct": 0, "explain": "breve explicación"}' +
    ']}'

  for (const attempt of [0, 1]) {
    try {
      const strict = attempt === 1
      const raw = await ai.generate(
        strict
          ? prompt + '\nIMPORTANTE: solo JSON válido, sin errores de sintaxis ni texto extra.'
          : prompt,
        {
          system: strict ? 'Eres un profesor. Solo respondes JSON válido.' : 'Eres un profesor que diseña exámenes reales.',
          temperature: strict ? 0.2 : 0.6,
          timeout: 600,
        }
      )
      const data = extractJson(raw)
      const qs = data.questions || []
      if (!qs.length) throw new Error('sin preguntas')
      return { ok: true, title: data.title || 'Simulacro', questions: qs.slice(0, n) }
    } catch (e) {
      if (attempt === 1) return { ok: false, error: e.message }
    }
  }
  return { ok: false, error: 'Error generando simulacro' }
}

export async function generateOralExam(subjectName, topic, n = 5) {
  const prompt =
    `Genera ${n} preguntas de examen oral de '${subjectName}'${subjectLine(topic)} ` +
    'que un profesor haría en voz alta (preguntas abiertas).\n' +
    'Responde SOLO con JSON válido:\n' +
    '{"title": "Examen oral ...", "questions": [' +
    '{"q": "pregunta abierta", "ideal": "respuesta ideal corta que se espera"}' +
    ']}'
  try {
    const raw = await ai.generate(prompt, {
      system: 'Eres un profesor que evalúa exámenes orales.',
      temperature: 0.6,
      timeout: 600,
    })
    const data = extractJson(raw)
    const qs = data.questions || []
    if (!qs.length) throw new Error('sin preguntas')
    return { ok: true, title: data.title || 'Examen oral', questions: qs.slice(0, n) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function evaluateOralAnswer(question, answer, ideal) {
  const idealLine = ideal ? `\nRespuesta esperada aproximada: ${ideal}` : ''
  const prompt =
    `Pregunta de examen oral: ${question}${idealLine}\n\n` +
    `Respuesta del estudiante: ${answer}\n\n` +
    'Evalúa como profesor: nota del 0 al 10 y breve retroalimentación con qué falta mejorar.\n' +
    'Responde SOLO con JSON:\n' +
    '{"grade": 7.5, "feedback": "breve retroalimentación", "tip": "consejo para mejorar"}'
  try {
    const raw = await ai.generate(prompt, {
      system: 'Eres un profesor justo y motivador que evalúa exámenes orales.',
      temperature: 0.3,
      timeout: 600,
    })
    const data = extractJson(raw)
    return {
      ok: true,
      grade: Math.round(Number(data.grade ?? 5.0) * 10) / 10,
      feedback: data.feedback || '',
      tip: data.tip || '',
    }
  } catch {
    return { ok: false, error: 'No pude evaluar la respuesta.' }
  }
}

export async function generateMemoryGame(subjectName, topic, n = 6) {
  const prompt =
    `Crea ${n} pares para un juego de memoria de '${subjectName}'${subjectLine(topic)}. ` +
    'Cada par: un término y su definición CORTA (máx 15 palabras).\n' +
    'Responde SOLO con JSON válido:\n' +
    '{"pairs": [{"term": "término", "definition": "definición corta"}]}'
  try {
    const raw = await ai.generate(prompt, {
      system: 'Eres un profesor que crea juegos educativos.',
      temperature: 0.6,
      timeout: 600,
    })
    const data = extractJson(raw)
    const pairs = data.pairs || []
    if (!pairs.length) throw new Error('sin pares')
    return { ok: true, pairs: pairs.slice(0, n) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

/** Dominio (0-100%) por materia. */
export function computeDomain(lessons, quizzes, attempts) {
  const total = lessons.length + (quizzes ? quizzes.length : 0)
  if (!total) return 0

  let done = lessons.filter((l) => l.completed).length
  done += (quizzes || []).filter((q) =>
    attempts.some((a) => String(a.quiz_id) === String(q.id ?? q._id))
  ).length

  return Math.round((done / total) * 100)
}
