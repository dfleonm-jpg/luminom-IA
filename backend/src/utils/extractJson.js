/**
 * Extrae el primer JSON válido de una respuesta del modelo (puerto de tutor.py)
 * añadiendo tolerancia a los errores típicos de un LLM:
 *   - bloques ```json ... ``` alrededor
 *   - comas finales y caracteres de control crudos
 *   - LaTeX con barra invertida simple dentro de las cadenas (\( \frac{1}{3} \))
 *     que rompe JSON.stringify/parse
 *   - el JSON devuelto como string ("{\"a\": 1}")
 */

// Comandos LaTeX habituales: su barra invertida debe conservarse.
const LATEX_COMMANDS = new Set([
  'frac', 'sqrt', 'times', 'div', 'cdot', 'pm', 'mp', 'leq', 'geq', 'neq', 'ne',
  'approx', 'sim', 'simeq', 'equiv', 'propto', 'sum', 'prod', 'int', 'infty',
  'partial', 'nabla', 'vec', 'hat', 'bar', 'dot', 'ddot', 'overline', 'underline',
  'binom', 'angle', 'degree', 'circ', 'percent', 'text', 'textbf', 'textit',
  'mathrm', 'mathbf', 'left', 'right', 'begin', 'end', 'quad', 'qquad', 'space',
  'ldots', 'cdots', 'dots', 'alpha', 'beta', 'gamma', 'delta', 'epsilon',
  'varepsilon', 'zeta', 'eta', 'theta', 'vartheta', 'iota', 'kappa', 'lambda',
  'mu', 'nu', 'xi', 'pi', 'varpi', 'rho', 'varrho', 'sigma', 'varsigma', 'tau',
  'upsilon', 'phi', 'varphi', 'chi', 'psi', 'omega', 'Gamma', 'Delta', 'Theta',
  'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon', 'Phi', 'Psi', 'Omega',
])

function escapeLatexCommands(chunk) {
  return chunk.replace(/\\([a-zA-Z]{2,})/g, (whole, word) =>
    LATEX_COMMANDS.has(word) ? `\\\\${word}` : whole
  )
}

function escapeInvalidEscapes(chunk) {
  return chunk
    // \u sin 4 dígitos hexadecimales (\uparrow, \underbrace…)
    .replace(/\\u(?![0-9a-fA-F]{4})/g, '\\\\u')
    // escapes que no existen en JSON: \( \) \{ \} \[ \] \: \, \; \!
    .replace(/\\(?!["\\/bfnrtu])/g, '\\\\')
}

function cleanup(chunk) {
  return chunk
    .replace(/,\s*([\]}])/g, '$1')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1f]/g, ' ')
}

function escapeAllBackslashes(chunk) {
  return chunk.replace(/\\(?!["\\/])/g, '\\\\')
}

/** Variantes reparadas, de la menos a la más agresiva. */
function* repairs(chunk) {
  yield cleanup(escapeInvalidEscapes(escapeLatexCommands(chunk)))
  yield cleanup(escapeInvalidEscapes(chunk))
  yield cleanup(escapeAllBackslashes(chunk))
}

export function extractJson(text) {
  if (!text) throw new Error('respuesta vacía')

  // 0) La respuesta entera ya es JSON (o un JSON metido dentro de un string)
  const whole = tryParse(text.trim())
  if (whole !== null && typeof whole === 'object') return whole
  if (typeof whole === 'string') {
    const inner = tryParse(whole)
    if (inner !== null && typeof inner === 'object') return inner
  }

  const candidates = []
  let start = 0
  while (true) {
    start = text.indexOf('{', start)
    if (start === -1) break

    let depth = 0
    let end = -1
    for (let i = start; i < text.length; i++) {
      if (text[i] === '{') depth++
      else if (text[i] === '}') {
        depth--
        if (depth === 0) {
          end = i + 1
          break
        }
      }
    }
    if (end === -1) break
    candidates.push(text.slice(start, end))
    start = end
  }

  if (!candidates.length) throw new Error('no se encontró JSON')

  // 1) se prueba el candidato más largo primero (el JSON completo)
  const ordered = [...candidates].sort((a, b) => b.length - a.length)
  for (const chunk of ordered) {
    const parsed = tryParse(chunk)
    if (parsed !== null) return parsed
  }
  throw new Error('JSON inválido en la respuesta')
}

export function tryParse(chunk) {
  // Tal cual
  try {
    return JSON.parse(chunk)
  } catch {
    /* seguimos */
  }

  // Variantes reparadas
  for (const candidate of repairs(chunk)) {
    try {
      return JSON.parse(candidate)
    } catch {
      /* seguimos */
    }
  }

  // El modelo devolvió el JSON como string
  try {
    return JSON.parse(JSON.parse(chunk))
  } catch {
    /* seguimos */
  }
  return null
}
