/**
 * ADHD Student Planner 3 — Zen Sanctuary UI & State Controller (Edition 3: Shop 3 Brand DNA)
 * Manages Curved Floating Zen Island Navigation, Concentric Radial Dial, Modals,
 * Audio Synthesis, and Restorative Flow Sprints.
 */

(function () {
  'use strict';

  let state = null;
  let activeCourseFilter = 'all';
  let searchQuery = '';
  let sprintInterval = null;
  let sprintRemainingSeconds = 20 * 60;
  let sprintIsRunning = false;

  function getTodayISO() {
    return window.StudentEngine ? window.StudentEngine.toISODate(new Date()) : new Date().toISOString().split('T')[0];
  }

  function init() {
    state = window.StudentStorage.load();

    // Auto-clean slate check (RULE-22):
    // If the onboarding tour was completed, ensure default tutorial mock data does not linger.
    const hasSeenTour = localStorage.getItem('adhd_student_zen_seen_tour_v1');
    const hasCleaned = localStorage.getItem('adhd_student_zen_cleaned_v1');
    if (hasSeenTour && !hasCleaned) {
      const isDefaultMockData = state.courses && state.courses.some(c => c.id === 'course-1');
      if (isDefaultMockData) {
        state = window.StudentStorage.cleanSlate();
        localStorage.setItem('adhd_student_zen_cleaned_v1', 'true');
      }
    }

    const today = getTodayISO();
    const streakResult = window.StudentEngine.calculateStreak(
      state.profile.lastActiveDate,
      today,
      state.profile.studyStreak,
      state.profile.graceTokens
    );
    state.profile.studyStreak = streakResult.streak;
    state.profile.graceTokens = streakResult.graceTokens;
    state.profile.lastActiveDate = today;
    window.StudentStorage.save(state);

    applyTheme(state.settings.theme || 'sage-harmony');
    document.body.setAttribute('data-active-tab', 'dashboard');
    setupNavigation();
    setupEventListeners();
    setupModals();
    renderAll();

    if (window.LeoTour) {
      window.LeoTour.initTourHandlers();
      window.LeoTour.startTour(false);
    }
  }

  window.setCleanSlateState = function (force) {
    if (!force) {
      const isDefaultData = !state.courses || state.courses.length === 0 ||
        state.courses.every(c => ['course-1', 'course-2', 'course-3'].includes(c.id));
      if (!isDefaultData) return;
    }
    state = window.StudentStorage.cleanSlate();
    localStorage.setItem('adhd_student_zen_cleaned_v1', 'true');
    renderAll();
  };

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    const select = document.getElementById('select-theme');
    if (select) select.value = theme;
  }

  function setupNavigation() {
    const tabs = document.querySelectorAll('.island-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function (e) {
        e.preventDefault();
        const targetTab = this.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });
  }

  function switchTab(tabId) {
    document.body.setAttribute('data-active-tab', tabId);

    document.querySelectorAll('.island-tab').forEach(t => {
      if (t.getAttribute('data-tab') === tabId) {
        t.classList.add('active');
        t.setAttribute('aria-selected', 'true');
      } else {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      }
    });

    document.querySelectorAll('.zen-screen').forEach(s => {
      if (s.id === `screen-${tabId}`) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Expose switchTab globally for tour synchronization (Rule-11)
  window.switchStudentTab = switchTab;

  function setupEventListeners() {
    // Sensory Rest Mode Toggle
    const btnFog = document.getElementById('btn-fog-zen');
    if (btnFog) {
      btnFog.addEventListener('click', function () {
        state.settings.fogMode = !state.settings.fogMode;
        window.StudentStorage.save(state);
        renderHeader();
        renderRadialDial();
        renderTelemetry();
        renderFocusHero();
        renderAssignments();
      });
    }

    // Restart Leo Tour
    const btnRestartTour = document.getElementById('btn-restart-tour');
    if (btnRestartTour) {
      btnRestartTour.addEventListener('click', function () {
        switchTab('dashboard');
        if (window.LeoTour) {
          window.LeoTour.startTour(true);
        }
      });
    }

    // Theme selector
    const selectTheme = document.getElementById('select-theme');
    if (selectTheme) {
      selectTheme.addEventListener('change', function () {
        state.settings.theme = this.value;
        applyTheme(this.value);
        window.StudentStorage.save(state);
      });
    }

    // Sound toggle
    const chkSound = document.getElementById('chk-sound-enabled');
    if (chkSound) {
      chkSound.checked = !!state.settings.soundEnabled;
      chkSound.addEventListener('change', function () {
        state.settings.soundEnabled = this.checked;
        window.StudentStorage.save(state);
      });
    }

    // JSON Export
    const btnExport = document.getElementById('btn-export-json');
    if (btnExport) {
      btnExport.addEventListener('click', function () {
        const jsonStr = window.StudentStorage.exportJSON(state);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `adhd-student-zen-backup-${getTodayISO()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // JSON Import
    const inputImport = document.getElementById('input-import-file');
    if (inputImport) {
      inputImport.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (evt) {
          const res = window.StudentStorage.importJSON(evt.target.result);
          if (res.success) {
            state = res.state;
            applyTheme(state.settings.theme);
            renderAll();
            alert('🌿 Academic Sanctuary successfully restored from backup.');
          } else {
            alert('❌ Backup import failed: ' + res.error);
          }
        };
        reader.readAsText(file);
      });
    }

    // Reset / Clean Slate Data (RULE-22)
    const btnCleanSlate = document.getElementById('btn-clean-slate');
    if (btnCleanSlate) {
      btnCleanSlate.addEventListener('click', function () {
        if (confirm('Clear all courses, deliverables, and exams to start fresh with a pristine clean slate?')) {
          window.setCleanSlateState(true);
          alert('Academic Sanctuary cleared to a clean slate. Ready for your actual curriculum!');
        }
      });
    }

    const btnLoadSample = document.getElementById('btn-load-sample');
    if (btnLoadSample) {
      btnLoadSample.addEventListener('click', function () {
        if (confirm('Load sample academic curriculum and deliverables?')) {
          state = window.StudentStorage.reset();
          localStorage.removeItem('adhd_student_zen_cleaned_v1');
          applyTheme(state.settings.theme);
          renderAll();
          alert('Sample academic curriculum loaded.');
        }
      });
    }

    const btnReset = document.getElementById('btn-reset-data');
    if (btnReset) {
      btnReset.addEventListener('click', function () {
        if (confirm('Clear all courses, deliverables, and exams to start fresh with a pristine clean slate?')) {
          window.setCleanSlateState(true);
          alert('Academic Sanctuary cleared to a clean slate. Ready for your actual curriculum!');
        }
      });
    }

    // Flow Sprint Timer Toggle
    const btnSprintToggle = document.getElementById('btn-sprint-toggle');
    if (btnSprintToggle) {
      btnSprintToggle.addEventListener('click', function () {
        if (sprintIsRunning) {
          pauseSprintTimer();
        } else {
          startSprintTimer();
        }
      });
    }

    const btnSprintReset = document.getElementById('btn-sprint-reset');
    if (btnSprintReset) {
      btnSprintReset.addEventListener('click', function () {
        resetSprintTimer();
      });
    }
  }

  function setupModals() {
    document.querySelectorAll('[data-open-modal]').forEach(btn => {
      btn.addEventListener('click', function () {
        const modalId = this.getAttribute('data-open-modal');
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', function () {
        const modalId = this.getAttribute('data-close-modal');
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
      });
    });

    // Close on outside backdrop click
    document.querySelectorAll('.zen-modal').forEach(modal => {
      modal.addEventListener('click', function (e) {
        if (e.target === this) {
          this.classList.remove('active');
        }
      });
    });

    // Modal Add Assignment Form
    const formAddAsg = document.getElementById('form-add-assignment');
    if (formAddAsg) {
      formAddAsg.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = document.getElementById('input-asg-title').value.trim();
        const courseId = document.getElementById('select-asg-course').value;
        const category = document.getElementById('select-asg-category').value;
        const dueDate = document.getElementById('input-asg-date').value;
        const isEssential = document.getElementById('chk-asg-essential').checked;
        const autoDechunk = document.getElementById('chk-asg-dechunk').checked;

        if (!title || !dueDate) return;

        let milestones = [];
        if (autoDechunk && window.StudentEngine) {
          milestones = window.StudentEngine.dechunkAssignment(title, category);
        }

        const newAsg = {
          id: 'asg-' + Date.now(),
          courseId: courseId,
          title: title,
          category: category,
          dueDate: dueDate,
          dueTime: '23:59',
          score: null,
          maxScore: 100,
          isEssential: isEssential,
          completed: false,
          completedDate: null,
          dechunkedMilestones: milestones
        };

        state.assignments.unshift(newAsg);
        window.StudentStorage.save(state);
        formAddAsg.reset();
        document.getElementById('modal-add-assignment').classList.remove('active');
        renderAll();
        playZenChime('success');
      });
    }

    // Modal Add Course Form
    const formAddCourse = document.getElementById('form-add-course');
    if (formAddCourse) {
      formAddCourse.addEventListener('submit', function (e) {
        e.preventDefault();
        const code = document.getElementById('input-course-code').value.trim();
        const name = document.getElementById('input-course-name').value.trim();
        const color = document.getElementById('input-course-color').value || '#e07a5f';
        const target = parseFloat(document.getElementById('input-course-target').value) || 90;

        if (!code || !name) return;

        const newCourse = {
          id: 'course-' + Date.now(),
          code: code,
          name: name,
          color: color,
          instructor: 'Department Faculty',
          room: 'Academic Hall',
          scheduleDays: ['Mon', 'Wed'],
          scheduleTime: 'TBD',
          targetGrade: target,
          weights: { assignments: 40, quizzes: 20, midterm: 20, final: 20 }
        };

        state.courses.push(newCourse);
        window.StudentStorage.save(state);
        formAddCourse.reset();
        document.getElementById('modal-add-course').classList.remove('active');
        renderAll();
        playZenChime('success');
      });
    }

    // Modal Add Exam Form
    const formAddExam = document.getElementById('form-add-exam');
    if (formAddExam) {
      formAddExam.addEventListener('submit', function (e) {
        e.preventDefault();
        const courseId = document.getElementById('select-exam-course').value;
        const title = document.getElementById('input-exam-title').value.trim();
        const date = document.getElementById('input-exam-date').value;
        const time = document.getElementById('input-exam-time').value || '10:00 AM';
        const location = document.getElementById('input-exam-location').value.trim() || 'Auditorium';
        const weight = parseFloat(document.getElementById('input-exam-weight').value) || 20;

        if (!title || !date) return;

        const newExam = {
          id: 'exam-' + Date.now(),
          courseId: courseId,
          title: title,
          examDate: date,
          examTime: time,
          location: location,
          weight: weight,
          targetScore: 90,
          checklist: [
            { id: 'c-' + Date.now() + '-1', text: 'Synthesize lecture summary & key formulas', done: false },
            { id: 'c-' + Date.now() + '-2', text: 'Complete practice exam problem set', done: false },
            { id: 'c-' + Date.now() + '-3', text: 'Mindful review of flagged error points', done: false }
          ]
        };

        state.exams.push(newExam);
        window.StudentStorage.save(state);
        formAddExam.reset();
        document.getElementById('modal-add-exam').classList.remove('active');
        renderAll();
        playZenChime('success');
      });
    }
  }

  function renderAll() {
    renderHeader();
    renderRadialDial();
    renderTelemetry();
    renderFocusHero();
    renderAssignments();
    renderCourses();
    renderExams();
    renderSettings();
    populateCourseSelects();
  }

  function renderHeader() {
    const btnFog = document.getElementById('btn-fog-zen');
    if (btnFog) {
      if (state.settings.fogMode) {
        btnFog.classList.add('active');
        btnFog.innerHTML = '🛡️ Sensory Rest ON';
      } else {
        btnFog.classList.remove('active');
        btnFog.innerHTML = '🛡️ Sensory Rest';
      }
    }

    const streakBadge = document.getElementById('badge-study-streak');
    if (streakBadge) {
      streakBadge.textContent = `🔥 ${state.profile.studyStreak}d Streak`;
    }

    const graceBadge = document.getElementById('badge-grace-tokens');
    if (graceBadge) {
      graceBadge.textContent = `🛡️ ${state.profile.graceTokens} Shields`;
    }
  }

  function renderRadialDial() {
    const overallGpa = window.StudentEngine.calculateOverallGPA(state.courses, state.assignments);
    const container = document.getElementById('radial-hero-card');
    if (!container) return;

    const totalAsgs = state.assignments.length;
    const completedAsgs = state.assignments.filter(a => a.completed).length;
    const pct = totalAsgs > 0 ? Math.round((completedAsgs / totalAsgs) * 100) : 0;

    const radius = 64;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = circumference;
    const strokeOffset = circumference - (pct / 100) * circumference;

    container.innerHTML = `
      <div class="radial-dial-svg-wrap">
        <svg width="170" height="170" viewBox="0 0 170 170">
          <circle cx="85" cy="85" r="${radius}" fill="none" stroke="rgba(242, 204, 143, 0.1)" stroke-width="14"/>
          <circle cx="85" cy="85" r="${radius}" fill="none" stroke="url(#terracottaGradZen)" stroke-width="14"
                  stroke-linecap="round" stroke-dasharray="${strokeDash}" stroke-dashoffset="${strokeOffset}"
                  transform="rotate(-90 85 85)" style="transition: stroke-dashoffset 0.6s ease;"/>
          <defs>
            <linearGradient id="terracottaGradZen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f49c7f"/>
              <stop offset="50%" stop-color="#e07a5f"/>
              <stop offset="100%" stop-color="#ba5338"/>
            </linearGradient>
          </defs>
        </svg>
        <div class="radial-dial-center-text">
          <div class="radial-center-val">${overallGpa.gpa}</div>
          <div class="radial-center-sub">Weighted GPA</div>
        </div>
      </div>

      <div class="radial-hero-info">
        <div class="radial-hero-title">Academic Momentum Harmony</div>
        <p class="radial-hero-desc">
          ${totalAsgs === 0 ? 'Fresh Academic Sanctuary active. Log your deliverables or enroll courses below.' : `${completedAsgs} of ${totalAsgs} deliverables completed (${pct}% semester throughput).`}
          ${state.settings.fogMode ? 'Sensory Rest Mode active: distant future deliverables blurred.' : 'All academic horizons active.'}
        </p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn-zen btn-zen-sm btn-zen-primary" data-open-modal="modal-add-assignment">+ Log Deliverable</button>
          <button id="btn-restart-tour" class="btn-zen btn-zen-sm btn-zen-secondary">Leo’s Walkthrough 🌿</button>
        </div>
      </div>
    `;

    // Re-bind tour button inside dynamically rendered card
    const btnTour = container.querySelector('#btn-restart-tour');
    if (btnTour) {
      btnTour.addEventListener('click', () => {
        switchTab('dashboard');
        if (window.LeoTour) window.LeoTour.startTour(true);
      });
    }

    // Re-bind modal opener
    const btnAdd = container.querySelector('[data-open-modal="modal-add-assignment"]');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        const modal = document.getElementById('modal-add-assignment');
        if (modal) modal.classList.add('active');
      });
    }
  }

  function renderTelemetry() {
    const today = getTodayISO();
    const overallGpa = window.StudentEngine.calculateOverallGPA(state.courses, state.assignments);

    const tileGpa = document.getElementById('telemetry-val-gpa');
    if (tileGpa) tileGpa.textContent = overallGpa.gpa;

    const pendingUrgent = (state.assignments || []).filter(a => {
      if (a.completed) return false;
      const days = window.StudentEngine.diffDays(today, a.dueDate);
      return days <= 2;
    }).length;
    const tileUrgent = document.getElementById('telemetry-val-urgent');
    if (tileUrgent) tileUrgent.textContent = `${pendingUrgent} Urgent`;

    const tileGrace = document.getElementById('telemetry-val-grace');
    if (tileGrace) tileGrace.textContent = `${state.profile.graceTokens} Shields`;

    const tileMinutes = document.getElementById('telemetry-val-minutes');
    if (tileMinutes) tileMinutes.textContent = `${state.profile.totalStudyMinutes}m`;
  }

  function renderFocusHero() {
    const today = getTodayISO();
    const hero = window.StudentEngine.getSingleFocusAction(state.assignments, today, state.settings.fogMode);
    const container = document.getElementById('zen-focus-hero');
    if (!container) return;

    if (!hero.hasTask) {
      container.innerHTML = `
        <div class="zen-focus-tag">🌿 Academic Mindful Sanctuary</div>
        <div class="zen-task-title" style="margin-top: 6px; font-size: 1.15rem; font-weight: 800; color: var(--accent-mint);">
          ${hero.message}
        </div>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 6px;">
          Executive momentum preserved. Review your curriculum or engage a restorative flow break.
        </p>
        <div style="margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
          <button class="btn-zen btn-zen-sm btn-zen-primary" id="btn-hero-add-asg">+ Log Deliverable</button>
          <button class="btn-zen btn-zen-sm btn-zen-secondary" id="btn-hero-view-asgs">View Deliverables</button>
          <button class="btn-zen btn-zen-sm btn-zen-secondary" id="btn-hero-restore-demo">↺ Reload Sample Data</button>
        </div>
      `;

      const btnAdd = container.querySelector('#btn-hero-add-asg');
      if (btnAdd) {
        btnAdd.addEventListener('click', () => {
          const m = document.getElementById('modal-add-assignment');
          if (m) m.classList.add('active');
        });
      }

      const btnView = container.querySelector('#btn-hero-view-asgs');
      if (btnView) {
        btnView.addEventListener('click', () => switchTab('assignments'));
      }

      const btnRestore = container.querySelector('#btn-hero-restore-demo');
      if (btnRestore) {
        btnRestore.addEventListener('click', () => {
          state = window.StudentStorage.reset();
          renderAll();
        });
      }
      return;
    }

    const assignment = state.assignments.find(a => a.id === hero.assignmentId);
    const course = state.courses.find(c => c.id === assignment.courseId) || { code: 'ACAD', name: 'General' };

    let milestonesHtml = '';
    if (assignment.dechunkedMilestones && assignment.dechunkedMilestones.length > 0) {
      const completedCount = assignment.dechunkedMilestones.filter(m => m.done).length;
      milestonesHtml = `
        <div style="margin-top: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-hint); font-weight: 700; margin-bottom: 6px;">
            <span>EXECUTION MILESTONES (${completedCount}/${assignment.dechunkedMilestones.length})</span>
          </div>
          ${assignment.dechunkedMilestones.map(m => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: var(--bg-chip); border-radius: 8px; margin-bottom: 5px; cursor: pointer;"
                 data-milestone-id="${m.id}" data-assignment-id="${assignment.id}">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: ${m.done ? 'var(--accent-mint)' : 'var(--text-hint)'}; font-size: 1.05rem;">
                  ${m.done ? '✓' : '○'}
                </span>
                <span style="font-size: 0.85rem; color: ${m.done ? 'var(--text-hint)' : 'var(--text-zen)'}; text-decoration: ${m.done ? 'line-through' : 'none'};">
                  ${window.StudentEngine.sanitizeText(m.text)}
                </span>
              </div>
              <span style="font-size: 0.72rem; color: var(--text-hint);">${m.minutes}m</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span class="zen-focus-tag">🌿 Current Mindful Focus</span>
        <span class="zen-badge" style="font-size: 0.72rem; padding: 3px 10px;">${hero.urgency.label}</span>
      </div>

      <div class="zen-task-title">${window.StudentEngine.sanitizeText(hero.title)}</div>

      <div style="display: flex; gap: 8px; align-items: center;">
        <span class="zen-badge" style="font-size: 0.72rem;">${course.code}</span>
        ${hero.isEssential ? '<span class="zen-badge" style="border-color: var(--accent-gold); color: var(--accent-gold);">Essential Priority</span>' : ''}
      </div>

      <div class="zen-step-pill">
        <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-hint); font-weight: 700;">Immediate Action Step</div>
        <div class="zen-step-text">${window.StudentEngine.sanitizeText(hero.nextStepText)} (~${hero.nextStepMinutes} min)</div>
      </div>

      ${milestonesHtml}

      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 14px;">
        <button class="btn-zen btn-zen-primary btn-complete-asg" data-assignment-id="${hero.assignmentId}">
          ✓ Complete Task
        </button>
        ${(!assignment.dechunkedMilestones || assignment.dechunkedMilestones.length === 0) ? `
          <button class="btn-zen btn-zen-secondary btn-dechunk-asg" data-assignment-id="${hero.assignmentId}">
            🪄 De-Chunk (4 Steps)
          </button>
        ` : ''}
      </div>
    `;

    bindHUDMilestoneClicks(container);
  }

  function bindHUDMilestoneClicks(container) {
    container.querySelectorAll('[data-milestone-id]').forEach(item => {
      item.addEventListener('click', function () {
        const asgId = this.getAttribute('data-assignment-id');
        const mId = this.getAttribute('data-milestone-id');
        toggleMilestone(asgId, mId);
      });
    });

    const btnComplete = container.querySelector('.btn-complete-asg');
    if (btnComplete) {
      btnComplete.addEventListener('click', function () {
        const asgId = this.getAttribute('data-assignment-id');
        toggleAssignmentComplete(asgId);
      });
    }

    const btnDechunk = container.querySelector('.btn-dechunk-asg');
    if (btnDechunk) {
      btnDechunk.addEventListener('click', function () {
        const asgId = this.getAttribute('data-assignment-id');
        dechunkAssignmentAction(asgId);
      });
    }
  }

  function toggleMilestone(assignmentId, milestoneId) {
    const asg = state.assignments.find(a => a.id === assignmentId);
    if (!asg || !asg.dechunkedMilestones) return;

    const m = asg.dechunkedMilestones.find(item => item.id === milestoneId);
    if (!m) return;

    m.done = !m.done;

    const allDone = asg.dechunkedMilestones.every(item => item.done);
    if (allDone) {
      asg.completed = true;
      asg.completedDate = getTodayISO();
      playZenChime('success');
    } else {
      asg.completed = false;
      asg.completedDate = null;
    }

    window.StudentStorage.save(state);
    renderAll();
  }

  function toggleAssignmentComplete(assignmentId) {
    const asg = state.assignments.find(a => a.id === assignmentId);
    if (!asg) return;

    asg.completed = !asg.completed;
    asg.completedDate = asg.completed ? getTodayISO() : null;

    if (asg.completed && asg.dechunkedMilestones) {
      asg.dechunkedMilestones.forEach(m => { m.done = true; });
    }

    if (asg.completed) {
      playZenChime('success');
    }

    window.StudentStorage.save(state);
    renderAll();
  }

  function dechunkAssignmentAction(assignmentId) {
    const asg = state.assignments.find(a => a.id === assignmentId);
    if (!asg || !window.StudentEngine) return;

    asg.dechunkedMilestones = window.StudentEngine.dechunkAssignment(asg.title, asg.category);
    window.StudentStorage.save(state);
    renderAll();
    playZenChime('dechunk');
  }

  function renderAssignments() {
    const container = document.getElementById('list-assignments');
    if (!container) return;

    const today = getTodayISO();
    const filtered = window.StudentEngine.filterAssignments(state.assignments, {
      courseId: activeCourseFilter,
      fogMode: state.settings.fogMode,
      showCompleted: false,
      todayStr: today
    }).filter(a => {
      if (!searchQuery) return true;
      return a.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="zen-card" style="text-align: center; padding: 40px 20px;">
          <p style="color: var(--text-hint); font-size: 0.95rem;">
            ${state.settings.fogMode ? 'Sensory Rest Mode is active: distant tasks are softened.' : 'No active deliverables in this view.'}
          </p>
          <div style="margin-top: 14px; display: flex; justify-content: center; gap: 8px;">
            <button class="btn-zen btn-zen-sm btn-zen-primary" data-open-modal="modal-add-assignment">+ Log Deliverable</button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(asg => {
      const course = state.courses.find(c => c.id === asg.courseId) || { code: 'ACAD', color: '#e07a5f' };
      const urgency = window.StudentEngine.calculateUrgency(asg.dueDate, today);

      return `
        <div class="zen-card" style="margin-bottom: 12px; padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div style="flex: 1; min-width: 0;">
              <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px;">
                <span class="zen-badge" style="font-size: 0.7rem; padding: 2px 8px;">${course.code}</span>
                <span class="zen-badge" style="font-size: 0.7rem; padding: 2px 8px; border-color: var(--border-zen);">${urgency.label}</span>
                ${asg.isEssential ? '<span class="zen-badge" style="font-size: 0.7rem; padding: 2px 8px; border-color: var(--accent-gold); color: var(--accent-gold);">Essential</span>' : ''}
              </div>
              <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-zen); word-break: break-word; overflow-wrap: break-word;">
                ${window.StudentEngine.sanitizeText(asg.title)}
              </h4>
              <div style="font-size: 0.78rem; color: var(--text-hint); margin-top: 4px;">
                Due: ${asg.dueDate} (${urgency.daysLeft >= 0 ? `in ${urgency.daysLeft}d` : `${Math.abs(urgency.daysLeft)}d overdue`})
              </div>
            </div>

            <div style="display: flex; gap: 6px;">
              <button class="btn-zen btn-zen-sm btn-zen-primary btn-list-complete" data-assignment-id="${asg.id}">
                ✓ Complete
              </button>
              <button class="btn-zen btn-zen-sm btn-zen-secondary btn-list-delete" data-assignment-id="${asg.id}">
                ×
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-list-complete').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-assignment-id');
        toggleAssignmentComplete(id);
      });
    });

    container.querySelectorAll('.btn-list-delete').forEach(btn => {
      btn.addEventListener('click', function () {
        const id = this.getAttribute('data-assignment-id');
        deleteAssignment(id);
      });
    });
  }

  function deleteAssignment(id) {
    state.assignments = state.assignments.filter(a => a.id !== id);
    window.StudentStorage.save(state);
    renderAll();
  }

  function renderCourses() {
    const container = document.getElementById('grid-courses');
    if (!container) return;

    if (state.courses.length === 0) {
      container.innerHTML = `
        <div class="zen-card" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
          <p style="color: var(--text-hint);">No courses enrolled yet. Click "+ Add Course" to establish curriculum.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = state.courses.map(course => {
      const grade = window.StudentEngine.calculateCourseGrade(course, state.assignments);
      const gradePercent = grade.currentPercentage !== null ? `${grade.currentPercentage}%` : 'In Flight';

      return `
        <div class="zen-card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <span class="zen-badge" style="font-size: 0.72rem; padding: 3px 8px;">${course.code}</span>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-zen); margin-top: 6px;">
                ${window.StudentEngine.sanitizeText(course.name)}
              </h4>
              <p style="font-size: 0.78rem; color: var(--text-hint); margin-top: 2px;">
                ${course.instructor} • ${course.room}
              </p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.45rem; font-weight: 800; color: var(--accent-gold);">${grade.letter || 'In Progress'}</div>
              <div style="font-size: 0.75rem; color: var(--accent-mint); font-weight: 700;">${gradePercent}</div>
            </div>
          </div>

          <div style="font-size: 0.75rem; color: var(--text-muted); background: var(--bg-chip); padding: 8px 10px; border-radius: 8px;">
            Target: <strong>${course.targetGrade}%</strong> | Weighted syllabus model
          </div>
        </div>
      `;
    }).join('');
  }

  function renderExams() {
    const container = document.getElementById('list-exams');
    if (!container) return;

    const today = getTodayISO();

    if (state.exams.length === 0) {
      container.innerHTML = `
        <div class="zen-card" style="text-align: center; padding: 40px 20px;">
          <p style="color: var(--text-hint);">No upcoming examinations scheduled. Click "+ Add Exam" to log midterm/finals.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = state.exams.map(exam => {
      const course = state.courses.find(c => c.id === exam.courseId) || { code: 'ACAD' };
      const daysLeft = window.StudentEngine.diffDays(today, exam.examDate);

      return `
        <div class="zen-card" style="margin-bottom: 14px; padding: 18px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
                <span class="zen-badge" style="font-size: 0.7rem; padding: 2px 8px;">${course.code}</span>
                <span class="zen-badge" style="font-size: 0.7rem; padding: 2px 8px; border-color: var(--border-zen);">
                  ${daysLeft > 0 ? `In ${daysLeft} days` : daysLeft === 0 ? 'Today' : `${Math.abs(daysLeft)}d ago`}
                </span>
              </div>
              <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--text-zen);">
                ${window.StudentEngine.sanitizeText(exam.title)}
              </h4>
              <p style="font-size: 0.8rem; color: var(--text-hint); margin-top: 2px;">
                ${exam.examDate} @ ${exam.examTime} • ${exam.location} (Weight: ${exam.weight}%)
              </p>
            </div>
          </div>

          ${(exam.checklist && exam.checklist.length > 0) ? `
            <div style="margin-top: 12px; border-top: 1px solid var(--border-zen); padding-top: 10px;">
              <div style="font-size: 0.72rem; font-weight: 700; color: var(--text-hint); margin-bottom: 6px; text-transform: uppercase;">
                Preparation Checklist
              </div>
              ${exam.checklist.map(item => `
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: ${item.done ? 'var(--text-hint)' : 'var(--text-zen)'}; margin-bottom: 4px;">
                  <span>${item.done ? '✓' : '○'}</span>
                  <span style="text-decoration: ${item.done ? 'line-through' : 'none'};">${window.StudentEngine.sanitizeText(item.text)}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  function renderSettings() {
    const streakDisplay = document.getElementById('stats-streak-display');
    if (streakDisplay) {
      streakDisplay.textContent = `${state.profile.studyStreak} Consecutive Days`;
    }

    const graceDisplay = document.getElementById('stats-grace-display');
    if (graceDisplay) {
      graceDisplay.textContent = `${state.profile.graceTokens} Shields Online`;
    }
  }

  function populateCourseSelects() {
    const selects = ['select-asg-course', 'select-exam-course'];
    selects.forEach(selId => {
      const sel = document.getElementById(selId);
      if (!sel) return;
      if (state.courses.length === 0) {
        sel.innerHTML = '<option value="">(Enroll a course in Curriculum first)</option>';
        return;
      }
      sel.innerHTML = state.courses.map(c => `
        <option value="${c.id}">${c.code} — ${c.name}</option>
      `).join('');
    });
  }

  function startSprintTimer() {
    sprintIsRunning = true;
    const btn = document.getElementById('btn-sprint-toggle');
    if (btn) btn.textContent = 'Pause Flow';

    sprintInterval = setInterval(tickSprintTimer, 1000);
  }

  function pauseSprintTimer() {
    sprintIsRunning = false;
    clearInterval(sprintInterval);
    const btn = document.getElementById('btn-sprint-toggle');
    if (btn) btn.textContent = 'Resume Flow';
  }

  function tickSprintTimer() {
    sprintRemainingSeconds--;
    if (sprintRemainingSeconds <= 0) {
      clearInterval(sprintInterval);
      sprintIsRunning = false;
      playZenChime('sprint');
      state.profile.totalStudyMinutes += 20;
      window.StudentStorage.save(state);
      alert('🌿 Flow State Sprint Complete! +20 minutes logged into academic sanctuary.');
      resetSprintTimer();
      renderAll();
    } else {
      updateSprintDisplay();
    }
  }

  function resetSprintTimer() {
    clearInterval(sprintInterval);
    sprintIsRunning = false;
    sprintRemainingSeconds = 20 * 60;
    updateSprintDisplay();
    const btn = document.getElementById('btn-sprint-toggle');
    if (btn) btn.textContent = 'Engage Flow (20m)';
  }

  function updateSprintDisplay() {
    const mins = Math.floor(sprintRemainingSeconds / 60);
    const secs = sprintRemainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const display = document.getElementById('sprint-digits-zen');
    if (display) display.textContent = formatted;
  }

  function playZenChime(type) {
    if (!state.settings.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'sprint') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
