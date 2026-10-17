import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Router } from 'express'
import multer from 'multer'
import { PDF_DIR } from '../config/env.js'
import { asyncHandler, HttpError } from '../errors.js'

fs.mkdirSync(PDF_DIR, { recursive: true })

// multer/busboy entrega el nombre como latin1: lo reinterpretamos como UTF-8
// para no perder tildes ni eñes (p. ej. "apuntes física.pdf").
const decodeName = (name) => {
  if (!name) return ''
  try {
    const reencoded = Buffer.from(name, 'latin1').toString('utf8')
    return reencoded.includes('\uFFFD') ? name : reencoded
  } catch {
    return name
  }
}

// Igual que el backend original: letras, números, punto, guion, guion bajo y espacio
const safeName = (name) =>
  decodeName(name)
    .replace(/[^\p{L}\p{N}._\- ]/gu, '')
    .trim() || 'documento.pdf'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PDF_DIR),
  filename: (req, file, cb) => {
    const safe = safeName(file.originalname)
    cb(null, `${crypto.randomBytes(4).toString('hex')}_${safe}`)
  },
})

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } })

const router = Router()

// POST /api/pdfs/upload
router.post(
  '/pdfs/upload',
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'No se recibió ningún archivo')

    res.json({
      ok: true,
      id: req.file.filename,
      filename: safeName(req.file.originalname),
      stored: req.file.filename,
      size: req.file.size,
    })
  })
)

// GET /api/pdfs
router.get(
  '/pdfs',
  asyncHandler(async (req, res) => {
    const items = fs
      .readdirSync(PDF_DIR)
      .filter((name) => name.toLowerCase().endsWith('.pdf'))
      .sort()
      .map((name) => {
        const full = path.join(PDF_DIR, name)
        const stat = fs.statSync(full)
        return {
          id: name,
          filename: name,
          size: stat.size,
          created: stat.mtime.toISOString(),
          url: `/api/pdfs/${name}/download`,
        }
      })

    res.json({ ok: true, pdfs: items })
  })
)

// GET /api/pdfs/:name/download
router.get(
  '/pdfs/:name/download',
  asyncHandler(async (req, res) => {
    const safe = path.basename(req.params.name)
    const full = path.join(PDF_DIR, safe)
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
      throw new HttpError(404, 'PDF no encontrado')
    }
    res.download(full, safe)
  })
)

// DELETE /api/pdfs/:name
router.delete(
  '/pdfs/:name',
  asyncHandler(async (req, res) => {
    const safe = path.basename(req.params.name)
    const full = path.join(PDF_DIR, safe)
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      fs.unlinkSync(full)
    }
    res.json({ ok: true })
  })
)

export default router
