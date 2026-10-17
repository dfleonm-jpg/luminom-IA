/**
 * Puntaje ICFES (Saber 11) — equivalente a backend/app/icfes.py.
 * Misma metodología: theta por área -> escala 0-100 -> niveles oficiales.
 */

export const AREAS = [
  { key: 'lectura', name: 'Lectura Crítica', emoji: '📖', total: 41, minutes: 95 },
  { key: 'mate', name: 'Matemáticas', emoji: '📐', total: 50, minutes: 105 },
  { key: 'sociales', name: 'Sociales y Ciudadanas', emoji: '🌎', total: 50, minutes: 95 },
  { key: 'naturales', name: 'Ciencias Naturales', emoji: '🔬', total: 54, minutes: 100 },
  { key: 'ingles', name: 'Inglés', emoji: '🇬🇧', total: 55, minutes: 105 },
]

export const TOTAL_PREGUNTAS = AREAS.reduce((s, a) => s + a.total, 0)
export const TOTAL_MINUTOS = AREAS.reduce((s, a) => s + a.minutes, 0)

const AREA_PARAMS = {
  lectura: { a: 1.0, guessing: 0.25 },
  mate: { a: 1.15, guessing: 0.25 },
  sociales: { a: 1.0, guessing: 0.25 },
  naturales: { a: 1.05, guessing: 0.25 },
  ingles: { a: 0.95, guessing: 0.25 },
}

const NIVELES = [
  { r: [0, 25], n: 1, tag: 'Mínimo', desc: 'Desempeño mínimo' },
  { r: [25, 40], n: 2, tag: 'Insuficiente', desc: 'Desempeño insuficiente' },
  { r: [40, 65], n: 3, tag: 'Aprobado', desc: 'Desempeño aprobado' },
  { r: [65, 80], n: 4, tag: 'Sobresaliente', desc: 'Desempeño sobresaliente' },
  { r: [80, 101], n: 5, tag: 'Superior', desc: 'Desempeño superior' },
]

export const COMENTARIOS = {
  lectura: {
    1: 'Identifica la información literal de un texto sencillo, pero presenta dificultades para comprender ideas implícitas y la intención del autor. Se sugiere fortalecer la comprensión inferencial y crítica.',
    2: 'Comprende textos de estructura simple y reconoce algunas ideas secundarias, pero le cuesta relacionar información, interpretar lenguaje figurado y evaluar argumentos.',
    3: 'Comprende textos de diversa complejidad, identifica la tesis y los argumentos, y establece relaciones entre información explícita e implícita. Requiere mejorar el análisis crítico y la argumentación.',
    4: 'Interpreta con precisión textos complejos, identifica matices, supuestos y posturas ideológicas, y evalúa la validez de los argumentos. Desempeño sobresaliente.',
    5: 'Comprende y evalúa críticamente textos académicos y literarios de alta complejidad, identifica intencionalidades discursivas y construye juicios argumentados. Desempeño superior.',
  },
  mate: {
    1: 'Resuelve situaciones numéricas muy sencillas que demandan usar una única operación, pero presenta dificultad para modelar y abstraer problemas.',
    2: 'Aplica operaciones y propiedades básicas en contextos simples, pero le cuesta interpretar gráficas, plantear ecuaciones y justificar procedimientos.',
    3: 'Modela matemáticamente situaciones de mediana complejidad, usa registros de representación y comunica razonamientos. Requiere mayor rigurosidad en la argumentación.',
    4: 'Plantea y resuelve problemas que exigen integrar varios conceptos, traduce entre registros y justifica rigurosamente sus procedimientos.',
    5: 'Abstrae, generaliza y resuelve situaciones matemáticas de alta complejidad con argumentación formal y creatividad. Desempeño superior.',
  },
  sociales: {
    1: 'Identifica hechos históricos y geográficos básicos, pero presenta dificultad para relacionarlos con procesos sociales y políticos.',
    2: 'Reconoce algunos conceptos de las ciencias sociales y hechos relevantes, pero le cuesta analizar causas, consecuencias y perspectivas múltiples.',
    3: 'Analiza procesos históricos, geográficos y ciudadanos, identifica actores e intereses y comprende la dinámica de las sociedades. Requiere profundizar en la crítica.',
    4: 'Interpreta fuentes, compara perspectivas y analiza problemas sociales y ciudadanos con rigor conceptual e histórico.',
    5: 'Evalúa críticamente procesos sociales y políticos complejos, contrasta fuentes y propone análisis informados de la realidad. Desempeño superior.',
  },
  naturales: {
    1: 'Identifica conceptos científicos básicos y fenómenos cotidianos, pero presenta dificultad para explicarlos con principios de las ciencias.',
    2: 'Reconoce leyes y conceptos de las ciencias naturales en situaciones simples, pero le cuesta diseñar indagaciones y analizar datos.',
    3: 'Explica fenómenos naturales aplicando principios científicos, interpreta datos y usa el método de investigación. Requiere mejorar la justificación.',
    4: 'Analiza y explica fenómenos complejos, diseña experimentos y evalúa críticamente evidencias científicas. Desempeño sobresaliente.',
    5: 'Comprende y articula los grandes modelos de las ciencias naturales, diseña indagaciones rigurosas y argumenta con evidencia. Desempeño superior.',
  },
  ingles: {
    1: 'Comprende frases y vocabulario muy básico de uso frecuente en contextos simples.',
    2: 'Comprende textos cortos y sencillos sobre temas cotidianos, pero con vocabulario e ideas limitadas.',
    3: 'Comprende la idea principal y detalles de textos cotidianos y académicos básicos. Nivel B1 aproximado.',
    4: 'Comprende textos de media complejidad, infiere significados por contexto y maneja estructuras variadas. Nivel B1+.',
    5: 'Comprende textos auténticos de mayor complejidad, capta matices, intención y registro. Nivel B2 o superior.',
  },
}

function theta(aciertos, total) {
  const prop = total ? aciertos / total : 0
  return prop * 3.0 - 1.5
}

function nivelFor(score) {
  for (const nv of NIVELES) {
    if (score >= nv.r[0] && score < nv.r[1]) return nv
  }
  return NIVELES[NIVELES.length - 1]
}

export function areaScore(key, aciertos, total) {
  const a = AREA_PARAMS[key] || { a: 1.0, guessing: 0.25 }
  const th = theta(aciertos, total, a.guessing)
  let score = Math.round((50 + 32 * th + th ** 3 * 0.5) * 10) / 10
  score = Math.max(0, Math.min(100, score))
  const nivel = nivelFor(score)
  return {
    score,
    nivel: nivel.n,
    tag_nivel: nivel.tag,
    aciertos,
    total,
    porcentaje: total ? Math.round((aciertos / total) * 1000) / 10 : 0,
  }
}

export function comentario(key, nivel) {
  return (COMENTARIOS[key] || {})[nivel] || ''
}

export function globalScore(byArea) {
  const scores = AREAS.map((a) => byArea[a.key].score)
  const globalSc = Math.round((scores.reduce((s, x) => s + x, 0) / scores.length) * 10) / 10
  const nv = nivelFor(globalSc)
  return { score: globalSc, nivel: nv.n, tag_nivel: nv.tag }
}

/** answersByArea: { area_key: [índice elegido o null] } */
export function computeTotal(answersByArea) {
  const report = {}
  for (const a of AREAS) {
    const info = answersByArea[a.key] || {}
    const aciertos = info.aciertos || 0
    const total = info.total ?? a.total
    const sc = areaScore(a.key, aciertos, total)
    sc.comment = comentario(a.key, sc.nivel)
    report[a.key] = sc
  }
  const g = globalScore(report)
  return { areas: report, global: g, total_preguntas: TOTAL_PREGUNTAS }
}
