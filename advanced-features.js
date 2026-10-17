// ========================================
// LUMINOM IA - FUNCIONALIDADES AVANZADAS
// ========================================
// Archivo con todas las mejoras adicionales manteniendo estilo navy/gold

// ========================================
// 1. BÚSQUEDA EN HISTORIAL DE CHATS
// ========================================

let searchActive = false;

function initSearchHistory() {
  const searchHTML = `
    <div id="searchHistoryContainer" style="margin-bottom:1rem;">
      <div style="position:relative;">
        <input 
          type="text" 
          id="searchHistoryInput" 
          placeholder="🔍 Buscar en historial..."
          style="width:100%;padding:0.65rem 2.5rem 0.65rem 0.75rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:0.85rem;background:var(--white);transition:var(--t);"
        />
        <button 
          id="clearSearchBtn" 
          style="position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-secondary);cursor:pointer;font-size:1.2rem;display:none;"
          title="Limpiar búsqueda"
        >✕</button>
      </div>
      <div id="searchResults" style="margin-top:0.5rem;font-size:0.75rem;color:var(--text-secondary);"></div>
    </div>
  `;
  
  // Insertar antes del h3 de Historial
  const historialTitle = document.querySelector('.sidebar h3');
  historialTitle.insertAdjacentHTML('beforebegin', searchHTML);
  
  // Event listeners
  const searchInput = document.getElementById('searchHistoryInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  
  searchInput.addEventListener('focus', function() {
    this.style.borderColor = 'var(--gold)';
    this.style.boxShadow = '0 0 0 3px rgba(201,168,76,0.12)';
  });
  
  searchInput.addEventListener('blur', function() {
    this.style.borderColor = 'var(--border)';
    this.style.boxShadow = 'none';
  });
  
  searchInput.addEventListener('input', function() {
    const query = this.value.trim();
    clearBtn.style.display = query ? 'block' : 'none';
    
    if (query.length >= 2) {
      searchInHistory(query);
    } else if (query.length === 0) {
      loadChatHistory(); // Restaurar vista normal
      document.getElementById('searchResults').textContent = '';
    }
  });
  
  clearBtn.addEventListener('click', function() {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    loadChatHistory();
    document.getElementById('searchResults').textContent = '';
    searchInput.focus();
  });
}

async function searchInHistory(query) {
  try {
    const session = Auth.getSession();
    const snapshot = await db.collection('chats')
      .where('userId', '==', session.userId)
      .get();
    
    const results = [];
    snapshot.forEach((doc) => {
      const chat = doc.data();
      const messages = chat.messages || [];
      
      // Buscar en contenido de mensajes
      let hasMatch = false;
      messages.forEach(msg => {
        if (msg.content.toLowerCase().includes(query.toLowerCase())) {
          hasMatch = true;
        }
      });
      
      // Buscar en título
      if (chat.title.toLowerCase().includes(query.toLowerCase())) {
        hasMatch = true;
      }
      
      if (hasMatch) {
        results.push({
          id: doc.id,
          ...chat
        });
      }
    });
    
    // Ordenar por fecha
    results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    // Mostrar resultados
    const historyList = document.getElementById('historyList');
    const searchResultsDiv = document.getElementById('searchResults');
    
    if (results.length === 0) {
      historyList.innerHTML = '<div class="history-item" style="color:var(--text-secondary);">No se encontraron resultados</div>';
      searchResultsDiv.textContent = '0 resultados';
    } else {
      searchResultsDiv.textContent = `${results.length} resultado${results.length > 1 ? 's' : ''} encontrado${results.length > 1 ? 's' : ''}`;
      
      historyList.innerHTML = results.map(chat => {
        // Resaltar coincidencias en el título
        const highlightedTitle = chat.title.replace(
          new RegExp(query, 'gi'),
          match => `<mark style="background:var(--gold);color:var(--navy);padding:0 0.2rem;border-radius:2px;">${match}</mark>`
        );
        
        return `
          <div class="history-item" onclick="loadChat('${chat.id}')">
            <div style="font-weight:600;margin-bottom:0.2rem;color:var(--navy);">${highlightedTitle}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">${new Date(chat.updatedAt).toLocaleDateString('es-CO')}</div>
          </div>
        `;
      }).join('');
    }
  } catch (error) {
    console.error('Error en búsqueda:', error);
  }
}

// ========================================
// 2. MARCAR CONVERSACIONES COMO FAVORITAS
// ========================================

let favoritesFilter = 'all'; // 'all' o 'favorites'

function initFavorites() {
  // Agregar filtro de favoritos
  const filterHTML = `
    <div style="display:flex;gap:0.5rem;margin-bottom:1rem;">
      <button id="filterAll" class="filter-btn active" onclick="filterChats('all')" style="flex:1;padding:0.5rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--gold);color:var(--navy);font-weight:600;cursor:pointer;font-size:0.8rem;transition:var(--t);">
        Todos
      </button>
      <button id="filterFavorites" class="filter-btn" onclick="filterChats('favorites')" style="flex:1;padding:0.5rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--white);color:var(--navy);font-weight:600;cursor:pointer;font-size:0.8rem;transition:var(--t);">
        ⭐ Favoritos
      </button>
    </div>
  `;
  
  const historialTitle = document.querySelector('.sidebar h3');
  historialTitle.insertAdjacentHTML('afterend', filterHTML);
  
  // Estilos para botones
  const style = document.createElement('style');
  style.textContent = `
    .filter-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(10,22,40,0.1); }
    .filter-btn.active { background: var(--gold) !important; color: var(--navy) !important; }
    .filter-btn:not(.active) { background: var(--white); color: var(--text-secondary); }
    .favorite-star { cursor: pointer; font-size: 1.1rem; transition: transform 0.2s; display: inline-block; }
    .favorite-star:hover { transform: scale(1.2); }
  `;
  document.head.appendChild(style);
}

window.filterChats = async function(filter) {
  favoritesFilter = filter;
  
  // Actualizar botones
  document.getElementById('filterAll').classList.toggle('active', filter === 'all');
  document.getElementById('filterFavorites').classList.toggle('active', filter === 'favorites');
  
  // Recargar historial con filtro
  await loadChatHistory();
};

async function toggleFavorite(chatId, event) {
  event.stopPropagation(); // Evitar que se abra el chat
  
  try {
    const chatDoc = await db.collection('chats').doc(chatId).get();
    const currentFav = chatDoc.data().isFavorite || false;
    
    await db.collection('chats').doc(chatId).update({
      isFavorite: !currentFav,
      updatedAt: new Date().toISOString()
    });
    
    // Recargar historial
    await loadChatHistory();
    
    console.log(`✅ Chat ${!currentFav ? 'agregado a' : 'removido de'} favoritos`);
  } catch (error) {
    console.error('Error al actualizar favorito:', error);
  }
}

// ========================================
// 3. BIBLIOTECA DE RECURSOS GUARDADOS
// ========================================

let savedResources = []; // Guardado en localStorage

function initLibrary() {
  // Cargar recursos guardados
  const stored = localStorage.getItem('luminom_library');
  savedResources = stored ? JSON.parse(stored) : [];
  
  // Botón para abrir biblioteca
  const libraryBtn = `
    <button class="sidebar-btn-special" id="openLibraryBtn" style="background:linear-gradient(135deg,#f59e0b,#d97706);">
      📚 Mi Biblioteca (${savedResources.length})
    </button>
  `;
  
  document.getElementById('studyPlanBtn').insertAdjacentHTML('afterend', libraryBtn);
  
  document.getElementById('openLibraryBtn').addEventListener('click', openLibrary);
}

function addSaveButtonToMessages() {
  // Agregar botón "Guardar" a cada mensaje de la IA
  const observer = new MutationObserver(() => {
    const botMessages = document.querySelectorAll('.message.bot .bubble');
    botMessages.forEach(bubble => {
      if (!bubble.querySelector('.save-response-btn')) {
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-response-btn';
        saveBtn.innerHTML = '💾 Guardar';
        saveBtn.style.cssText = `
          margin-top: 0.75rem;
          padding: 0.4rem 0.8rem;
          background: var(--gold);
          color: var(--navy);
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: var(--t);
        `;
        
        saveBtn.addEventListener('mouseover', function() {
          this.style.background = 'var(--gold-light)';
          this.style.transform = 'translateY(-2px)';
        });
        
        saveBtn.addEventListener('mouseout', function() {
          this.style.background = 'var(--gold)';
          this.style.transform = 'translateY(0)';
        });
        
        saveBtn.addEventListener('click', function() {
          const content = bubble.textContent.replace('💾 Guardar', '').trim();
          saveToLibrary(content);
        });
        
        bubble.appendChild(saveBtn);
      }
    });
  });
  
  observer.observe(document.getElementById('messages'), {
    childList: true,
    subtree: true
  });
}

function saveToLibrary(content) {
  // Modal para categorizar
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
    <div style="background:var(--white);padding:2rem;border-radius:var(--radius-lg);max-width:500px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <h3 style="font-family:var(--font-display);color:var(--navy);margin-bottom:1rem;">📚 Guardar en Biblioteca</h3>
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:var(--navy);">Título del recurso:</label>
      <input type="text" id="resourceTitle" placeholder="Ej: Teorema de Pitágoras" style="width:100%;padding:0.75rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);margin-bottom:1rem;font-size:0.9rem;" />
      
      <label style="display:block;margin-bottom:0.5rem;font-weight:600;color:var(--navy);">Categoría:</label>
      <select id="resourceCategory" style="width:100%;padding:0.75rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);margin-bottom:1.5rem;font-size:0.9rem;">
        <option value="matematicas">🔢 Matemáticas</option>
        <option value="fisica">⚛️ Física</option>
        <option value="programacion">💻 Programación</option>
        <option value="quimica">🧪 Química</option>
        <option value="economia">📊 Economía</option>
        <option value="derecho">⚖️ Derecho</option>
        <option value="otros">📌 Otros</option>
      </select>
      
      <div style="display:flex;gap:1rem;">
        <button id="cancelSave" style="flex:1;padding:0.75rem;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--white);color:var(--navy);font-weight:600;cursor:pointer;">
          Cancelar
        </button>
        <button id="confirmSave" style="flex:1;padding:0.75rem;border:none;border-radius:var(--radius-sm);background:var(--gold);color:var(--navy);font-weight:600;cursor:pointer;">
          💾 Guardar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.getElementById('resourceTitle').focus();
  
  document.getElementById('cancelSave').addEventListener('click', () => modal.remove());
  
  document.getElementById('confirmSave').addEventListener('click', () => {
    const title = document.getElementById('resourceTitle').value.trim();
    const category = document.getElementById('resourceCategory').value;
    
    if (!title) {
      alert('⚠️ Por favor ingresa un título');
      return;
    }
    
    const resource = {
      id: Date.now().toString(),
      title,
      category,
      content,
      savedAt: new Date().toISOString()
    };
    
    savedResources.push(resource);
    localStorage.setItem('luminom_library', JSON.stringify(savedResources));
    
    // Actualizar contador
    document.getElementById('openLibraryBtn').innerHTML = `📚 Mi Biblioteca (${savedResources.length})`;
    
    modal.remove();
    
    // Notificación
    showNotification('✅ Recurso guardado en tu biblioteca', 'success');
  });
}

function openLibrary() {
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
  
  // Agrupar por categoría
  const byCategory = {};
  savedResources.forEach(r => {
    if (!byCategory[r.category]) byCategory[r.category] = [];
    byCategory[r.category].push(r);
  });
  
  const categoryNames = {
    matematicas: '🔢 Matemáticas',
    fisica: '⚛️ Física',
    programacion: '💻 Programación',
    quimica: '🧪 Química',
    economia: '📊 Economía',
    derecho: '⚖️ Derecho',
    otros: '📌 Otros'
  };
  
  let contentHTML = '';
  if (savedResources.length === 0) {
    contentHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">No tienes recursos guardados aún.<br>Usa el botón 💾 Guardar en las respuestas de la IA.</p>';
  } else {
    Object.keys(byCategory).forEach(cat => {
      contentHTML += `
        <div style="margin-bottom:1.5rem;">
          <h4 style="color:var(--gold);margin-bottom:0.75rem;font-size:1rem;">${categoryNames[cat]} (${byCategory[cat].length})</h4>
          ${byCategory[cat].map(r => `
            <div style="background:var(--off-white);padding:1rem;border-radius:var(--radius-sm);margin-bottom:0.5rem;border-left:3px solid var(--gold);">
              <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:0.5rem;">
                <strong style="color:var(--navy);">${r.title}</strong>
                <button onclick="deleteResource('${r.id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:1.2rem;" title="Eliminar">🗑️</button>
              </div>
              <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;max-height:100px;overflow-y:auto;">${r.content.substring(0, 200)}${r.content.length > 200 ? '...' : ''}</p>
              <button onclick="viewResource('${r.id}')" style="margin-top:0.5rem;padding:0.4rem 0.8rem;background:var(--gold);color:var(--navy);border:none;border-radius:4px;font-size:0.75rem;font-weight:600;cursor:pointer;">Ver completo</button>
            </div>
          `).join('')}
        </div>
      `;
    });
  }
  
  modal.innerHTML = `
    <div style="background:var(--white);padding:2rem;border-radius:var(--radius-lg);max-width:800px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
        <h2 style="font-family:var(--font-display);color:var(--navy);">📚 Mi Biblioteca</h2>
        <div style="display:flex;gap:0.5rem;">
          <button id="exportLibraryBtn" style="padding:0.5rem 1rem;background:var(--navy);color:var(--gold);border:none;border-radius:var(--radius-sm);font-weight:600;cursor:pointer;">📄 Exportar PDF</button>
          <button id="closeLibrary" style="padding:0.5rem 1rem;background:var(--white);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--navy);font-weight:600;cursor:pointer;">Cerrar</button>
        </div>
      </div>
      
      <div id="libraryContent">
        ${contentHTML}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('closeLibrary').addEventListener('click', () => modal.remove());
  document.getElementById('exportLibraryBtn').addEventListener('click', () => exportLibraryToPDF());
}

window.deleteResource = function(id) {
  if (confirm('¿Eliminar este recurso de tu biblioteca?')) {
    savedResources = savedResources.filter(r => r.id !== id);
    localStorage.setItem('luminom_library', JSON.stringify(savedResources));
    document.getElementById('openLibraryBtn').innerHTML = `📚 Mi Biblioteca (${savedResources.length})`;
    
    // Cerrar y reabrir biblioteca
    document.querySelector('[style*="position: fixed"]').remove();
    openLibrary();
  }
};

window.viewResource = function(id) {
  const resource = savedResources.find(r => r.id === id);
  if (!resource) return;
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(10, 22, 40, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10001;
  `;
  
  modal.innerHTML = `
    <div style="background:var(--white);padding:2rem;border-radius:var(--radius-lg);max-width:700px;width:90%;max-height:80vh;overflow-y:auto;">
      <h3 style="font-family:var(--font-display);color:var(--navy);margin-bottom:1rem;">${resource.title}</h3>
      <div style="padding:1rem;background:var(--off-white);border-radius:var(--radius-sm);line-height:1.7;white-space:pre-wrap;">${resource.content}</div>
      <button onclick="this.closest('[style*=\\'position: fixed\\']').remove()" style="margin-top:1rem;width:100%;padding:0.75rem;background:var(--gold);color:var(--navy);border:none;border-radius:var(--radius-sm);font-weight:600;cursor:pointer;">Cerrar</button>
    </div>
  `;
  
  document.body.appendChild(modal);
};

function exportLibraryToPDF() {
  if (savedResources.length === 0) {
    alert('⚠️ No tienes recursos para exportar');
    return;
  }
  
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(10, 22, 40);
    doc.text('Mi Biblioteca - Luminom IA', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(74, 85, 104);
    doc.text(`Total de recursos: ${savedResources.length}`, 20, 30);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 20, 35);
    
    let yPos = 45;
    
    savedResources.forEach((resource, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont(undefined, 'bold');
      doc.setTextColor(201, 168, 76);
      doc.text(`${index + 1}. ${resource.title}`, 20, yPos);
      
      doc.setFont(undefined, 'normal');
      doc.setTextColor(10, 22, 40);
      const lines = doc.splitTextToSize(resource.content, 170);
      doc.text(lines, 20, yPos + 5);
      
      yPos += 10 + (lines.length * 5);
    });
    
    doc.save(`biblioteca-luminom-${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('✅ Biblioteca exportada a PDF', 'success');
  } catch (error) {
    console.error('Error al exportar:', error);
    alert('⚠️ Error al exportar. Asegúrate de que jsPDF esté cargado.');
  }
}

// ========================================
// SISTEMA DE NOTIFICACIONES
// ========================================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  const bgColors = {
    success: 'linear-gradient(135deg, #10b981, #059669)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${bgColors[type]};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    font-weight: 600;
    max-width: 350px;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Agregar animaciones
const animStyle = document.createElement('style');
animStyle.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(animStyle);

// ========================================
// INICIALIZACIÓN
// ========================================

// Inicializar todas las funcionalidades cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAdvancedFeatures);
} else {
  initAllAdvancedFeatures();
}

function initAllAdvancedFeatures() {
  // Esperar un poco para que el HTML principal cargue
  setTimeout(() => {
    console.log('🚀 Inicializando funcionalidades avanzadas...');
    
    try {
      initSearchHistory();
      console.log('✅ Búsqueda en historial inicializada');
    } catch (e) {
      console.error('Error en búsqueda:', e);
    }
    
    try {
      initFavorites();
      console.log('✅ Sistema de favoritos inicializado');
    } catch (e) {
      console.error('Error en favoritos:', e);
    }
    
    try {
      initLibrary();
      addSaveButtonToMessages();
      console.log('✅ Biblioteca de recursos inicializada');
    } catch (e) {
      console.error('Error en biblioteca:', e);
    }
    
    console.log('🎉 Funcionalidades avanzadas cargadas exitosamente');
  }, 1000);
}
