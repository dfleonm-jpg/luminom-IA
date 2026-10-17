// ========================================
// LUMINOM IA - FUNCIONALIDADES AVANZADAS (PARTE 2)
// ========================================
// Continuación de mejoras: Metas, Colaboración, Detección de materia, Análisis, Diagramas, Logros, Typing indicator

// ========================================
// 4. SISTEMA DE METAS DE ESTUDIO
// ========================================

let studyGoals = [];

function initStudyGoals() {
  // Cargar metas guardadas
  const stored = localStorage.getItem('luminom_goals');
  studyGoals = stored ? JSON.parse(stored) : [];
  
  // Botón para abrir panel de metas
  const goalsBtn = `
    <button class="sidebar-btn-special" id="openGoalsBtn" style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);">
      🎯 Mis Metas (${studyGoals.filter(g => !g.completed).length})
    </button>
  `;
  
  const exportBtn = document.getElementById('exportPDFBtn');
  exportBtn.insertAdjacentHTML('afterend', goalsBtn);
  
  document.getElementById('openGoalsBtn').addEventListener('click', openGoalsPanel);
}

function openGoalsPanel() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 22, 40, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s;
  `;
  
  const activeGoals = studyGoals.filter(g => !g.completed);
  const completedGoals = studyGoals.filter(g => g.completed);
  
  modal.innerHTML = `
    <div style="background:var(--white);padding:2rem;border-radius:var(--radius-lg);max-width:700px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
        <h2 style="font-family:var(--font-display);color:var(--navy);">🎯 Mis Metas de Estudio</h2>
        <button id="closeGoals" style="padding:0.5rem 1rem;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--navy);font-weight:600;cursor:pointer;">Cerrar</button>
      </div>
      
      <button id="addGoalBtn" style="width:100%;padding:0.75rem;background:var(--gold);color:var(--navy);border:none;border-radius:var(--radius-sm);font-weight:600;cursor:pointer;margin-bottom:1.5rem;transition:var(--t);">
        ➕ Nueva Meta
      </button>
      
      <h3 style="color:var(--navy);margin-bottom:1rem;font-size:1.1rem;">Metas Activas (${activeGoals.length})</h3>
      <div id="activeGoalsList">
        ${activeGoals.length === 0 ? '<p style="color:var(--text-secondary);text-align:center;padding:1rem;">No tienes metas activas. ¡Crea una!</p>' : activeGoals.map(goal => renderGoal(goal)).join('')}
      </div>
      
      ${completedGoals.length > 0 ? `
        <h3 style="color:var(--navy);margin:1.5rem 0 1rem;font-size:1.1rem;">✅ Completadas (${completedGoals.length})</h3>
        <div>
          ${completedGoals.map(goal => renderGoal(goal, true)).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('closeGoals').addEventListener('click', () => modal.remove());
  document.getElementById('addGoalBtn').addEventListener('click', () => {
    modal.remove();
    showAddGoalForm();
  });
}

function renderGoal(goal, isCompleted = false) {
  const progress = Math.min((goal.currentHours / goal.targetHours) * 100, 100);
  
  return `
    <div style="background:${isCompleted ? 'var(--off-white)' : 'var(--white)'};padding:1rem;border-radius:var(--radius-md);border:2px solid ${isCompleted ? '#10b981' : 'var(--gold)'};margin-bottom:1rem;">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.75rem;">
        <div>
          <h4 style="color:var(--navy);margin-bottom:0.25rem;">${goal.subject}</h4>
          <p style="font-size:0.8rem;color:var(--text-secondary);">${goal.duration} • ${goal.targetHours} horas totales</p>
        </div>
        ${!isCompleted ? `<button onclick="deleteGoal('${goal.id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1.2rem;">🗑️</button>` : ''}
      </div>
      
      <div style="background:rgba(201,168,76,0.2);height:8px;border-radius:10px;overflow:hidden;margin-bottom:0.5rem;">
        <div style="height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-light));width:${progress}%;transition:width 0.3s;"></div>
      </div>
      
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.85rem;">
        <span style="color:var(--text-secondary);">${goal.currentHours} / ${goal.targetHours} horas</span>
        <span style="color:var(--gold);font-weight:600;">${progress.toFixed(0)}%</span>
      </div>
      
      ${!isCompleted && progress < 100 ? `
        <button onclick="addHoursToGoal('${goal.id}')" style="width:100%;margin-top:0.75rem;padding:0.5rem;background:var(--gold);color:var(--navy);border:none;border-radius:var(--radius-sm);font-weight:600;cursor:pointer;">
          ➕ Registrar Horas
        </button>
      ` : ''}
    </div>
  `;
}

function showAddGoalForm() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 22, 40, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="background:var(--white);padding:2rem;border-radius:var(--radius-lg);max-width:500px;width:90%;">
      <h3 style="font-family:var(--font-display);color:var(--navy);margin-bottom:1.5rem;">🎯 Nueva Meta de Estudio</h3>
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:var(--navy);">Materia:</label>
      <input type="text" id="goalSubject" placeholder="Ej: Cálculo Diferencial" style="width:100%;padding:0.75rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);margin-bottom:1rem;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:var(--navy);">Duración:</label>
      <select id="goalDuration" style="width:100%;padding:0.75rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);margin-bottom:1rem;">
        <option value="1 semana">1 semana</option>
        <option value="2 semanas" selected>2 semanas</option>
        <option value="1 mes">1 mes</option>
        <option value="2 meses">2 meses</option>
      </select>
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:var(--navy);">Horas totales objetivo:</label>
      <input type="number" id="goalHours" value="20" min="1" max="200" style="width:100%;padding:0.75rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);margin-bottom:1.5rem;" />
      
      <div style="display:flex;gap:1rem;">
        <button id="cancelGoal" style="flex:1;padding:0.75rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--white);color:var(--navy);font-weight:600;cursor:pointer;">
          Cancelar
        </button>
        <button id="confirmGoal" style="flex:1;padding:0.75rem;border:none;border-radius:var(--radius-sm);background:var(--gold);color:var(--navy);font-weight:600;cursor:pointer;">
          🎯 Crear Meta
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('cancelGoal').addEventListener('click', () => modal.remove());
  document.getElementById('confirmGoal').addEventListener('click', () => {
    const subject = document.getElementById('goalSubject').value.trim();
    const duration = document.getElementById('goalDuration').value;
    const hours = parseInt(document.getElementById('goalHours').value);
    
    if (!subject) {
      alert('⚠️ Por favor ingresa una materia');
      return;
    }
    
    if (hours < 1) {
      alert('⚠️ Las horas deben ser al menos 1');
      return;
    }
    
    const goal = {
      id: Date.now().toString(),
      subject,
      duration,
      targetHours: hours,
      currentHours: 0,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    studyGoals.push(goal);
    localStorage.setItem('luminom_goals', JSON.stringify(studyGoals));
    
    document.getElementById('openGoalsBtn').innerHTML = `🎯 Mis Metas (${studyGoals.filter(g => !g.completed).length})`;
    
    modal.remove();
    showNotification('✅ Meta creada exitosamente', 'success');
    openGoalsPanel();
  });
}

window.addHoursToGoal = function(goalId) {
  const hours = prompt('¿Cuántas horas estudiaste hoy?', '2');
  if (!hours) return;
  
  const hoursNum = parseFloat(hours);
  if (isNaN(hoursNum) || hoursNum <= 0) {
    alert('⚠️ Por favor ingresa un número válido de horas');
    return;
  }
  
  const goal = studyGoals.find(g => g.id === goalId);
  if (!goal) return;
  
  goal.currentHours += hoursNum;
  
  // Marcar como completada si alcanzó el objetivo
  if (goal.currentHours >= goal.targetHours) {
    goal.completed = true;
    showNotification('🎉 ¡Meta completada! Excelente trabajo', 'success');
  } else {
    showNotification(`✅ +${hoursNum} horas registradas`, 'success');
  }
  
  localStorage.setItem('luminom_goals', JSON.stringify(studyGoals));
  document.getElementById('openGoalsBtn').innerHTML = `🎯 Mis Metas (${studyGoals.filter(g => !g.completed).length})`;
  
  // Recargar panel
  document.querySelector('[style*="position: fixed"]').remove();
  openGoalsPanel();
};

window.deleteGoal = function(goalId) {
  if (confirm('¿Eliminar esta meta?')) {
    studyGoals = studyGoals.filter(g => g.id !== goalId);
    localStorage.setItem('luminom_goals', JSON.stringify(studyGoals));
    document.getElementById('openGoalsBtn').innerHTML = `🎯 Mis Metas (${studyGoals.filter(g => !g.completed).length})`;
    
    document.querySelector('[style*="position: fixed"]').remove();
    openGoalsPanel();
  }
};

// ========================================
// 5. MODO COLABORATIVO - COMPARTIR CONVERSACIÓN
// ========================================

function addShareButton() {
  // Agregar botón de compartir en la barra de navegación
  const shareBtn = document.createElement('button');
  shareBtn.className = 'btn-nav';
  shareBtn.innerHTML = '🔗 Compartir Chat';
  shareBtn.style.display = 'none'; // Solo visible cuando hay conversación
  shareBtn.id = 'shareChatBtn';
  
  const navActions = document.querySelector('.nav-actions');
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.parentNode.insertBefore(shareBtn, themeToggle);
  
  shareBtn.addEventListener('click', shareCurrentChat);
  
  // Mostrar botón cuando hay conversación activa
  const observer = new MutationObserver(() => {
    if (typeof conversationHistory !== 'undefined' && conversationHistory.length > 0) {
      shareBtn.style.display = 'block';
    } else {
      shareBtn.style.display = 'none';
    }
  });
  
  observer.observe(document.getElementById('messages'), {
    childList: true,
    subtree: true
  });
}

function shareCurrentChat() {
  if (!conversationHistory || conversationHistory.length === 0) {
    alert('⚠️ No hay conversación para compartir');
    return;
  }
  
  // Crear ID único para compartir
  const shareId = 'share_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Guardar conversación compartida en localStorage (en producción, usar Firestore)
  const sharedChat = {
    id: shareId,
    title: conversationHistory[0]?.content.substring(0, 50) + '...',
    messages: conversationHistory,
    sharedBy: session.name,
    sharedAt: new Date().toISOString()
  };
  
  const sharedChats = JSON.parse(localStorage.getItem('luminom_shared_chats') || '{}');
  sharedChats[shareId] = sharedChat;
  localStorage.setItem('luminom_shared_chats', JSON.stringify(sharedChats));
  
  // Generar enlace
  const shareLink = `${window.location.origin}${window.location.pathname.replace('tutor.html', '')}shared.html?id=${shareId}`;
  
  // Modal con el enlace
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 22, 40, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;
  
  modal.innerHTML = `
    <div style="background:var(--white);padding:2rem;border-radius:var(--radius-lg);max-width:500px;width:90%;">
      <h3 style="font-family:var(--font-display);color:var(--navy);margin-bottom:1rem;">🔗 Compartir Conversación</h3>
      <p style="color:var(--text-secondary);margin-bottom:1rem;font-size:0.9rem;">Comparte este enlace con tus compañeros para que vean esta conversación:</p>
      
      <div style="background:var(--off-white);padding:1rem;border-radius:var(--radius-sm);border:2px dashed var(--border);margin-bottom:1rem;word-break:break-all;font-size:0.85rem;">
        ${shareLink}
      </div>
      
      <div style="display:flex;gap:0.5rem;">
        <button id="copyLinkBtn" style="flex:1;padding:0.75rem;background:var(--gold);color:var(--navy);border:none;border-radius:var(--radius-sm);font-weight:600;cursor:pointer;">
          📋 Copiar Enlace
        </button>
        <button id="closeShareModal" style="flex:1;padding:0.75rem;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--navy);font-weight:600;cursor:pointer;">
          Cerrar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('copyLinkBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      showNotification('✅ Enlace copiado al portapapeles', 'success');
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification('✅ Enlace copiado', 'success');
    }
  });
  
  document.getElementById('closeShareModal').addEventListener('click', () => modal.remove());
}

// ========================================
// 6. DETECCIÓN AUTOMÁTICA DE MATERIA
// ========================================

const subjectKeywords = {
  matematicas: ['derivada', 'integral', 'ecuación', 'función', 'límite', 'trigonometría', 'álgebra', 'geometría', 'cálculo', 'matriz', 'vector'],
  fisica: ['fuerza', 'energía', 'velocidad', 'aceleración', 'masa', 'gravedad', 'newton', 'termodinámica', 'mecánica', 'ondas', 'luz'],
  programacion: ['código', 'función', 'variable', 'bucle', 'array', 'clase', 'objeto', 'algoritmo', 'python', 'javascript', 'java', 'for', 'if', 'while'],
  quimica: ['átomo', 'molécula', 'reacción', 'elemento', 'enlace', 'ácido', 'base', 'oxidación', 'reducción', 'tabla periódica'],
  economia: ['demanda', 'oferta', 'mercado', 'precio', 'inflación', 'PIB', 'consumidor', 'productor', 'elasticidad'],
  derecho: ['ley', 'constitución', 'jurídico', 'legal', 'código', 'tribunal', 'sentencia', 'demanda', 'contrato', 'derechos']
};

const subjectIcons = {
  matematicas: '🔢',
  fisica: '⚛️',
  programacion: '💻',
  quimica: '🧪',
  economia: '📊',
  derecho: '⚖️'
};

function detectSubject(text) {
  const lowerText = text.toLowerCase();
  let maxScore = 0;
  let detectedSubject = null;
  
  Object.keys(subjectKeywords).forEach(subject => {
    let score = 0;
    subjectKeywords[subject].forEach(keyword => {
      if (lowerText.includes(keyword)) {
        score++;
      }
    });
    
    if (score > maxScore) {
      maxScore = score;
      detectedSubject = subject;
    }
  });
  
  return maxScore >= 2 ? detectedSubject : null;
}

function addSubjectBadgeToMessages() {
  const observer = new MutationObserver(() => {
    const userMessages = document.querySelectorAll('.message.user .bubble');
    userMessages.forEach(bubble => {
      if (!bubble.querySelector('.subject-badge')) {
        const text = bubble.textContent;
        const subject = detectSubject(text);
        
        if (subject) {
          const badge = document.createElement('div');
          badge.className = 'subject-badge';
          badge.style.cssText = `
            display: inline-block;
            background: var(--gold);
            color: var(--navy);
            padding: 0.25rem 0.6rem;
            border-radius: 100px;
            font-size: 0.7rem;
            font-weight: 700;
            margin-top: 0.5rem;
          `;
          badge.textContent = `${subjectIcons[subject]} ${subject.charAt(0).toUpperCase() + subject.slice(1)}`;
          bubble.appendChild(badge);
        }
      }
    });
  });
  
  observer.observe(document.getElementById('messages'), {
    childList: true,
    subtree: true
  });
}

// ========================================
// 7. TYPING INDICATOR MEJORADO
// ========================================

function showAdvancedTypingIndicator() {
  hideWelcome();
  const messagesDiv = document.getElementById('messages');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'advancedTyping';
  typingDiv.className = 'message bot';
  typingDiv.innerHTML = `
    <div class="avatar">L</div>
    <div class="bubble" style="padding:1rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
        <span style="color:var(--text-secondary);font-size:0.85rem;">Luminom está pensando...</span>
      </div>
      <div style="margin-top:0.75rem;background:rgba(201,168,76,0.2);height:4px;border-radius:10px;overflow:hidden;">
        <div id="typingProgress" style="height:100%;background:var(--gold);width:0%;transition:width 0.3s;"></div>
      </div>
    </div>
  `;
  messagesDiv.appendChild(typingDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  
  // Animación de progreso
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress > 90) progress = 90;
    const progressBar = document.getElementById('typingProgress');
    if (progressBar) {
      progressBar.style.width = progress + '%';
    } else {
      clearInterval(interval);
    }
  }, 500);
  
  // Guardar referencia al intervalo para poder limpiarlo
  typingDiv.dataset.intervalId = interval;
}

function hideAdvancedTypingIndicator() {
  const typing = document.getElementById('advancedTyping');
  if (typing) {
    const intervalId = typing.dataset.intervalId;
    if (intervalId) {
      clearInterval(parseInt(intervalId));
    }
    typing.remove();
  }
}

// Reemplazar la función showTyping original
if (typeof window.originalShowTyping === 'undefined') {
  window.originalShowTyping = window.showTyping;
  window.originalHideTyping = window.hideTyping;
}

window.showTyping = showAdvancedTypingIndicator;
window.hideTyping = hideAdvancedTypingIndicator;

// ========================================
// INICIALIZACIÓN PARTE 2
// ========================================

function initAllAdvancedFeatures2() {
  setTimeout(() => {
    console.log('🚀 Inicializando funcionalidades avanzadas (Parte 2)...');
    
    try {
      initStudyGoals();
      console.log('✅ Sistema de metas de estudio inicializado');
    } catch (e) {
      console.error('Error en metas:', e);
    }
    
    try {
      addShareButton();
      console.log('✅ Sistema de compartir conversaciones inicializado');
    } catch (e) {
      console.error('Error en compartir:', e);
    }
    
    try {
      addSubjectBadgeToMessages();
      console.log('✅ Detección automática de materia inicializada');
    } catch (e) {
      console.error('Error en detección de materia:', e);
    }
    
    console.log('🎉 Funcionalidades avanzadas (Parte 2) cargadas exitosamente');
  }, 1500);
}

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAdvancedFeatures2);
} else {
  initAllAdvancedFeatures2();
}
