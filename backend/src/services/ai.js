/**
 * Cliente de IA — Groq (nube, por defecto) con fallback a Ollama (local).
 *
 * Mantiene la MISMA interfaz que usaba el backend original:
 *   - generate(prompt, { system, model, temperature, timeout })
 *   - vision(imageB64, prompt, { model, timeout })
 *   - health()
 * así que routes/core.js y services/tutor.js funcionan sin cambios.
 *
 * La API key de Groq se lee SOLO del entorno (.env) — nunca va en el código
 * ni se expone al navegador (las llamadas salen desde el servidor).
 */
import {
  AI_PROVIDER,
  GROQ_API_KEY,
  GROQ_BASE_URL,
  GROQ_CHAT_MODEL,
  GROQ_VISION_MODEL,
} from '../config/env.js'
import * as ollama from './ollama.js'

// Orden de preferencia de modelos de chat (del mejor al más ligero).
// Se elige el primero que esté habilitado en TU cuenta de Groq.
const GROQ_CHAT_PREFS = [
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3-32b',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
]

// Modelos multimodales (visión) de Groq, por preferencia.
const GROQ_VISION_PREFS = [
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'meta-llama/llama-4-maverick-17b-128e-instruct',
]

const useGroq = () => AI_PROVIDER === 'groq' && Boolean(GROQ_API_KEY)
const base = () => GROQ_BASE_URL.replace(/\/$/, '')

let modelCache = null // lista de ids de modelos disponibles en la cuenta
let chatModelCache = null
let visionModelCache = null

async function groqFetch(pathname, { method = 'GET', body, timeoutMs = 60000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(base() + pathname, {
      method,
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    const text = await res.text()
    let json
    try {
      json = text ? JSON.parse(text) : {}
    } catch {
      json = { raw: text }
    }
    if (!res.ok) {
      const msg = json?.error?.message || json?.raw || `Groq respondió ${res.status}`
      const err = new Error(msg)
      err.status = res.status === 401 ? 502 : res.status
      throw err
    }
    return json
  } finally {
    clearTimeout(timer)
  }
}

/** Lista de modelos habilitados en la cuenta (cacheada). */
async function listModels() {
  if (modelCache) return modelCache
  try {
    const data = await groqFetch('/models', { timeoutMs: 8000 })
    modelCache = (data.data || []).map((m) => m.id)
  } catch {
    modelCache = []
  }
  return modelCache
}

function pick(prefs, available, fallback) {
  for (const p of prefs) if (available.includes(p)) return p
  // Si no detectamos lista (cuenta sin /models accesible), usa la 1ª preferencia
  return available.length === 0 ? prefs[0] : fallback || prefs[0]
}

async function resolveChatModel() {
  if (GROQ_CHAT_MODEL) return GROQ_CHAT_MODEL
  if (chatModelCache) return chatModelCache
  const available = await listModels()
  chatModelCache = pick(GROQ_CHAT_PREFS, available)
  return chatModelCache
}

async function resolveVisionModel() {
  if (GROQ_VISION_MODEL) return GROQ_VISION_MODEL
  if (visionModelCache !== null) return visionModelCache
  const available = await listModels()
  // Solo devolvemos un modelo de visión si realmente está habilitado en la cuenta.
  const found = GROQ_VISION_PREFS.find((p) => available.includes(p))
  visionModelCache = found || '' // '' => la cuenta no tiene visión disponible
  return visionModelCache
}

/** Generación de texto. Devuelve la respuesta completa. */
export async function generate(prompt, { system, model, temperature = 0.7, timeout = 120 } = {}) {
  if (!useGroq()) return ollama.generate(prompt, { system, model, temperature, timeout })

  const messages = []
  if (system) messages.push({ role: 'system', content: system })
  messages.push({ role: 'user', content: prompt })

  const data = await groqFetch('/chat/completions', {
    method: 'POST',
    body: {
      model: model || (await resolveChatModel()),
      messages,
      temperature,
    },
    timeoutMs: timeout * 1000,
  })
  return (data.choices?.[0]?.message?.content || '').trim()
}

/** Modelo de visión: recibe imagen en base64 (sin el prefijo data:). */
export async function vision(imageB64, prompt, { model, timeout = 180 } = {}) {
  if (!useGroq()) return ollama.vision(imageB64, prompt, { model, timeout })

  const visionModel = model || (await resolveVisionModel())
  if (!visionModel) {
    const err = new Error('No hay modelo de visión disponible en tu cuenta de Groq.')
    err.status = 502
    throw err
  }

  const dataUrl = imageB64.startsWith('data:') ? imageB64 : `data:image/jpeg;base64,${imageB64}`
  const data = await groqFetch('/chat/completions', {
    method: 'POST',
    body: {
      model: visionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.2,
    },
    timeoutMs: timeout * 1000,
  })
  return (data.choices?.[0]?.message?.content || '').trim()
}

/** ¿Está disponible el proveedor de IA? */
export async function isAvailable() {
  if (!useGroq()) return ollama.isAvailable()
  const models = await listModels()
  return models.length > 0
}

/** Estado de la IA para GET /api/health. */
export async function health() {
  if (!useGroq()) {
    const h = await ollama.health()
    return { provider: 'ollama', ...h }
  }

  const models = await listModels()
  const available = models.length > 0
  const chat = available ? await resolveChatModel() : GROQ_CHAT_MODEL || null
  const visionModel = available ? await resolveVisionModel() : GROQ_VISION_MODEL || null

  return {
    provider: 'groq',
    ai_available: available || Boolean(GROQ_API_KEY),
    groq_key_configured: Boolean(GROQ_API_KEY),
    models,
    chat_model: chat,
    vision_model: visionModel || null,
    has_chat: Boolean(chat),
    has_vision: Boolean(visionModel),
    // Campos legacy para compatibilidad con el frontend antiguo:
    ollama_available: false,
    ollama_installed: false,
  }
}
