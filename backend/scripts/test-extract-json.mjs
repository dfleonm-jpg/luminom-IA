/**
 * Pruebas del parser de JSON tolerante a respuestas de LLM.
 *   node scripts/test-extract-json.mjs   (o npm test)
 */
import { extractJson } from '../src/utils/extractJson.js'

let pass = 0
let fail = 0

function same(name, fn, check) {
  try {
    const value = fn()
    if (check(value)) {
      pass++
      console.log(`  ✅ ${name}`)
    } else {
      fail++
      console.log(`  ❌ ${name} — resultado inesperado: ${JSON.stringify(value)}`)
    }
  } catch (err) {
    fail++
    console.log(`  ❌ ${name} — lanzó: ${err.message}`)
  }
}

// 1. JSON limpio
same('JSON limpio', () => extractJson('{"title":"Plan","days":[]}'), (v) => v.title === 'Plan')

// 2. Respuesta real de /plans (envuelta en ```json)
const PLAN_RAW = `\`\`\`json
{
  "title": "Plan de estudio para fracciones hasta el examen del 2026-11-05",
  "days": [
    {"day": 1, "date": "lun 10", "topic": "Introducción a las fracciones", "tasks": ["Definición", "Partes"], "minutes": 45},
    {"day": 2, "date": "mar 11", "topic": "Tipos de fracciones", "tasks": ["Unitarias", "Mixtas"], "minutes": 45}
  ]
}
\`\`\``
same('Plan con vallas ```json', () => extractJson(PLAN_RAW), (v) => v.days.length === 2 && v.title.startsWith('Plan'))

// 3. Respuesta real de /mock-exam: LaTeX con barras simples (\( \) \frac \times \div)
const MOCK_RAW = `{
  "title": "Simulacro de Examen de Matemáticas sobre Fracciones",
  "questions": [
    {
      "q": "¿Cuál es el resultado de sumar las fracciones \\( \\frac{1}{3} + \\frac{2}{5} \\)?",
      "options": ["a) \\( \\frac{5}{15} \\)", "b) \\( \\frac{7}{15} \\)", "c) \\( \\frac{7}{8} \\)", "d) \\( \\frac{5}{8} \\)"],
      "correct": 1,
      "explain": "Se multiplica \\( \\frac{3}{4} \\times \\frac{2}{3} \\) y se divide entre 2."
    }
  ]
}`
same(
  'LaTeX con barras simples',
  () => extractJson(MOCK_RAW),
  (v) => v.questions[0].q.includes('\\frac{1}{3}') && v.questions[0].options.length === 4
)

// 4. Comas finales + texto alrededor
same(
  'Comas finales y texto extra',
  () => extractJson('Claro, aquí tienes:\n{"a": 1, "b": [1, 2,],}\n¡Espero que sirva!'),
  (v) => v.a === 1 && v.b.length === 2
)

// 5. JSON devuelto como string
same('JSON dentro de un string', () => extractJson('"{\\"ok\\": true, \\"n\\": 3}"'), (v) => v.n === 3)

// 6. Los saltos de línea escapados (\n como barra + n) NO se dañan
same(
  'Salto de línea \\n intacto',
  () => extractJson('{"explain": "Primero:\\nRestamos los numeradores."}'),
  (v) => v.explain.includes('\n') && v.explain.endsWith('numeradores.')
)

// 7. Varios objetos: se elige el JSON completo (el más largo)
same(
  'Elige el objeto completo',
  () => extractJson('{"nota": {"x": 1}} y luego {"title": "Quiz", "questions": [{"q": "a", "correct": 0}]}'),
  (v) => Array.isArray(v.questions)
)

console.log(`\n${fail === 0 ? '✅' : '⚠️ '} ${pass} pruebas OK, ${fail} fallidas\n`)
process.exitCode = fail === 0 ? 0 : 1
