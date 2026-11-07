/**
 * ADHD Life Planner 3 (Edition 3) - Zen Sanctuary Controller
 * DOM event management, Web Audio dopamine chimes, curved island nav,
 * radial concentric momentum dial, and slide-up drawer orchestration.
 */

(function (global) {
  'use strict';

  let state = null;
  let audioCtx = null;

  // Web Audio Dopamine Chimes (100% Client-Side, Zero External Assets)
  function playSound(type) {
    if (!state || !state.profile.soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
      }
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;

      if (type === 'pop') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.09);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'chord') {
        // Warm restorative pentatonic chord (D4, F#4, A4, D5)
        [293.66, 369.99, 440.00, 587.33].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.12, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.5);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.55);
        });
      } else if (type === 'water') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      // Audio autoplay fallback
    }
  }

  function init() {
    state = LifeStorage.loadState();
    applyTheme(state.profile.theme || 'sage-harmony');
    applyFogMode(state.profile.fogMode);

    bindNavigation();
    bindHeaderControls();
    bindDrawer();
    bindEnergyDial();
    bindDailyAnchor();
    bindVitals();
    bindTasks();
    bindDopamineMenu();
    bindBrainDump();
    bindRoutines();
    bindSettings();
    bindModals();

    renderAll();

    // Check first-time tour
    if (!localStorage.getItem('adhd_life_3_tour_completed') && window.Leo) {
      setTimeout(() => {
        Leo.startTour(true);
      }, 350);
    }

    // Register service worker
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }
  }

  function renderAll() {
    renderDailyAnchor();
    renderVitals();
    renderTasks();
    renderDopamineMenu();
    renderBrainDump();
    renderRoutines();
    renderStreaks();
    renderDailyProgress();
  }

  function applyTheme(themeName) {
    const validTheme = themeName || 'sage-harmony';
    document.body.setAttribute('data-theme', validTheme);
    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) themeSelect.value = validTheme;
  }

  function applyFogMode(isActive) {
    if (isActive) {
      document.body.classList.add('fog-mode-active');
      const shieldBtn = document.getElementById('btn-burnout-shield');
      if (shieldBtn) {
        shieldBtn.classList.add('active');
        shieldBtn.textContent = '🛡️ Shield (ON)';
      }
    } else {
      document.body.classList.remove('fog-mode-active');
      const shieldBtn = document.getElementById('btn-burnout-shield');
      if (shieldBtn) {
        shieldBtn.classList.remove('active');
        shieldBtn.textContent = '🛡️ Shield';
      }
    }
  }

  function bindNavigation() {
    const navButtons = document.querySelectorAll('.island-tab[data-tab]');
    navButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });
  }

  function switchTab(tabName) {
    const navButtons = document.querySelectorAll('.island-tab[data-tab]');
    navButtons.forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabName);
    });

    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      const match = screen.id === `screen-${tabName}`;
      screen.classList.toggle('active', match);
    });

    closeDrawer();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function bindHeaderControls() {
    const shieldBtn = document.getElementById('btn-burnout-shield');
    if (shieldBtn) {
      shieldBtn.addEventListener('click', () => {
        state.profile.fogMode = !state.profile.fogMode;
        LifeStorage.saveState(state);
        applyFogMode(state.profile.fogMode);
        playSound('pop');
        renderTasks();
      });
    }

    const tourBtn = document.getElementById('btn-launch-tour');
    if (tourBtn) {
      tourBtn.addEventListener('click', () => {
        if (window.Leo) {
          Leo.startTour(true);
        }
      });
    }

    const soundBtn = document.getElementById('btn-toggle-sound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        state.profile.soundEnabled = !state.profile.soundEnabled;
        LifeStorage.saveState(state);
        soundBtn.textContent = state.profile.soundEnabled ? '🔔' : '🔕';
        if (state.profile.soundEnabled) playSound('pop');
      });
      soundBtn.textContent = state.profile.soundEnabled ? '🔔' : '🔕';
    }
  }

  function bindDrawer() {
    const fab = document.getElementById('btn-island-fab');
    const overlay = document.getElementById('zen-drawer-overlay');

    if (fab) {
      fab.addEventListener('click', () => {
        openDrawer();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeDrawer();
        }
      });
    }

    document.querySelectorAll('[data-drawer-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-drawer-tab');
        switchTab(tab);
      });
    });
  }

  function openDrawer() {
    const overlay = document.getElementById('zen-drawer-overlay');
    if (overlay) overlay.classList.add('active');
  }

  function closeDrawer() {
    const overlay = document.getElementById('zen-drawer-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  function bindEnergyDial() {
    const energyPills = document.querySelectorAll('.energy-pill');
    energyPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const lvl = pill.getAttribute('data-energy');
        state.profile.energyLevel = lvl;
        LifeStorage.saveState(state);
        playSound('pop');
        renderEnergyDial();
        renderTasks();
      });
    });
    renderEnergyDial();
  }

  function renderEnergyDial() {
    const energyPills = document.querySelectorAll('.energy-pill');
    energyPills.forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-energy') === state.profile.energyLevel);
    });
  }

  function bindDailyAnchor() {
    const checkEl = document.getElementById('anchor-checkbox');
    const inputEl = document.getElementById('anchor-input');

    if (checkEl) {
      checkEl.addEventListener('change', () => {
        state.anchor.completed = checkEl.checked;
        if (checkEl.checked) {
          playSound('chord');
          const today = LifeEngine.toISODate(new Date());
          state.streaks = LifeEngine.updateGraceStreak(state.streaks, today, true);
        } else {
          playSound('pop');
        }
        LifeStorage.saveState(state);
        renderDailyAnchor();
        renderStreaks();
        renderDailyProgress();
      });
    }

    if (inputEl) {
      inputEl.addEventListener('input', () => {
        state.anchor.text = inputEl.value;
        LifeStorage.saveState(state);
        renderDailyProgress();
      });
    }
  }

  function renderDailyAnchor() {
    const checkEl = document.getElementById('anchor-checkbox');
    const inputEl = document.getElementById('anchor-input');
    const cardEl = document.getElementById('daily-anchor-card');

    if (checkEl) checkEl.checked = !!state.anchor.completed;
    if (inputEl && inputEl.value !== state.anchor.text) {
      inputEl.value = state.anchor.text || '';
    }
    if (cardEl) {
      cardEl.classList.toggle('completed', !!state.anchor.completed);
    }
  }

  function bindVitals() {
    const waterAdd = document.getElementById('btn-water-add');
    const waterSub = document.getElementById('btn-water-sub');
    const medsCheck = document.getElementById('meds-checkbox');

    if (waterAdd) {
      waterAdd.addEventListener('click', () => {
        state.vitals.waterGlasses = Math.min(16, (state.vitals.waterGlasses || 0) + 1);
        LifeStorage.saveState(state);
        playSound('water');
        renderVitals();
        renderDailyProgress();
      });
    }

    if (waterSub) {
      waterSub.addEventListener('click', () => {
        state.vitals.waterGlasses = Math.max(0, (state.vitals.waterGlasses || 0) - 1);
        LifeStorage.saveState(state);
        playSound('pop');
        renderVitals();
        renderDailyProgress();
      });
    }

    if (medsCheck) {
      medsCheck.addEventListener('change', () => {
        state.vitals.medsTaken = medsCheck.checked;
        LifeStorage.saveState(state);
        playSound('pop');
        renderVitals();
        renderDailyProgress();
      });
    }
  }

  function renderVitals() {
    const waterCountEl = document.getElementById('water-count-display');
    const waterPillsContainer = document.getElementById('water-pills-row');
    const medsCheck = document.getElementById('meds-checkbox');

    const count = state.vitals.waterGlasses || 0;
    const target = state.vitals.targetWater || 8;

    if (waterCountEl) {
      waterCountEl.textContent = `${count}/${target} glasses`;
    }

    if (waterPillsContainer) {
      let html = '';
      for (let i = 1; i <= target; i++) {
        const filled = i <= count;
        html += `<span class="water-glass-dot ${filled ? 'filled' : ''}" title="Glass ${i}">💧</span>`;
      }
      waterPillsContainer.innerHTML = html;
    }

    if (medsCheck) {
      medsCheck.checked = !!state.vitals.medsTaken;
    }
  }

  function bindTasks() {
    const addTaskBtn = document.getElementById('btn-open-add-task');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => {
        openModal('modal-add-task');
      });
    }

    const form = document.getElementById('form-add-task');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('input-task-title');
        const energySelect = document.getElementById('select-task-energy');
        const title = (titleInput.value || '').trim();
        const energy = energySelect.value || 'normal';

        if (!title) return;

        const newTask = {
          id: 'task-' + Date.now(),
          title: title,
          energy: energy,
          completed: false,
          isEssential: energy === 'low',
          subtasks: []
        };

        state.tasks.push(newTask);
        LifeStorage.saveState(state);
        playSound('pop');

        titleInput.value = '';
        closeModal('modal-add-task');
        renderTasks();
        renderDailyProgress();
      });
    }
  }

  function renderTasks() {
    const listEl = document.getElementById('active-tasks-list');
    if (!listEl) return;

    const filtered = LifeEngine.calculateEnergyFilteredTasks(
      state.tasks,
      state.profile.energyLevel,
      state.profile.fogMode
    );

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:24px 14px;color:var(--text-hint);">
          <p style="font-weight:700;font-size:14px;color:var(--text-muted);margin-bottom:4px;">🌿 Quiet Sanctuary.</p>
          <p style="font-size:12px;">All tasks resting for this energy level.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(task => {
      const isDone = !!task.completed;
      const energyBadge = task.energy === 'low' ? '🟢 Low Spoons' : (task.energy === 'high' ? '⚡ High Focus' : '🟡 Steady');

      html += `
        <div class="task-card ${isDone ? 'completed' : ''}" data-task-id="${task.id}">
          <label class="custom-check-label">
            <input type="checkbox" class="task-item-check" data-id="${task.id}" ${isDone ? 'checked' : ''} />
            <span class="custom-check-box"></span>
          </label>
          <div class="task-card-content">
            <span class="task-title-text">${LifeEngine.sanitizeText(task.title)}</span>
            <div class="task-tags-row">
              <span class="badge-energy">${energyBadge}</span>
              ${task.subtasks && task.subtasks.length > 0 ? `<span class="badge-subtasks">${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} steps</span>` : ''}
            </div>
            ${renderSubtasksList(task)}
          </div>
          <div class="task-card-actions">
            <button class="btn-icon btn-dechunk" data-id="${task.id}" title="Break into 3-min steps">✂️</button>
            <button class="btn-icon btn-delete-task" data-id="${task.id}" title="Delete task">🗑️</button>
          </div>
        </div>
      `;
    });

    listEl.innerHTML = html;

    listEl.querySelectorAll('.task-item-check').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-id');
        const task = state.tasks.find(t => t.id === id);
        if (task) {
          task.completed = chk.checked;
          if (chk.checked) playSound('pop');
          LifeStorage.saveState(state);
          renderTasks();
          renderDailyProgress();
        }
      });
    });

    listEl.querySelectorAll('.btn-dechunk').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const task = state.tasks.find(t => t.id === id);
        if (task) {
          task.subtasks = LifeEngine.dechunkTask(task.title);
          LifeStorage.saveState(state);
          playSound('pop');
          renderTasks();
        }
      });
    });

    listEl.querySelectorAll('.btn-delete-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        state.tasks = state.tasks.filter(t => t.id !== id);
        LifeStorage.saveState(state);
        playSound('pop');
        renderTasks();
        renderDailyProgress();
      });
    });

    listEl.querySelectorAll('.subtask-check').forEach(chk => {
      chk.addEventListener('change', () => {
        const taskId = chk.getAttribute('data-task-id');
        const subIndex = parseInt(chk.getAttribute('data-sub-index'), 10);
        const task = state.tasks.find(t => t.id === taskId);
        if (task && task.subtasks && task.subtasks[subIndex]) {
          task.subtasks[subIndex].completed = chk.checked;
          if (chk.checked) playSound('pop');
          LifeStorage.saveState(state);
          renderTasks();
        }
      });
    });
  }

  function renderSubtasksList(task) {
    if (!task.subtasks || task.subtasks.length === 0) return '';
    let html = '<div class="subtasks-container">';
    task.subtasks.forEach((sub, idx) => {
      html += `
        <div class="subtask-row ${sub.completed ? 'completed' : ''}">
          <label class="custom-check-label" style="gap:6px;">
            <input type="checkbox" class="subtask-check" data-task-id="${task.id}" data-sub-index="${idx}" ${sub.completed ? 'checked' : ''} />
            <span class="custom-check-box" style="width:20px;height:20px;border-radius:6px;"></span>
            <span class="subtask-text">${LifeEngine.sanitizeText(sub.title)}</span>
          </label>
          <span class="subtask-duration">${sub.duration || '3 min'}</span>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }

  function bindDopamineMenu() {
    document.querySelectorAll('.zen-ritual-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        playSound('pop');
        btn.style.borderColor = 'var(--accent-primary)';
        btn.style.boxShadow = '0 0 16px rgba(224, 122, 95, 0.4)';
        setTimeout(() => {
          btn.style.borderColor = '';
          btn.style.boxShadow = '';
        }, 600);
      });
    });

    const surpriseBtn = document.getElementById('btn-dopamine-surprise');
    if (surpriseBtn) {
      surpriseBtn.addEventListener('click', () => {
        const pick = LifeEngine.getDopamineRandomPick(state.dopamineMenu, 'any');
        if (pick) {
          playSound('chord');
          const titleEl = document.getElementById('surprise-pick-title');
          const durEl = document.getElementById('surprise-pick-duration');
          if (titleEl) titleEl.textContent = pick.title;
          if (durEl) durEl.textContent = `⏱️ ${pick.duration}`;
          openModal('modal-surprise-pick');
        }
      });
    }

    const addDopBtn = document.getElementById('btn-open-add-dopamine');
    if (addDopBtn) {
      addDopBtn.addEventListener('click', () => {
        openModal('modal-add-dopamine');
      });
    }

    const form = document.getElementById('form-add-dopamine');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const catSelect = document.getElementById('select-dopamine-category');
        const titleInput = document.getElementById('input-dopamine-title');
        const durInput = document.getElementById('input-dopamine-duration');

        const cat = catSelect.value || 'appetizers';
        const title = (titleInput.value || '').trim();
        const duration = (durInput.value || '').trim() || '3 min';

        if (!title) return;

        const newItem = {
          id: 'dop-' + Date.now(),
          title: title,
          duration: duration,
          icon: 'leaf'
        };

        if (Array.isArray(state.dopamineMenu[cat])) {
          state.dopamineMenu[cat].push(newItem);
        } else {
          state.dopamineMenu[cat] = [newItem];
        }

        LifeStorage.saveState(state);
        playSound('pop');

        titleInput.value = '';
        closeModal('modal-add-dopamine');
        renderDopamineMenu();
      });
    }
  }

  function renderDopamineMenu() {
    ['appetizers', 'entrees', 'sides', 'desserts'].forEach(cat => {
      const col = document.getElementById(`dopamine-list-${cat}`);
      if (!col) return;

      const items = (state.dopamineMenu && state.dopamineMenu[cat]) || [];
      if (items.length === 0) {
        col.innerHTML = `<div style="font-size:12px;color:var(--text-hint);padding:8px 0;">No items yet.</div>`;
        return;
      }

      let html = '';
      items.forEach(item => {
        html += `
          <div class="dopamine-item-card">
            <span>${LifeEngine.sanitizeText(item.title)}</span>
            <span class="dopamine-item-pill">${LifeEngine.sanitizeText(item.duration)}</span>
          </div>
        `;
      });
      col.innerHTML = html;
    });
  }

  function bindBrainDump() {
    const textarea = document.getElementById('braindump-textarea');
    if (textarea) {
      textarea.addEventListener('input', () => {
        state.brainDump = textarea.value;
        LifeStorage.saveState(state);
      });
    }
  }

  function renderBrainDump() {
    const textarea = document.getElementById('braindump-textarea');
    if (textarea && textarea.value !== state.brainDump) {
      textarea.value = state.brainDump || '';
    }
  }

  function bindRoutines() {
    ['morning', 'afternoon', 'evening'].forEach(slot => {
      const container = document.getElementById(`routines-list-${slot}`);
      if (!container) return;

      container.addEventListener('change', (e) => {
        if (e.target && e.target.classList.contains('routine-item-check')) {
          const id = e.target.getAttribute('data-id');
          const routine = state.routines.find(r => r.id === id);
          if (routine) {
            routine.completed = e.target.checked;
            if (e.target.checked) {
              playSound('pop');
              const today = LifeEngine.toISODate(new Date());
              state.streaks = LifeEngine.updateGraceStreak(state.streaks, today, true);
            }
            LifeStorage.saveState(state);
            renderRoutines();
            renderStreaks();
            renderDailyProgress();
          }
        }
      });
    });
  }

  function renderRoutines() {
    ['morning', 'afternoon', 'evening'].forEach(slot => {
      const container = document.getElementById(`routines-list-${slot}`);
      if (!container) return;

      const items = (state.routines || []).filter(r => r.slot === slot);
      if (items.length === 0) {
        container.innerHTML = `<div style="font-size:12px;color:var(--text-hint);padding:6px 0;">No routines.</div>`;
        return;
      }

      let html = '';
      items.forEach(r => {
        const isDone = !!r.completed;
        html += `
          <div class="routine-item-row ${isDone ? 'completed' : ''}">
            <label class="custom-check-label" style="gap:10px;">
              <input type="checkbox" class="routine-item-check" data-id="${r.id}" ${isDone ? 'checked' : ''} />
              <span class="custom-check-box"></span>
              <span class="routine-text">${LifeEngine.sanitizeText(r.title)}</span>
            </label>
          </div>
        `;
      });
      container.innerHTML = html;
    });
  }

  function renderStreaks() {
    const streakDaysEl = document.getElementById('streak-count-days');
    const graceLeftEl = document.getElementById('streak-grace-left');
    const totalDaysEl = document.getElementById('streak-total-days');

    const streaks = state.streaks || { currentStreak: 1, graceDaysAvailable: 2, totalActiveDays: 1 };

    if (streakDaysEl) streakDaysEl.textContent = `${streaks.currentStreak} Days`;
    if (graceLeftEl) graceLeftEl.textContent = `${streaks.graceDaysAvailable} Grace Days`;
    if (totalDaysEl) totalDaysEl.textContent = `${streaks.totalActiveDays} Total Wins`;
  }

  function renderDailyProgress() {
    const filteredTasks = LifeEngine.calculateEnergyFilteredTasks(
      state.tasks,
      state.profile.energyLevel,
      state.profile.fogMode
    );

    const progress = LifeEngine.calculateDailyProgress(
      state.anchor,
      state.vitals,
      state.routines,
      filteredTasks
    );

    const dialNumber = document.getElementById('dial-number');
    const dialStatus = document.getElementById('dial-status-pill');

    if (dialNumber) dialNumber.textContent = `${progress.percentage}%`;
    if (dialStatus) dialStatus.textContent = progress.message;
  }

  function bindSettings() {
    const themeSelect = document.getElementById('setting-theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', () => {
        const newTheme = themeSelect.value;
        state.profile.theme = newTheme;
        LifeStorage.saveState(state);
        applyTheme(newTheme);
      });
    }

    const exportBtn = document.getElementById('btn-export-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = LifeStorage.exportBackupJSON(state);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `adhd-life-sanctuary-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    const importInput = document.getElementById('input-import-json');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = LifeStorage.importBackupJSON(event.target.result);
          if (res.success) {
            state = res.state;
            applyTheme(state.profile.theme);
            applyFogMode(state.profile.fogMode);
            renderAll();
            alert('Sanctuary backup restored!');
          } else {
            alert('Import error: ' + res.error);
          }
        };
        reader.readAsText(file);
      });
    }

    const resetBtn = document.getElementById('btn-reset-all');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset all sanctuary data to defaults? Your current checklist will be refreshed.')) {
          state = LifeStorage.resetAllData();
          applyTheme(state.profile.theme);
          applyFogMode(state.profile.fogMode);
          renderAll();
        }
      });
    }
  }

  function bindModals() {
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    });

    document.querySelectorAll('.zen-modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    });
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      const firstInput = modal.querySelector('input, select, textarea');
      if (firstInput) firstInput.focus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // Public ZenApp API
  global.ZenApp = {
    init: init,
    switchTab: switchTab,
    openModal: openModal,
    closeModal: closeModal,
    renderAll: renderAll,
    getState: () => state,
    playSound: playSound
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(typeof window !== 'undefined' ? window : this);
