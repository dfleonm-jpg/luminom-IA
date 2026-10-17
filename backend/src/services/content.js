/**
 * Carga (y cachea) los datos estáticos migrados del backend Python:
 *  - data/content.json    -> lecciones y quizzes base (tutor_content.py)
 *  - data/icfes_bank.json -> banco oficial de 250 preguntas (banco_icfes.py)
 */
import fs from 'node:fs'
import { CONTENT_FILE, ICFES_BANK_FILE } from '../config/env.js'

let contentCache = null
let bankCache = null

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (err) {
    console.warn(`⚠️  No pude leer ${file}: ${err.message}`)
    return fallback
  }
}

export function getContent() {
  if (!contentCache) {
    contentCache = readJson(CONTENT_FILE, { BASE_LESSONS: {}, BASE_QUIZZES: {} })
  }
  return contentCache
}

export function getIcfesBank() {
  if (!bankCache) bankCache = readJson(ICFES_BANK_FILE, [])
  return bankCache
}
