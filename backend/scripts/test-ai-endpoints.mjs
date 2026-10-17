// Valida TODOS los endpoints que piden JSON al modelo (los que fallaban antes).
import fs from 'node:fs'

const BASE = 'http://127.0.0.1:8000/api'
const t = () => new Date().toISOString().slice(11, 19)
let ok = 0
let ko = 0

async function call(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  try {
    return { status: res.status, data: JSON.parse(text) }
  } catch {
    return { status: res.status, data: text }
  }
}

function report(name, condition, detail) {
  if (condition) {
    ok++
    console.log(`  ✅ ${name} — ${detail}`)
  } else {
    ko++
    console.log(`  ❌ ${name} — ${detail}`)
  }
}

const subjects = (await call('GET', '/subjects')).data
const matematicas = subjects.find((s) => s.name === 'Matemáticas')

// 1. Plan de estudio (antes fallaba)
console.log(`\n[${t()}] POST /plans`)
let r = await call('POST', '/plans', { subject: 'Matemáticas', exam_date: '2026-11-05', topics: ['fracciones'], hours_per_day: 2 })
report('/plans', r.status === 200 && r.data.ok && Array.isArray(r.data.days) && r.data.days.length >= 5,
  `"${r.data.title}" · ${r.data.days?.length} días · 1er día: "${r.data.days?.[0]?.topic}" · +${r.data.xp_gained} XP`)
if (r.status !== 200) console.log('     detalle:', r.data.detail || r.data.error)

const plans = (await call('GET', '/plans')).data
report('GET /plans guardó el plan', plans.length >= 1 && plans[0].data.days.length >= 5, `${plans.length} plan(es) en MongoDB`)

// 2. Simulacro (antes fallaba por LaTeX)
console.log(`[${t()}] POST /mock-exam`)
r = await call('POST', '/mock-exam', { subject: 'Matemáticas', topic: 'fracciones', minutes: 10 })
const exam = r.data
report('/mock-exam', r.status === 200 && Array.isArray(exam.questions) && exam.questions.length >= 4,
  `"${exam.title}" · ${exam.questions?.length} preguntas`)
if (r.status !== 200) console.log('     detalle:', exam.detail || exam.error)
else {
  const conLatex = exam.questions.filter((q) => /\\[a-zA-Z(]/.test(JSON.stringify(q))).length
  console.log(`     ${conLatex} preguntas con LaTeX preservado; ejemplo: ${exam.questions[0].q.slice(0, 90)}`)
  const answers = exam.questions.map((q) => q.correct ?? 0)
  const corr = await call('POST', '/mock-exam/submit', { questions: exam.questions, answers })
  report('POST /mock-exam/submit', corr.status === 200 && corr.data.score === exam.questions.length,
    `${corr.data.score}/${corr.data.total} (${corr.data.percentage}%) · +${corr.data.xp_gained} XP`)
}

// 3. Flashcards
console.log(`[${t()}] POST /flashcards`)
r = await call('POST', '/flashcards', { subject: 'Biología', topic: 'la célula' })
report('/flashcards', r.status === 200 && Array.isArray(r.data.cards) && r.data.cards.length > 0,
  `${r.data.cards?.length} tarjetas · ejemplo: "${r.data.cards?.[0]?.front?.slice(0, 60)}" · +${r.data.xp_gained} XP`)
if (r.status !== 200) console.log('     detalle:', r.data.detail || r.data.error)

// 4. Examen oral + evaluación
console.log(`[${t()}] POST /oral`)
r = await call('POST', '/oral', { subject: 'Historia', topic: 'independencia de Colombia' })
const oral = r.data
report('/oral', r.status === 200 && Array.isArray(oral.questions) && oral.questions.length > 0,
  `${oral.questions?.length} preguntas · 1ª: "${oral.questions?.[0]?.q?.slice(0, 70)}"`)

if (r.status === 200 && oral.questions?.length) {
  console.log(`[${t()}] POST /oral/evaluate`)
  const q = oral.questions[0]
  const ev = await call('POST', '/oral/evaluate', { question: q.q, answer: 'Fue en 1810 cuando se formaron las juntas de gobierno.', ideal: q.ideal })
  report('/oral/evaluate', ev.status === 200 && typeof ev.data.grade === 'number',
    `nota ${ev.data.grade} · tip: "${(ev.data.tip || '').slice(0, 60)}" · +${ev.data.xp_gained} XP`)
  if (ev.status !== 200) console.log('     detalle:', ev.data.detail || ev.data.error)
}

// 5. Juego de memoria
console.log(`[${t()}] POST /memory`)
r = await call('POST', '/memory', { subject: 'Química', topic: 'tabla periódica' })
report('/memory', r.status === 200 && Array.isArray(r.data.pairs) && r.data.pairs.length > 0,
  `${r.data.pairs?.length} pares · ejemplo: "${r.data.pairs?.[0]?.term}" = "${r.data.pairs?.[0]?.definition?.slice(0, 40)}"`)
if (r.status !== 200) console.log('     detalle:', r.data.detail || r.data.error)

// 6. Explicar
console.log(`[${t()}] POST /explain`)
r = await call('POST', '/explain', { topic: 'la fotosíntesis', level: 'principiante' })
report('/explain', r.status === 200 && r.data.content?.length > 100, `${r.data.content?.length} chars · +${r.data.xp_gained} XP`)

// 7. Scan (visión) con una imagen real generada en disco
console.log(`[${t()}] POST /scan (modelo de visión)`)
const imgPath = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\apuntes.png`
if (fs.existsSync(imgPath)) {
  const image = fs.readFileSync(imgPath).toString('base64')
  const scan = await call('POST', '/scan', { image })
  const analysis = scan.data.analysis || ''
  report('/scan', scan.status === 200 && analysis.length > 40,
    `${analysis.length} chars · menciona "fotosíntesis": ${/fotos/i.test(analysis)} · +${scan.data.xp_gained} XP`)
  if (scan.status !== 200) console.log('     detalle:', scan.data.detail || scan.data.error)
  else console.log(`     primeras líneas: ${analysis.slice(0, 160).replace(/\n/g, ' ')}…`)
} else {
  console.log('  ⏭️  /scan omitido (no existe la imagen de prueba)')
}

console.log(`\n[${t()}] ${ko === 0 ? '✅' : '⚠️ '} ${ok} endpoints IA OK, ${ko} fallidos\n`)
process.exitCode = ko === 0 ? 0 : 1
