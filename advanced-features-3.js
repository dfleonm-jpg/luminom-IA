// ========================================
// LUMINOM IA - FUNCIONALIDADES AVANZADAS (PARTE 3)
// ========================================
// Últimas mejoras: Análisis de rendimiento, Generador de diagramas, Sistema de logros

// ========================================
// 7. ANÁLISIS DE RENDIMIENTO DEL ESTUDIANTE
// ========================================

function initAnalytics() {
  // Botón para abrir panel de análisis
  const analyticsBtn = `
    <button class="sidebar-btn-special" id="openAnalyticsBtn" style="background:linear-gradient(135deg,#06b6d4,#0891b2);">
      📊 Mi Análisis
    </button>
  `;
  
  const goalsBtn = document.getElementById('openGoalsBtn');
  goalsBtn.insertAdjacentHTML('afterend', analyticsBtn);
  
  document.getElementById('openAnalyticsBtn').addEventListener('click', openAnalyticsPanel);
}

async function openAnalyticsPanel() {
  // Recopilar datos de análisis
  const analytics = await generateAnalytics();
  
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
  
  modal.innerHTML = `
    <div style="background:var(--white);padding:2rem;border-radius:var(--radius-lg);max-width:900px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
        <h2 style="font-family:var(--font-display);color:var(--navy);">📊 Análisis de Rendimiento</h2>
        <button id="closeAnalytics" style="padding:0.5rem 1rem;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--navy);font-weight:600;cursor:pointer;">Cerrar</button>
      </div>
      
      <!-- Resumen General -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:2rem;">
        <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:1.5rem;border-radius:var(--radius-md);color:white;text-align:center;">
          <div style="font-size:2.5rem;font-weight:700;font-family:var(--font-display);">${analytics.totalQuestions}</div>
          <div style="font-size:0.9rem;opacity:0.9;">Preguntas Totales</div>
        </div>
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:1.5rem;border-radius:var(--radius-md);color:white;text-align:center;">
          <div style="font-size:2.5rem;font-weight:700;font-family:var(--font-display);">${analytics.streak}</div>
          <div style="font-size:0.9rem;opacity:0.9;">Días de Racha 🔥</div>
        </div>
        <div style="background:linear-gradient(135deg,#10b981,#059669);padding:1.5rem;border-radius:var(--radius-md);color:white;text-align:center;">
          <div style="font-size:2.5rem;font-weight:700;font-family:var(--font-display);">${analytics.savedResources}</div>
          <div style="font-size:0.9rem;opacity:0.9;">Recursos Guardados</div>
        </div>
      </div>

      
      <!-- Materias Más Consultadas -->
      <div style="margin-bottom:2rem;">
        <h3 style="color:var(--navy);margin-bottom:1rem;">📚 Materias Más Consultadas</h3>
        <div id="subjectsChart">${renderSubjectsChart(analytics.subjectStats)}</div>
      </div>
      
      <!-- Actividad por Día -->
      <div style="margin-bottom:2rem;">
        <h3 style="color:var(--navy);margin-bottom:1rem;">📅 Actividad de los Últimos 7 Días</h3>
        <div id="activityChart">${renderActivityChart(analytics.dailyActivity)}</div>
      </div>
      
      <!-- Áreas de Enfoque -->
      <div>
        <h3 style="color:var(--navy);margin-bottom:1rem;">🎯 Recomendaciones</h3>
        <div style="background:var(--off-white);padding:1.5rem;border-radius:var(--radius-md);border-left:4px solid var(--gold);">
          ${generateRecommendations(analytics)}
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.getElementById('closeAnalytics').addEventListener('click', () => modal.remove());
}

async function generateAnalytics() {
  const stats = JSON.parse(localStorage.getItem('luminom_stats') || '{"totalQuestions":0,"streak":0}');
  const library = JSON.parse(localStorage.getItem('luminom_library') || '[]');
  
  // Obtener chats del usuario
  const session = Auth.getSession();
  let subjectStats = {};
  let dailyActivity = {};
  
  try {
    const snapshot = await db.collection('chats')
      .where('userId', '==', session.userId)
      .get();
    
    snapshot.forEach((doc) => {
      const chat = doc.data();
      const messages = chat.messages || [];
      
      // Analizar materias por mensaje
      messages.forEach(msg => {
        if (msg.role === 'user') {
          const subject = detectSubject(msg.content);
          if (subject) {
            subjectStats[subject] = (subjectStats[subject] || 0) + 1;
          }
        }
      });
      
      // Actividad por día
      const date = new Date(chat.createdAt).toLocaleDateString('es-CO');
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });
  } catch (error) {
    console.error('Error al generar analytics:', error);
  }
  
  // Últimos 7 días
  const last7Days = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('es-CO');
    last7Days[dateStr] = dailyActivity[dateStr] || 0;
  }
  
  return {
    totalQuestions: stats.totalQuestions || 0,
    streak: stats.streak || 0,
    savedResources: library.length,
    subjectStats,
    dailyActivity: last7Days
  };
}


function renderSubjectsChart(subjectStats) {
  if (Object.keys(subjectStats).length === 0) {
    return '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">No hay datos suficientes aún</p>';
  }
  
  const sortedSubjects = Object.entries(subjectStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const maxValue = Math.max(...sortedSubjects.map(s => s[1]));
  
  const subjectNames = {
    matematicas: 'Matemáticas',
    fisica: 'Física',
    programacion: 'Programación',
    quimica: 'Química',
    economia: 'Economía',
    derecho: 'Derecho'
  };
  
  return sortedSubjects.map(([subject, count]) => {
    const percentage = (count / maxValue) * 100;
    return `
      <div style="margin-bottom:1rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <span style="font-weight:600;color:var(--navy);">${subjectIcons[subject]} ${subjectNames[subject]}</span>
          <span style="color:var(--gold);font-weight:700;">${count} preguntas</span>
        </div>
        <div style="background:rgba(201,168,76,0.2);height:10px;border-radius:10px;overflow:hidden;">
          <div style="height:100%;background:linear-gradient(90deg,var(--gold),var(--gold-light));width:${percentage}%;transition:width 0.5s;border-radius:10px;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderActivityChart(dailyActivity) {
  const days = Object.keys(dailyActivity);
  const values = Object.values(dailyActivity);
  const maxValue = Math.max(...values, 1);
  
  return `
    <div style="display:flex;align-items:flex-end;gap:0.5rem;height:200px;padding:1rem;background:var(--off-white);border-radius:var(--radius-md);">
      ${days.map((day, i) => {
        const value = values[i];
        const height = (value / maxValue) * 100;
        const dayName = new Date(day.split('/').reverse().join('-')).toLocaleDateString('es-CO', { weekday: 'short' });
        
        return `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;">
            <div style="font-size:0.75rem;color:var(--navy);font-weight:700;margin-bottom:0.25rem;">${value}</div>
            <div style="width:100%;height:${height}%;min-height:${value > 0 ? '4px' : '0'};background:linear-gradient(180deg,var(--gold),var(--gold-light));border-radius:4px 4px 0 0;transition:height 0.5s;"></div>
            <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:0.5rem;">${dayName}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function generateRecommendations(analytics) {
  const recommendations = [];
  
  if (analytics.totalQuestions < 10) {
    recommendations.push('• 💡 Sigue preguntando para obtener mejores insights de tu progreso');
  }
  
  if (analytics.streak === 0) {
    recommendations.push('• 🔥 Empieza una racha de estudio diario para mejorar tu consistencia');
  } else if (analytics.streak >= 7) {
    recommendations.push('• 🎉 ¡Excelente! Llevas ' + analytics.streak + ' días de racha. Sigue así');
  }
  
  const subjectCount = Object.keys(analytics.subjectStats).length;
  if (subjectCount > 3) {
    recommendations.push('• 📚 Estás estudiando ' + subjectCount + ' materias. Considera enfocarte en las más importantes');
  } else if (subjectCount === 1) {
    const subject = Object.keys(analytics.subjectStats)[0];
    recommendations.push('• 🎯 Te estás especializando en una materia. ¿Necesitas ayuda con otras?');
  }
  
  if (analytics.savedResources === 0) {
    recommendations.push('• 💾 Usa el botón "Guardar" en las respuestas útiles para crear tu biblioteca personal');
  } else if (analytics.savedResources >= 10) {
    recommendations.push('• 📖 Tienes ' + analytics.savedResources + ' recursos guardados. ¡Revísalos regularmente!');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('• ✅ ¡Vas muy bien! Sigue aprovechando todas las funcionalidades');
  }
  
  return recommendations.join('<br>');
}



// ========================================
// 8. GENERADOR DE DIAGRAMAS CON MERMAID Y CHART.JS
// ========================================

function initDiagramGenerator() {
  // Agregar Mermaid.js
  const mermaidScript = document.createElement('script');
  mermaidScript.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  mermaidScript.onload = () => {
    mermaid.initialize({ startOnLoad: false, theme: 'base' });
    console.log('✅ Mermaid.js cargado');
  };
  document.head.appendChild(mermaidScript);
  
  // Agregar Chart.js
  const chartScript = document.createElement('script');
  chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
  chartScript.onload = () => {
    console.log('✅ Chart.js cargado');
  };
  document.head.appendChild(chartScript);
}

// Detectar solicitudes de diagramas en las respuestas de la IA
function processDiagramRequests() {
  const observer = new MutationObserver(() => {
    const botMessages = document.querySelectorAll('.message.bot .bubble');
    botMessages.forEach(bubble => {
      const text = bubble.textContent;
      
      // Detectar código Mermaid en bloques de código
      const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
      let match;
      
      while ((match = mermaidRegex.exec(text)) !== null) {
        if (!bubble.querySelector('.mermaid-diagram')) {
          const mermaidCode = match[1];
          renderMermaidDiagram(bubble, mermaidCode);
        }
      }
    });
  });
  
  observer.observe(document.getElementById('messages'), {
    childList: true,
    subtree: true
  });
}

function renderMermaidDiagram(bubble, code) {
  const diagramDiv = document.createElement('div');
  diagramDiv.className = 'mermaid-diagram';
  diagramDiv.style.cssText = `
    margin: 1rem 0;
    padding: 1rem;
    background: var(--off-white);
    border-radius: var(--radius-sm);
    overflow-x: auto;
  `;
  
  const mermaidContainer = document.createElement('div');
  mermaidContainer.className = 'mermaid';
  mermaidContainer.textContent = code;
  
  diagramDiv.appendChild(mermaidContainer);
  bubble.appendChild(diagramDiv);
  
  // Renderizar con Mermaid
  if (typeof mermaid !== 'undefined') {
    mermaid.run({
      nodes: [mermaidContainer]
    }).catch(err => {
      console.error('Error al renderizar Mermaid:', err);
      diagramDiv.innerHTML = '<p style="color:#ef4444;">⚠️ Error al renderizar diagrama</p>';
    });
  }
}

// Botón para solicitar diagrama a la IA
function addDiagramButton() {
  const diagramBtn = document.createElement('button');
  diagramBtn.className = 'btn-attach';
  diagramBtn.innerHTML = '📊';
  diagramBtn.title = 'Solicitar diagrama o gráfico';
  diagramBtn.style.marginRight = '0.5rem';
  
  const fileInput = document.querySelector('#fileInput').parentElement;
  fileInput.parentElement.insertBefore(diagramBtn, fileInput);
  
  diagramBtn.addEventListener('click', () => {
    const diagramPrompt = prompt(
      '¿Qué tipo de diagrama necesitas?\n\n' +
      'Ejemplos:\n' +
      '• Diagrama de flujo del proceso X\n' +
      '• Mapa mental de Y\n' +
      '• Gráfico de la función f(x) = x²\n' +
      '• Diagrama de clases UML\n' +
      '• Timeline de eventos históricos'
    );
    
    if (diagramPrompt) {
      document.getElementById('userInput').value = 
        diagramPrompt + '\n\n(Por favor genera el diagrama usando sintaxis Mermaid)';
      document.getElementById('sendBtn').click();
    }
  });
}



// ========================================
// 9. SISTEMA DE LOGROS Y INSIGNIAS
// ========================================

const achievements = {
  first_question: {
    id: 'first_question',
    name: 'Primera Pregunta',
    description: 'Hiciste tu primera pregunta a Luminom',
    icon: '🎯',
    condition: (data) => data.totalQuestions >= 1
  },
  questions_10: {
    id: 'questions_10',
    name: 'Estudiante Curioso',
    description: '10 preguntas realizadas',
    icon: '📚',
    condition: (data) => data.totalQuestions >= 10
  },
  questions_50: {
    id: 'questions_50',
    name: 'Investigador',
    description: '50 preguntas realizadas',
    icon: '🔬',
    condition: (data) => data.totalQuestions >= 50
  },
  questions_100: {
    id: 'questions_100',
    name: 'Maestro del Conocimiento',
    description: '100 preguntas realizadas',
    icon: '🏆',
    condition: (data) => data.totalQuestions >= 100
  },
  streak_3: {
    id: 'streak_3',
    name: 'Dedicación',
    description: '3 días consecutivos de estudio',
    icon: '🔥',
    condition: (data) => data.streak >= 3
  },
  streak_7: {
    id: 'streak_7',
    name: 'Semana Completa',
    description: '7 días consecutivos de estudio',
    icon: '⭐',
    condition: (data) => data.streak >= 7
  },
  streak_30: {
    id: 'streak_30',
    name: 'Mes Perfecto',
    description: '30 días consecutivos de estudio',
    icon: '👑',
    condition: (data) => data.streak >= 30
  },
  library_5: {
    id: 'library_5',
    name: 'Coleccionista',
    description: '5 recursos guardados en biblioteca',
    icon: '📖',
    condition: (data) => data.savedResources >= 5
  },
  library_20: {
    id: 'library_20',
    name: 'Bibliotecario',
    description: '20 recursos guardados en biblioteca',
    icon: '📚',
    condition: (data) => data.savedResources >= 20
  },
  goals_1: {
    id: 'goals_1',
    name: 'Enfocado',
    description: 'Completaste tu primera meta de estudio',
    icon: '🎯',
    condition: (data) => data.completedGoals >= 1
  },
  subjects_3: {
    id: 'subjects_3',
    name: 'Multidisciplinario',
    description: 'Consultaste 3 materias diferentes',
    icon: '🌐',
    condition: (data) => data.differentSubjects >= 3
  },
  early_bird: {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Estudiaste antes de las 7 AM',
    icon: '🌅',
    condition: (data) => data.studiedEarly
  }
};

function initAchievements() {
  // Cargar logros desbloqueados
  const unlockedAchievements = JSON.parse(localStorage.getItem('luminom_achievements') || '[]');
  
  // Botón para ver logros
  const achievementsBtn = `
    <button class="sidebar-btn-special" id="openAchievementsBtn" style="background:linear-gradient(135deg,#f59e0b,#ea580c);">
      🏆 Logros (${unlockedAchievements.length}/${Object.keys(achievements).length})
    </button>
  `;
  
  const analyticsBtn = document.getElementById('openAnalyticsBtn');
  analyticsBtn.insertAdjacentHTML('afterend', achievementsBtn);
  
  document.getElementById('openAchievementsBtn').addEventListener('click', openAchievementsPanel);
  
  // Verificar logros cada vez que cambian los datos
  checkAndUnlockAchievements();
}

function checkAndUnlockAchievements() {
  const stats = JSON.parse(localStorage.getItem('luminom_stats') || '{"totalQuestions":0,"streak":0}');
  const library = JSON.parse(localStorage.getItem('luminom_library') || '[]');
  const goals = JSON.parse(localStorage.getItem('luminom_goals') || '[]');
  const unlockedAchievements = JSON.parse(localStorage.getItem('luminom_achievements') || '[]');
  
  // Datos para evaluar condiciones
  const data = {
    totalQuestions: stats.totalQuestions || 0,
    streak: stats.streak || 0,
    savedResources: library.length,
    completedGoals: goals.filter(g => g.completed).length,
    differentSubjects: new Set(library.map(r => r.category)).size,
    studiedEarly: checkEarlyStudy()
  };
  
  // Verificar cada logro
  Object.values(achievements).forEach(achievement => {
    const isUnlocked = unlockedAchievements.includes(achievement.id);
    
    if (!isUnlocked && achievement.condition(data)) {
      // ¡Nuevo logro desbloqueado!
      unlockedAchievements.push(achievement.id);
      localStorage.setItem('luminom_achievements', JSON.stringify(unlockedAchievements));
      
      // Actualizar contador
      document.getElementById('openAchievementsBtn').innerHTML = 
        `🏆 Logros (${unlockedAchievements.length}/${Object.keys(achievements).length})`;
      
      // Mostrar notificación
      showAchievementUnlocked(achievement);
    }
  });
}

function checkEarlyStudy() {
  const lastUse = localStorage.getItem('luminom_last_use_time');
  if (!lastUse) return false;
  
  const hour = new Date(lastUse).getHours();
  return hour < 7;
}

function showAchievementUnlocked(achievement) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #f59e0b, #ea580c);
    color: white;
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    z-index: 10001;
    animation: achievementPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    max-width: 350px;
  `;
  
  notification.innerHTML = `
    <div style="font-size:3rem;text-align:center;margin-bottom:0.5rem;">${achievement.icon}</div>
    <div style="font-weight:700;font-size:1.1rem;text-align:center;margin-bottom:0.25rem;">¡Logro Desbloqueado!</div>
    <div style="font-size:1rem;text-align:center;margin-bottom:0.25rem;">${achievement.name}</div>
    <div style="font-size:0.85rem;text-align:center;opacity:0.9;">${achievement.description}</div>
  `;
  
  document.body.appendChild(notification);
  
  // Agregar animación
  const style = document.createElement('style');
  style.textContent = `
    @keyframes achievementPop {
      0% { transform: scale(0) rotate(-180deg); opacity: 0; }
      50% { transform: scale(1.1) rotate(10deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Reproducir sonido (opcional)
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyy3ksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrgs7y2Yk3CBlou+3nn00QDFCn4/C2YxwGOJLX8st5LAUkd8fw3ZBAC');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {}
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}



function openAchievementsPanel() {
  const unlockedAchievements = JSON.parse(localStorage.getItem('luminom_achievements') || '[]');
  
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
  
  // Calcular nivel del usuario
  const level = Math.floor(unlockedAchievements.length / 3) + 1;
  const progress = (unlockedAchievements.length % 3) * 33.33;
  
  const levelNames = ['Novato', 'Estudiante', 'Aplicado', 'Avanzado', 'Experto', 'Maestro'];
  const levelName = levelNames[Math.min(level - 1, levelNames.length - 1)];
  
  modal.innerHTML = `
    <div style="background:var(--white);padding:2rem;border-radius:var(--radius-lg);max-width:700px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
        <h2 style="font-family:var(--font-display);color:var(--navy);">🏆 Mis Logros</h2>
        <button id="closeAchievements" style="padding:0.5rem 1rem;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--navy);font-weight:600;cursor:pointer;">Cerrar</button>
      </div>
      
      <!-- Nivel del Usuario -->
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:1.5rem;border-radius:var(--radius-md);color:white;margin-bottom:2rem;text-align:center;">
        <div style="font-size:3rem;margin-bottom:0.5rem;">🎓</div>
        <div style="font-size:1.5rem;font-weight:700;font-family:var(--font-display);margin-bottom:0.5rem;">Nivel ${level} - ${levelName}</div>
        <div style="font-size:0.9rem;opacity:0.9;margin-bottom:1rem;">${unlockedAchievements.length} de ${Object.keys(achievements).length} logros desbloqueados</div>
        <div style="background:rgba(255,255,255,0.3);height:8px;border-radius:10px;overflow:hidden;">
          <div style="height:100%;background:var(--gold);width:${progress}%;transition:width 0.5s;"></div>
        </div>
      </div>
      
      <!-- Logros -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1rem;">
        ${Object.values(achievements).map(achievement => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          return `
            <div style="background:${isUnlocked ? 'linear-gradient(135deg,var(--gold),var(--gold-light))' : 'var(--off-white)'};padding:1.5rem;border-radius:var(--radius-md);text-align:center;border:2px solid ${isUnlocked ? 'var(--gold)' : 'var(--border)'};opacity:${isUnlocked ? '1' : '0.5'};transition:all 0.3s;">
              <div style="font-size:3rem;margin-bottom:0.5rem;filter:${isUnlocked ? 'none' : 'grayscale(100%)'}">${achievement.icon}</div>
              <div style="font-weight:700;color:${isUnlocked ? 'var(--navy)' : 'var(--text-secondary)'};margin-bottom:0.25rem;font-size:0.95rem;">${achievement.name}</div>
              <div style="font-size:0.8rem;color:${isUnlocked ? 'var(--navy)' : 'var(--text-secondary)'};opacity:0.8;">${achievement.description}</div>
              ${isUnlocked ? '<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--navy);font-weight:600;">✓ Desbloqueado</div>' : '<div style="margin-top:0.5rem;font-size:0.75rem;color:var(--text-secondary);">🔒 Bloqueado</div>'}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.getElementById('closeAchievements').addEventListener('click', () => modal.remove());
}

// Verificar logros después de cada pregunta
if (typeof window.originalSendMessage === 'undefined') {
  window.originalSendMessage = window.sendMessage;
}

// ========================================
// INICIALIZACIÓN PARTE 3
// ========================================

function initAllAdvancedFeatures3() {
  setTimeout(() => {
    console.log('🚀 Inicializando funcionalidades avanzadas (Parte 3)...');
    
    try {
      initAnalytics();
      console.log('✅ Sistema de análisis de rendimiento inicializado');
    } catch (e) {
      console.error('Error en analytics:', e);
    }
    
    try {
      initDiagramGenerator();
      processDiagramRequests();
      addDiagramButton();
      console.log('✅ Generador de diagramas inicializado');
    } catch (e) {
      console.error('Error en diagramas:', e);
    }
    
    try {
      initAchievements();
      console.log('✅ Sistema de logros e insignias inicializado');
    } catch (e) {
      console.error('Error en logros:', e);
    }
    
    // Registrar última hora de uso para logro madrugador
    localStorage.setItem('luminom_last_use_time', new Date().toISOString());
    
    // Verificar logros al iniciar
    setTimeout(checkAndUnlockAchievements, 2000);
    
    console.log('🎉 Todas las funcionalidades avanzadas cargadas exitosamente');
    console.log('📊 Total: 10 mejoras implementadas');
  }, 2000);
}

// Inicializar cuando esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAdvancedFeatures3);
} else {
  initAllAdvancedFeatures3();
}

// Exportar para uso global
window.checkAndUnlockAchievements = checkAndUnlockAchievements;
