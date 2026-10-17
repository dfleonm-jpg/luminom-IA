import mongoose from 'mongoose'

const { Schema } = mongoose

// Todos los documentos exponen `id` (string) igual que el backend original,
// y usan los mismos nombres snake_case que consume el frontend.
const toJSON = { virtuals: true, getters: true, versionKey: false }

const userSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    name: { type: String, default: 'Mi Tutor' },
    premium: { type: Boolean, default: true },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    last_active: { type: String, default: '' },
    daily_messages: { type: Number, default: 0 },
    daily_date: { type: String, default: '' },
  },
  { timestamps: false }
)
userSchema.set('toJSON', toJSON)

const subjectSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    emoji: { type: String, default: '' },
    color: { type: String, default: '#8b5cf6' },
  },
  { timestamps: false, collection: 'subjects' }
)
subjectSchema.set('toJSON', toJSON)

const lessonSchema = new Schema(
  {
    subject_id: { type: String, index: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    summary: { type: String, default: '' },
    duration_min: { type: Number, default: 10 },
    is_ai: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
  },
  { timestamps: false }
)
lessonSchema.set('toJSON', toJSON)

const quizSchema = new Schema(
  {
    subject_id: { type: String, index: true },
    title: { type: String, required: true },
    questions: { type: Schema.Types.Mixed, default: [] },
    is_ai: { type: Boolean, default: false },
    created_at: { type: String, default: '' },
  },
  { timestamps: false }
)
quizSchema.set('toJSON', toJSON)

const attemptSchema = new Schema(
  {
    quiz_id: { type: String, index: true },
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    answers: { type: Schema.Types.Mixed, default: [] },
    created_at: { type: String, default: '' },
  },
  { timestamps: false }
)
attemptSchema.set('toJSON', toJSON)

const chatSchema = new Schema(
  {
    role: { type: String, required: true },
    content: { type: String, default: '' },
    created_at: { type: String, default: '' },
  },
  { timestamps: false }
)
chatSchema.set('toJSON', toJSON)

const scanSchema = new Schema(
  {
    subject: { type: String, default: '' },
    extracted_text: { type: String, default: '' },
    summary: { type: String, default: '' },
    created_at: { type: String, default: '' },
  },
  { timestamps: false }
)
scanSchema.set('toJSON', toJSON)

const predictionSchema = new Schema(
  {
    subject: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    created_at: { type: String, default: '' },
  },
  { timestamps: false }
)
predictionSchema.set('toJSON', toJSON)

const planSchema = new Schema(
  {
    title: { type: String, default: 'Plan de estudio' },
    data: { type: Schema.Types.Mixed, default: {} },
    created_at: { type: String, default: '' },
  },
  { timestamps: false }
)
planSchema.set('toJSON', toJSON)

const flashcardSchema = new Schema(
  {
    subject: { type: String, default: '' },
    front: { type: String, required: true },
    back: { type: String, default: '' },
    box: { type: Number, default: 0 },
    next_review: { type: String, default: '' },
    reviews: { type: Number, default: 0 },
    created_at: { type: String, default: '' },
  },
  { timestamps: false }
)
flashcardSchema.set('toJSON', toJSON)

export const User = mongoose.model('User', userSchema)
export const Subject = mongoose.model('Subject', subjectSchema)
export const Lesson = mongoose.model('Lesson', lessonSchema)
export const Quiz = mongoose.model('Quiz', quizSchema)
export const Attempt = mongoose.model('Attempt', attemptSchema)
export const Chat = mongoose.model('Chat', chatSchema)
export const Scan = mongoose.model('Scan', scanSchema)
export const Prediction = mongoose.model('Prediction', predictionSchema)
export const Plan = mongoose.model('Plan', planSchema)
export const Flashcard = mongoose.model('Flashcard', flashcardSchema)
