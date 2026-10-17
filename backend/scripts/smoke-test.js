/**
 * Prueba de humo del backend: recorre todos los endpoints y reporta PASS/FAIL.
 *
 *   node scripts/smoke-test.js            (sin endpoints de IA)
 *   node scripts/smoke-test.js --with-ai  (incluye 1 llamada real a Ollama)
 *
 * El servidor debe estar corriendo (npm start).
 */
const BASE = process.env.BASE_URL || 'http://127.0.0.1:8000/api'
const WITH_AI = process.argv.includes('--with-ai')

let passed = 0
let failed = 0

const ok = (name, extra = '') => {
  passed++
  console.log(`  ✅ ${name}${extra ? ` — ${extra}` : ''}`)
}
const bad = (name, detail) => {
  failed++
  console.log(`  ❌ ${name} — ${detail}`)
}

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  return { status: res.status, data, headers: res.headers }
}

function check(name, condition, detail = '') {
  if (condition) ok(name, detail)
  else bad(name, detail || 'condición no cumplida')
  return condition
}

async function main() {
  console.log(`\n🧪 Smoke test contra ${BASE}${WITH_AI ? ' (con IA)' : ''}\n`)

  // --- Core ---
  const health = await call('GET', '/health')
  check('GET /health', health.status === 200 && 'ollama_available' in health.data, `ollama=${health.data.ollama_available}`)

  const user = await call('GET', '/user')
  check('GET /user', user.status === 200 && typeof user.data.xp === 'number', `xp=${user.data.xp} nivel=${user.data.level}`)

  const subjects = await call('GET', '/subjects')
  check('GET /subjects', subjects.status === 200 && subjects.data.length === 24, `${subjects.data.length} materias`)
  check('  UTF-8 correcto', /[áéíóúñ]/.test(subjects.data[0].name), `"${subjects.data[0].name}" ${subjects.data[0].emoji}`)
  check('  id string en cada materia', typeof subjects.data[0].id === 'string', subjects.data[0].id)

  const stats = await call('GET', '/stats')
  check('GET /stats', stats.status === 200 && stats.data.total_lessons > 0, `lecciones=${stats.data.total_lessons} quizzes=${stats.data.quiz_count}`)

  const domain = await call('GET', '/domain')
  check('GET /domain', domain.status === 200 && Array.isArray(domain.data.subjects), `${domain.data.subjects.length} materias`)

  // --- Lecciones / quizzes ---
  const sid = subjects.data[0].id
  const lessons = await call('GET', `/lessons?subject_id=${sid}`)
  check('GET /lessons?subject_id', lessons.status === 200 && lessons.data.length > 0, `${lessons.data.length} lecciones`)

  const complete = await call('POST', `/lessons/${lessons.data[0].id}/complete`)
  check('POST /lessons/:id/complete', complete.status === 200 && complete.data.xp_gained === 20, `+${complete.data.xp_gained} XP`)

  const quizzes = await call('GET', `/quizzes?subject_id=${sid}`)
  const quiz = quizzes.data[0]
  check('GET /quizzes?subject_id', quizzes.status === 200 && quiz.questions.length > 0, `${quizzes.data.length} quizzes`)
  check('  no filtra la respuesta correcta', !('correct' in quiz.questions[0]))

  const answers = quiz.questions.map((_, i) => i % 4)
  const submit = await call('POST', `/quizzes/${quiz.id}/submit`, { answers })
  check(
    'POST /quizzes/:id/submit',
    submit.status === 200 && submit.data.total === quiz.questions.length,
    `${submit.data.score}/${submit.data.total} (${submit.data.percentage}%) +${submit.data.xp_gained} XP`
  )

  // --- Errores con formato { detail } ---
  const notFound = await call('POST', '/quizzes/000000000000000000000000/submit', { answers: [] })
  check('404 con { detail }', notFound.status === 404 && typeof notFound.data.detail === 'string', notFound.data.detail)

  const badBody = await call('POST', `/quizzes/${quiz.id}/submit`, { answers: [1] })
  check('400 con { detail }', badBody.status === 400 && typeof badBody.data.detail === 'string', badBody.data.detail)

  const route404 = await call('GET', '/ruta-inexistente')
  check('404 ruta inexistente', route404.status === 404, route404.data.detail)

  // --- Corrección local (sin IA) ---
  const questions = [
    { q: '2+2', options: ['3', '4', '5', '6'], correct: 1, explain: 'suma básica' },
    { q: 'Capital de Francia', options: ['Roma', 'París', 'Madrid', 'Lima'], correct: 1, explain: 'geografía' },
  ]
  const mock = await call('POST', '/mock-exam/submit', { questions, answers: [1, 0] })
  check(
    'POST /mock-exam/submit',
    mock.status === 200 && mock.data.score === 1 && mock.data.weak_points.length === 1,
    `${mock.data.score}/${mock.data.total} · débiles: ${mock.data.weak_points.join(', ')}`
  )

  // --- ICFES ---
  const bank = await call('GET', '/icfes/bank')
  check(
    'GET /icfes/bank',
    bank.status === 200 && bank.data.questions.length === 250 && bank.data.total_preguntas === 250,
    `${bank.data.questions.length} preguntas · ${bank.data.total_minutos} min`
  )

  const icfesAnswers = {}
  for (const area of bank.data.areas) {
    const qs = bank.data.questions.filter((q) => q.area === area.key)
    icfesAnswers[area.key] = qs.map((_, i) => (i < qs.length / 2 ? 0 : null))
  }
  const icfes = await call('POST', '/icfes/submit', { answers: icfesAnswers })
  check(
    'POST /icfes/submit',
    icfes.status === 200 && typeof icfes.data.global.score === 'number',
    `global ${icfes.data.global.score} · nivel ${icfes.data.global.nivel} (${icfes.data.global.tag_nivel})`
  )
  const areasOk = Object.values(icfes.data.areas).every((a) => Array.isArray(a.details) && a.comment)
  check('  reporte por área con detalle y comentario', areasOk)

  // --- Planes ---
  const plans = await call('GET', '/plans')
  check('GET /plans', plans.status === 200 && Array.isArray(plans.data), `${plans.data.length} planes guardados`)

  // --- PDFs ---
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array([0x25, 0x50, 0x44, 0x46])], { type: 'application/pdf' }), 'apuntes física.pdf')
  const upRes = await fetch(`${BASE}/pdfs/upload`, { method: 'POST', body: form })
  const uploaded = await upRes.json()
  check('POST /pdfs/upload', upRes.status === 200 && uploaded.ok === true, uploaded.stored)

  const list = await call('GET', '/pdfs')
  check('GET /pdfs', list.status === 200 && list.data.pdfs.length >= 1, `${list.data.pdfs.length} archivo(s)`)

  const del = await call('DELETE', `/pdfs/${encodeURIComponent(uploaded.stored)}`)
  check('DELETE /pdfs/:name', del.status === 200 && del.data.ok === true)

  const missing = await call('GET', '/pdfs/no-existe.pdf/download')
  check('404 descarga inexistente', missing.status === 404, missing.data.detail)

  // --- Chat reset ---
  const reset = await call('POST', '/chat/reset')
  check('POST /chat/reset', reset.status === 200 && reset.data.ok === true)

  // --- IA (opcional) ---
  if (WITH_AI) {
    if (!health.data.ollama_available) {
      console.log('  ⏭️  IA omitida: Ollama no responde')
    } else {
      const started = Date.now()
      const explain = await call('POST', '/explain', { topic: 'qué es una fracción', level: 'principiante' })
      const secs = ((Date.now() - started) / 1000).toFixed(1)
      check(
        'POST /explain (Ollama)',
        explain.status === 200 && explain.data.ok === true && explain.data.content.length > 0,
        `${explain.data.content.length} chars en ${secs}s`
      )

      const resetChat = await call('POST', '/chat/reset')
      check('POST /chat/reset (tras IA)', resetChat.status === 200)
      const chat = await call('POST', '/chat', { message: 'Explícame en una frase qué es una fracción.' })
      check('POST /chat (Ollama)', chat.status === 200 && chat.data.ok === true, (chat.data.content || '').slice(0, 90) + '…')
    }
  }

  console.log(`\n${failed === 0 ? '✅' : '⚠️ '} ${passed} pruebas OK, ${failed} fallidas\n`)
  process.exitCode = failed === 0 ? 0 : 1
}

main().catch((err) => {
  console.error(`\n❌ Error inesperado: ${err.message}`)
  console.error('   ¿Está corriendo el servidor? -> npm start')
  process.exitCode = 1
})
