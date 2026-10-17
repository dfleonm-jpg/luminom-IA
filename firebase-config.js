// Configuración de Firebase para Luminom IA
// Firebase Firestore permite sincronización multi-dispositivo SIN backend

const firebaseConfig = {
  apiKey: "AIzaSyDzS5dYHznoTUsYYxWxfcA5JAHPMOJkSMA",
  authDomain: "luminom-ia.firebaseapp.com",
  databaseURL: "https://luminom-ia-default-rtdb.firebaseio.com",
  projectId: "luminom-ia",
  storageBucket: "luminom-ia.firebasestorage.app",
  messagingSenderId: "532433042280",
  appId: "1:532433042280:web:ae5f09598957e2bf8a34dd"
};

// Inicializar Firebase (se hace automáticamente al cargar)
let db = null;
let auth = null;

async function initFirebase() {
  try {
    // Importar Firebase desde CDN
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    
    console.log('✅ Firebase inicializado correctamente');
    return { db, auth, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, limit, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged };
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    // Fallback a localStorage si Firebase falla
    return null;
  }
}

// Firebase está configurado ✅
const USE_FIREBASE = true;

export { initFirebase, USE_FIREBASE };
