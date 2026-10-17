/*
 * Configuración del frontend de Luminom IA.
 *
 * BACKEND_URL: URL base de tu backend (Node + Express + MongoDB) desplegado en Render.
 *   - Déjalo vacío ("") para usar el modo directo a Groq desde el navegador (sin MongoDB).
 *   - Cuando despliegues el backend en Render, pega aquí su URL, por ejemplo:
 *       window.LUMINOM_CONFIG = { BACKEND_URL: "https://luminom-backend.onrender.com" };
 *
 * El chat del tutor usará automáticamente el backend (y por tanto MongoDB + Groq
 * en el servidor) en cuanto esta URL tenga valor.
 */
window.LUMINOM_CONFIG = {
  BACKEND_URL: "https://luminom-ia.onrender.com"
};
