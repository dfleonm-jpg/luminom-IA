/**
 * Cliente de Ollama (IA local) — equivalente a backend/app/ai.py.
 * Usa fetch nativo de Node y el mismo esquema de modelos/fallbacks.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { OLLAMA_URL, CHAT_MODEL, VISION_MODEL } from '../config/env.js'

const FALLBACK_MODELS = ['qwen2.5:7b', 'qwen2.5:3b', 'llama3.2:3b', 'gemma2:2b', 'llama3.2:1b']
const FALLBACK_VISION = ['qwen2.5vl:3b', 'qwen2.5vl:7b', 'llava:7b', 'llava:13b']

const url = (p) => OLLAMA_URL.replace(/\/$/, '') + p

async function fetchJson(u, { method = 'GET', body, timeoutMs = 5000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(u, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Ollama respondió ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

function ollamaExe() {
  if (process.platform !== 'win32') return ''
  return path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Ollama', 'ollama.exe')
}

export function ollamaInstalled() {
  const exe = ollamaExe()
  return Boolean(exe) && fs.existsSync(exe)
}

export function startOllama() {
  const exe = ollamaExe()
  if (!exe || !fs.existsSync(exe)) return
  try {
    const child = spawn(exe, [], { detached: true, stdio: 'ignore', windowsHide: false })
    child.unref()
  } catch {
    /* noop */
  }
}

export async function isAvailable() {
  try {
    await fetchJson(url('/api/tags'), { timeoutMs: 3000 })
    return true
  } catch {
    return false
  }
}

export async function getModels() {
  try {
    const data = await fetchJson(url('/api/tags'), { timeoutMs: 5000 })
    return (data.models || []).map((m) => m.name)
  } catch {
    return []
  }
}

export function pickChatModel(models = []) {
  for (const pref of FALLBACK_MODELS) {
    const found = models.find((m) => m.startsWith(pref))
    if (found) return found
  }
  return CHAT_MODEL
}

export function pickVisionModel(models = []) {
  for (const pref of FALLBACK_VISION) {
    const found = models.find((m) => m.startsWith(pref))
    if (found) return found
  }
  return VISION_MODEL
}

let bootstrapped = false

async function ensureStarted() {
  if (bootstrapped) return
  if (!(await isAvailable())) startOllama()
  bootstrapped = true
}

/** Generación de texto. Devuelve la respuesta completa (stream: false). */
export async function generate(prompt, { system, model, temperature = 0.7, timeout = 300 } = {}) {
  await ensureStarted()
  const models = await getModels()
  const useModel = model || pickChatModel(models)

  const payload = {
    model: useModel,
    prompt,
    stream: false,
    options: { temperature, num_ctx: 8192 },
  }
  if (system) payload.system = system

  const data = await fetchJson(url('/api/generate'), {
    method: 'POST',
    body: payload,
    timeoutMs: timeout * 1000,
  })
  return (data.response || '').trim()
}

/** Modelo de visión: recibe imagen en base64. */
export async function vision(imageB64, prompt, { model, timeout = 300 } = {}) {
  await ensureStarted()
  const models = await getModels()
  const useModel = model || pickVisionModel(models)

  const data = await fetchJson(url('/api/chat'), {
    method: 'POST',
    body: {
      model: useModel,
      messages: [{ role: 'user', content: prompt, images: [imageB64] }],
      stream: false,
      options: { temperature: 0.2, num_ctx: 8192 },
    },
    timeoutMs: timeout * 1000,
  })
  return (data.message?.content || '').trim()
}

/** Estado de la IA para GET /api/health. */
export async function health() {
  if (!bootstrapped) {
    if (!(await isAvailable())) startOllama()
    bootstrapped = true
  }

  const available = await isAvailable()
  const models = available ? await getModels() : []
  const chat = models.length ? pickChatModel(models) : null
  const visionModel = models.length ? pickVisionModel(models) : null

  return {
    ollama_available: available,
    ollama_installed: ollamaInstalled(),
    models,
    chat_model: chat,
    vision_model: visionModel,
    has_chat: chat !== null,
    has_vision: visionModel !== null,
  }
}
