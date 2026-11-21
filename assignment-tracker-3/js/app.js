/**
 * Assignment Tracker — Edition 3 (Wabi-Sabi Sanctuary / Leo)
 * Main Application Controller & DOM Binding
 */
(function () {
  'use strict';

  var E = window.ATEngine;
  var S = window.ATStorage;
  var C = window.ATConfig;
  var T = window.ATTutorial;

  var data = null;
  var activeTab = 'today';
  var selectedDue = 'today';
  var selectedEst = 60;
  var currentHeroId = null;

  // Teahouse Timer State
  var timerInterval = null;
  var timerTotalSec = 25 * 60;
  var timerRemainingSec = 25 * 60;
  var timerRunning = false;

  function el(id) { return document.getElementById(id); }

  /* ----------------------------------------------------
     1. Web Audio API Harmonic Singing Bowl Chime
     ---------------------------------------------------- */
  function playZenChime(type) {
    if (!data.settings.sound) return;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var now = ctx.currentTime;
      var osc1 = ctx.createOscillator();
      var osc2 = ctx.createOscillator();
      var gain = ctx.createGain();

      if (type === 'bell') {
        // Singing bowl fundamental & overtone
        osc1.frequency.setValueAtTime(396, now); // Ut Quent Laxis 396Hz grounding
        osc2.frequency.setValueAtTime(792, now);
      } else {
        // Gentle water droplet / chime
        osc1.frequency.setValueAtTime(528, now); // 528Hz clarity
        osc2.frequency.setValueAtTime(1056, now);
      }

      osc1.type = 'sine';
      osc2.type = 'sine';

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 2.5);
      osc2.stop(now + 2.5);
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  }

  /* ----------------------------------------------------
     2. Save & State Persistence
     ---------------------------------------------------- */
  function persist() {
    S.save(window.localStorage, C.storageKey, data);
  }

  /* ----------------------------------------------------
     3. Seed Sample Data on First Run
     ---------------------------------------------------- */
  function seedInitialData() {
    var c1 = S.addCourse(data, 'Cognitive Ecology', '#e07a5f');
    var c2 = S.addCourse(data, 'Wabi-Sabi Aesthetics', '#81b29a');
    var c3 = S.addCourse(data, 'Mindful Architecture', '#d4a373');

    var today = E.todayStr();
    var in3 = E.addDays(today, 3);
    var in7 = E.addDays(today, 7);

    var a1 = S.addAssignment(data, {
      title: 'Field Journal Reflection on Natural Flow',
      courseId: c1.id,
      due: in3,
      estMin: 90,
      template: 'reading'
    });

    var a2 = S.addAssignment(data, {
      title: 'Architectural Shadow & Wood Study',
      courseId: c3.id,
      due: in7,
      estMin: 180,
      template: 'lab'
    });

    persist();
  }

  /* ----------------------------------------------------
     4. Navigation & Tab Switching (Rule 11)
     ---------------------------------------------------- */
  function switchTab(tabId) {
    if (C.tabs.indexOf(tabId) < 0) tabId = 'today';
    activeTab = tabId;

    var screens = document.querySelectorAll('.screen');
    for (var i = 0; i < screens.length; i++) {
      screens[i].classList.remove('active');
    }
    var targetScreen = el('screen-' + tabId);
    if (targetScreen) targetScreen.classList.add('active');

    var tabs = document.querySelectorAll('.zen-nav-tab');
    for (var j = 0; j < tabs.length; j++) {
      if (tabs[j].getAttribute('data-tab') === tabId) {
        tabs[j].classList.add('active');
      } else {
        tabs[j].classList.remove('active');
      }
    }

    renderCurrentScreen();
  }

  /* ----------------------------------------------------
     5. Render Screens
     ---------------------------------------------------- */
  function renderCurrentScreen() {
    if (activeTab === 'today') renderToday();
    else if (activeTab === 'radar') renderRadar();
    else if (activeTab === 'teahouse') renderTeahouse();
    else if (activeTab === 'courses') renderCourses();
    else if (activeTab === 'rescue') renderRescue();
    else if (activeTab === 'settings') renderSettings();
  }

  /* ----------------------------------------------------
     6. Render Today Screen & Radial Dial
     ---------------------------------------------------- */
  function renderToday() {
    populateCourseDropdown('qa-course');
    var today = E.todayStr();

    // Filter active items
    var activeList = data.assignments.filter(function (a) {
      return a.status === 'todo' || a.status === 'doing';
    });

    var completedToday = data.assignments.filter(function (a) {
      return a.status === 'done' && a.completedAt && a.completedAt.startsWith(today);
    });

    // Radial Progress Calculation
    var totalActive = activeList.length + completedToday.length;
    var pct = totalActive === 0 ? 100 : Math.round((completedToday.length / totalActive) * 100);
    pct = Math.min(100, Math.max(0, pct));

    el('dial-number').textContent = pct + '%';
    var ring = el('radial-progress-ring');
    if (ring) {
      var circumference = 440; // 2 * pi * 70
      var offset = circumference - (pct / 100) * circumference;
      ring.style.strokeDashoffset = offset;
    }

    var statusMsg = pct === 100 && totalActive > 0
      ? 'All intentions completed today. Rest peacefully.'
      : (activeList.length === 1 ? '1 gentle assignment in focus.' : activeList.length + ' intentions on your horizon.');
    el('dial-status-pill').textContent = statusMsg;

    // Do This Next / Hero Item
    var sorted = E.rankOpen(data, today);
    var hero = sorted[0];
    currentHeroId = hero ? hero.id : null;

    if (hero) {
      el('hero-next').style.display = 'flex';
      el('hero-title').textContent = hero.title;
      el('hero-due').textContent = E.dueLabel(hero.due, today);

      var ctx = E.buildCtx(data, today);
      var start = E.startBy(hero, ctx);
      el('hero-startby').textContent = E.prettyDate(start);

      var actual = E.actualMinutes(hero, data.sprints);
      el('hero-est').textContent = E.fmtMin(hero.estMin);
      el('hero-actual').textContent = E.fmtMin(actual);

      // Render micro steps
      renderHeroSteps(hero);
    } else {
      el('hero-title').textContent = 'No active assignments pending';
      el('hero-due').textContent = '—';
      el('hero-startby').textContent = '—';
      el('hero-est').textContent = '—';
      el('hero-actual').textContent = '—';
      el('hero-steps-list').innerHTML = '<span style="font-size:12px;color:var(--text-muted);">Plant an intention above when ready.</span>';
    }

    // Secondary Upcoming Horizon List
    var secondary = sorted.slice(1);
    el('horizon-count').textContent = secondary.length + ' upcoming';
    var secList = el('secondary-horizon-list');
    secList.innerHTML = '';

    if (secondary.length === 0) {
      secList.innerHTML = '<span style="font-size:12px;color:var(--text-muted);font-style:italic;">Your horizon is clear and peaceful.</span>';
    } else {
      secondary.forEach(function (item) {
        var card = document.createElement('div');
        card.className = 'assignment-card-mini';
        var course = data.courses.find(function (c) { return c.id === item.courseId; });
        var courseTag = course ? '<span style="font-size:10px;font-weight:700;color:' + course.color + ';">● ' + E.escapeHtml(course.name) + '</span>' : '';
        
        card.innerHTML = 
          '<div style="display:flex;justify-content:space-between;align-items:center;">' +
            '<strong>' + E.escapeHtml(item.title) + '</strong>' +
            courseTag +
          '</div>' +
          '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);">' +
            '<span>Due: ' + E.dueLabel(item.due, today) + '</span>' +
            '<span>' + E.fmtMin(item.estMin) + '</span>' +
          '</div>';

        card.addEventListener('click', function () {
          openEditModal(item.id);
        });
        secList.appendChild(card);
      });
    }
  }

  function renderHeroSteps(hero) {
    var container = el('hero-steps-list');
    container.innerHTML = '';
    if (!hero.steps || hero.steps.length === 0) {
      container.innerHTML = '<span style="font-size:12px;color:var(--text-muted);">No micro steps yet. Tap + Add Step to break this down.</span>';
      return;
    }

    hero.steps.forEach(function (step) {
      var row = document.createElement('div');
      row.className = 'step-item' + (step.done ? ' done' : '');
      row.innerHTML = 
        '<div class="step-check">' + (step.done ? '✓' : '') + '</div>' +
        '<span style="font-size:13px;flex:1;">' + E.escapeHtml(step.text) + '</span>';

      row.addEventListener('click', function () {
        S.toggleStep(data, hero.id, step.id);
        persist();
        playZenChime('droplet');
        renderToday();
      });
      container.appendChild(row);
    });
  }

  /* ----------------------------------------------------
     7. Render Radar & Kanban
     ---------------------------------------------------- */
  function renderRadar() {
    var today = E.todayStr();
    var cap = data.settings.dailyCapacityMin;
    var fudge = E.fudgeFactor(data.assignments);

    // Render 14-day capacity heatmap stone garden
    var heatmap = E.capacityHeatmap(data, today, 14);
    var hmContainer = el('capacity-heatmap');
    hmContainer.innerHTML = '';

    heatmap.forEach(function (cell) {
      var tile = document.createElement('div');
      var bg = 'var(--bg-surface-elevated)';
      var color = 'var(--text-muted)';
      if (cell.level === 'light') { bg = 'rgba(129, 178, 154, 0.2)'; color = 'var(--accent-secondary)'; }
      else if (cell.level === 'ok') { bg = 'rgba(242, 204, 143, 0.25)'; color = 'var(--accent-gold)'; }
      else if (cell.level === 'heavy' || cell.level === 'over') { bg = 'rgba(224, 122, 95, 0.35)'; color = 'var(--accent-primary)'; }

      tile.style.cssText = 'background:' + bg + ';border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:8px 4px;display:flex;flex-direction:column;align-items:center;text-align:center;font-size:10px;color:' + color + ';';
      tile.innerHTML = 
        '<span style="font-weight:700;">' + E.weekdayShort(cell.date) + '</span>' +
        '<span style="font-size:11px;font-weight:800;margin-top:2px;">' + cell.date.slice(8) + '</span>' +
        '<span style="margin-top:2px;">' + (cell.minutes > 0 ? E.fmtMin(cell.minutes) : '—') + '</span>';
      hmContainer.appendChild(tile);
    });

    // 3 Kanban Columns
    var listTodo = el('radar-list-todo');
    var listDoing = el('radar-list-doing');
    var listDone = el('radar-list-done');
    listTodo.innerHTML = '';
    listDoing.innerHTML = '';
    listDone.innerHTML = '';

    var cTodo = 0, cDoing = 0, cDone = 0;

    data.assignments.forEach(function (a) {
      if (a.status === 'dropped') return;

      var card = document.createElement('div');
      card.className = 'assignment-card-mini';
      var course = data.courses.find(function (c) { return c.id === a.courseId; });
      var courseTag = course ? '<span style="font-size:10px;font-weight:700;color:' + course.color + ';">● ' + E.escapeHtml(course.name) + '</span>' : '';

      card.innerHTML = 
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
          '<strong>' + E.escapeHtml(a.title) + '</strong>' +
          courseTag +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);">' +
          '<span>Due: ' + E.dueLabel(a.due, today) + '</span>' +
          '<span>' + E.fmtMin(a.estMin) + '</span>' +
        '</div>';

      card.addEventListener('click', function () {
        openEditModal(a.id);
      });

      if (a.status === 'todo') { listTodo.appendChild(card); cTodo++; }
      else if (a.status === 'doing') { listDoing.appendChild(card); cDoing++; }
      else if (a.status === 'done') { listDone.appendChild(card); cDone++; }
    });

    el('count-todo').textContent = cTodo;
    el('count-doing').textContent = cDoing;
    el('count-done').textContent = cDone;
  }

  /* ----------------------------------------------------
     8. Render The Mindful Teahouse
     ---------------------------------------------------- */
  function renderTeahouse() {
    populateTeahouseAssignmentDropdown();
    updateTimerDisplay();
  }

  function populateTeahouseAssignmentDropdown() {
    var sel = el('teahouse-assignment-select');
    sel.innerHTML = '';
    var activeList = data.assignments.filter(function (a) { return a.status === 'todo' || a.status === 'doing'; });
    if (activeList.length === 0) {
      sel.innerHTML = '<option value="">No active assignments pending</option>';
      return;
    }
    activeList.forEach(function (a) {
      var opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.title + ' (' + E.dueLabel(a.due, E.todayStr()) + ')';
      if (a.id === currentHeroId) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function updateTimerDisplay() {
    var min = Math.floor(timerRemainingSec / 60);
    var sec = timerRemainingSec % 60;
    var str = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    el('timer-readout').textContent = str;
  }

  function startTimer() {
    if (timerRunning) {
      // Pause
      clearInterval(timerInterval);
      timerRunning = false;
      el('btn-timer-start').textContent = 'Resume Steep';
      return;
    }

    timerRunning = true;
    el('btn-timer-start').textContent = 'Pause Steep';
    playZenChime('bell');

    timerInterval = setInterval(function () {
      if (timerRemainingSec > 0) {
        timerRemainingSec--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        timerRunning = false;
        el('btn-timer-start').textContent = 'Start Steep';
        playZenChime('bell');

        var assignId = el('teahouse-assignment-select').value;
        if (assignId) {
          var sprintMin = Math.round(timerTotalSec / 60);
          S.logSprint(data, assignId, sprintMin, null, E.todayStr());
          persist();
        }
        alert('🍵 The tea has steeped. Take a breath and rest.');
        renderCurrentScreen();
      }
    }, 1000);
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerRemainingSec = timerTotalSec;
    el('btn-timer-start').textContent = 'Start Steep';
    updateTimerDisplay();
  }

  /* ----------------------------------------------------
     9. Render Courses Screen
     ---------------------------------------------------- */
  function renderCourses() {
    var container = el('courses-list');
    container.innerHTML = '';
    if (data.courses.length === 0) {
      container.innerHTML = '<span style="font-size:12px;color:var(--text-muted);">No academic paths added yet.</span>';
      return;
    }

    data.courses.forEach(function (c) {
      var activeCount = data.assignments.filter(function (a) {
        return a.courseId === c.id && (a.status === 'todo' || a.status === 'doing');
      }).length;

      var row = document.createElement('div');
      row.style.cssText = 'background:var(--bg-surface-elevated);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:14px;display:flex;align-items:center;justify-content:space-between;';
      row.innerHTML = 
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<div style="width:16px;height:16px;border-radius:50%;background:' + c.color + ';"></div>' +
          '<div>' +
            '<strong>' + E.escapeHtml(c.name) + '</strong>' +
            '<div style="font-size:11px;color:var(--text-muted);">' + activeCount + ' active assignments</div>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="btn-secondary" style="color:var(--accent-danger);padding:0 12px;min-height:36px;" data-del-course="' + c.id + '">Remove</button>';

      row.querySelector('[data-del-course]').addEventListener('click', function () {
        if (confirm('Remove ' + c.name + '? (Assignments will remain unlinked)')) {
          S.deleteCourse(data, c.id);
          persist();
          renderCourses();
        }
      });

      container.appendChild(row);
    });
  }

  /* ----------------------------------------------------
     10. Render Rescue & Grace Deck
     ---------------------------------------------------- */
  function renderRescue() {
    var today = E.todayStr();
    var rescueList = E.rescueCandidates(data, today);

    var container = el('rescue-items-list');
    container.innerHTML = '';

    if (rescueList.length === 0) {
      container.innerHTML = 
        '<div class="card" style="text-align:center;padding:32px 20px;">' +
          '<span style="font-size:32px;">🌿</span>' +
          '<h4 style="font-size:16px;font-weight:800;margin-top:8px;">Zero Pressure</h4>' +
          '<p style="font-size:13px;color:var(--text-muted);margin-top:4px;">No assignments are overdue or in jeopardy. Your sanctuary is peaceful.</p>' +
        '</div>';
      return;
    }

    rescueList.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'rescue-card';
      var course = data.courses.find(function (c) { return c.id === item.courseId; });
      var courseName = course ? course.name : 'General';

      card.innerHTML = 
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
          '<div>' +
            '<span style="font-size:11px;font-weight:700;color:var(--accent-primary);text-transform:uppercase;">' + E.escapeHtml(courseName) + '</span>' +
            '<h4 style="font-size:16px;font-weight:800;color:var(--text-main);margin-top:2px;">' + E.escapeHtml(item.title) + '</h4>' +
          '</div>' +
          '<span style="font-size:12px;font-weight:700;color:var(--accent-danger);">' + E.dueLabel(item.due, today) + '</span>' +
        '</div>' +
        '<div class="rescue-actions">' +
          '<button type="button" class="btn-primary" data-action="now" data-id="' + item.id + '">🎯 Prioritize Right Now</button>' +
          '<button type="button" class="btn-secondary" data-action="ext" data-id="' + item.id + '">🗓️ Extend with Grace</button>' +
          '<button type="button" class="btn-secondary" data-action="letgo" data-id="' + item.id + '" style="color:var(--accent-danger);">🍃 Let Go</button>' +
        '</div>';

      card.querySelector('[data-action="now"]').addEventListener('click', function () {
        S.setRescue(data, item.id, 'now');
        persist();
        playZenChime('bell');
        switchTab('today');
      });

      card.querySelector('[data-action="ext"]').addEventListener('click', function () {
        openRescueExtensionModal(item.id, item.due);
      });

      card.querySelector('[data-action="letgo"]').addEventListener('click', function () {
        if (confirm('Consciously let go of "' + item.title + '"? This drops the task without guilt.')) {
          S.setRescue(data, item.id, 'letgo');
          persist();
          playZenChime('droplet');
          renderRescue();
        }
      });

      container.appendChild(card);
    });
  }

  /* ----------------------------------------------------
     11. Render Settings Screen
     ---------------------------------------------------- */
  function renderSettings() {
    el('set-capacity').value = data.settings.dailyCapacityMin;
    el('capacity-hours-label').textContent = (data.settings.dailyCapacityMin / 60).toFixed(1) + ' hours per day';
    el('set-skip-weekends').checked = !!data.settings.skipWeekends;
  }

  /* ----------------------------------------------------
     12. Course Dropdown Populator
     ---------------------------------------------------- */
  function populateCourseDropdown(selectId) {
    var sel = el(selectId);
    if (!sel) return;
    sel.innerHTML = '<option value="">General Sanctuary</option>';
    data.courses.forEach(function (c) {
      var opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  }

  /* ----------------------------------------------------
     13. Modals & Action Bindings
     ---------------------------------------------------- */
  function openModal(id) {
    var m = el(id);
    if (m) m.classList.add('active');
  }

  function closeModal(id) {
    var m = el(id);
    if (m) m.classList.remove('active');
    T.emit('modal-closed');
  }

  function openEditModal(assignmentId) {
    var a = S.findA(data, assignmentId);
    if (!a) return;
    el('edit-id').value = a.id;
    el('edit-title').value = a.title;
    populateCourseDropdown('edit-course');
    el('edit-course').value = a.courseId || '';
    el('edit-due').value = a.due;
    el('edit-est').value = a.estMin;
    el('edit-manual').value = a.manualMin;
    openModal('modal-edit-assignment');
  }

  function openRescueExtensionModal(assignmentId, currentDue) {
    el('rescue-ext-id').value = assignmentId;
    el('rescue-ext-due').value = E.addDays(currentDue || E.todayStr(), 3);
    openModal('modal-rescue-extension');
  }

  /* ----------------------------------------------------
     14. DOM Event Initialization
     ---------------------------------------------------- */
  function initDOM() {
    // Navigation bar tabs
    var tabs = document.querySelectorAll('.zen-nav-tab');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function () {
        var t = this.getAttribute('data-tab');
        switchTab(t);
      });
    }

    // Modal close triggers
    var closeButtons = document.querySelectorAll('[data-close-modal]');
    for (var j = 0; j < closeButtons.length; j++) {
      closeButtons[j].addEventListener('click', function () {
        var modalId = this.getAttribute('data-close-modal');
        closeModal(modalId);
      });
    }

    // Quick Capture due chips
    var dueChips = document.querySelectorAll('#qa-due-chips .chip-select');
    for (var k = 0; k < dueChips.length; k++) {
      dueChips[k].addEventListener('click', function () {
        for (var x = 0; x < dueChips.length; x++) dueChips[x].classList.remove('active');
        this.classList.add('active');
        selectedDue = this.getAttribute('data-due');
      });
    }

    // Quick Capture est chips
    var estChips = document.querySelectorAll('#qa-est-chips .chip-select');
    for (var l = 0; l < estChips.length; l++) {
      estChips[l].addEventListener('click', function () {
        for (var y = 0; y < estChips.length; y++) estChips[y].classList.remove('active');
        this.classList.add('active');
        selectedEst = parseInt(this.getAttribute('data-est'), 10) || 60;
      });
    }

    // Quick Capture Add
    el('btn-qa-add').addEventListener('click', function () {
      var title = (el('qa-title').value || '').trim();
      if (!title) return;

      var today = E.todayStr();
      var due = today;
      if (selectedDue === 'tomorrow') due = E.addDays(today, 1);
      else if (selectedDue === '3days') due = E.addDays(today, 3);
      else if (selectedDue === 'week') due = E.addDays(today, 7);

      var courseId = el('qa-course').value;

      S.addAssignment(data, {
        title: title,
        courseId: courseId,
        due: due,
        estMin: selectedEst,
        template: 'essay'
      });

      persist();
      el('qa-title').value = '';
      playZenChime('droplet');
      T.emit('assignment-added');
      renderToday();
    });

    el('qa-title').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') el('btn-qa-add').click();
    });

    // Hero card actions
    el('btn-hero-complete').addEventListener('click', function () {
      if (!currentHeroId) return;
      S.completeAssignment(data, currentHeroId);
      persist();
      playZenChime('bell');
      renderToday();
    });

    el('btn-hero-sprint').addEventListener('click', function () {
      if (!currentHeroId) return;
      switchTab('teahouse');
    });

    el('btn-hero-edit').addEventListener('click', function () {
      if (currentHeroId) openEditModal(currentHeroId);
    });

    el('btn-add-step').addEventListener('click', function () {
      if (!currentHeroId) return;
      var text = prompt('Enter 5-minute micro step:');
      if (text && text.trim()) {
        S.addStep(data, currentHeroId, text.trim());
        persist();
        renderToday();
      }
    });

    // Teahouse timer chips
    var timerChips = document.querySelectorAll('[data-timer-min]');
    for (var tc = 0; tc < timerChips.length; tc++) {
      timerChips[tc].addEventListener('click', function () {
        for (var z = 0; z < timerChips.length; z++) timerChips[z].classList.remove('active');
        this.classList.add('active');
        var m = parseInt(this.getAttribute('data-timer-min'), 10) || 25;
        timerTotalSec = m * 60;
        resetTimer();
      });
    }

    el('btn-timer-start').addEventListener('click', startTimer);
    el('btn-timer-reset').addEventListener('click', resetTimer);

    // Fog shield toggle
    el('btn-burnout-shield').addEventListener('click', function () {
      data.settings.fog = !data.settings.fog;
      persist();
      applyFogMode();
      T.emit('fog-toggled');
    });

    // Sound toggle
    el('btn-toggle-sound').addEventListener('click', function () {
      data.settings.sound = !data.settings.sound;
      persist();
      el('btn-toggle-sound').textContent = data.settings.sound ? '🔔' : '🔕';
      if (data.settings.sound) playZenChime('droplet');
    });

    // Guide Tour launch
    el('btn-launch-tour').addEventListener('click', function () {
      T.start();
    });

    // Courses modal trigger
    el('btn-open-course-modal').addEventListener('click', function () {
      openModal('modal-course');
    });

    el('form-course').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = el('course-input-name').value.trim();
      var color = el('course-input-color').value.trim() || '#e07a5f';
      if (name) {
        S.addCourse(data, name, color);
        persist();
        closeModal('modal-course');
        el('course-input-name').value = '';
        renderCourses();
      }
    });

    // Edit Assignment form
    el('form-edit-assignment').addEventListener('submit', function (e) {
      e.preventDefault();
      var id = el('edit-id').value;
      var patch = {
        title: el('edit-title').value.trim(),
        courseId: el('edit-course').value,
        due: el('edit-due').value,
        estMin: parseInt(el('edit-est').value, 10) || 60
      };
      S.updateAssignment(data, id, patch);
      var man = parseInt(el('edit-manual').value, 10) || 0;
      S.setManualMinutes(data, id, man);
      persist();
      closeModal('modal-edit-assignment');
      renderCurrentScreen();
    });

    el('btn-delete-assignment').addEventListener('click', function () {
      var id = el('edit-id').value;
      if (confirm('Delete this assignment permanently?')) {
        S.deleteAssignment(data, id);
        persist();
        closeModal('modal-edit-assignment');
        renderCurrentScreen();
      }
    });

    // Rescue extension form
    el('form-rescue-extension').addEventListener('submit', function (e) {
      e.preventDefault();
      var id = el('rescue-ext-id').value;
      var newDue = el('rescue-ext-due').value;
      if (S.setRescue(data, id, 'extension', newDue)) {
        persist();
        closeModal('modal-rescue-extension');
        playZenChime('bell');
        renderRescue();
      }
    });

    // Theme selector
    var themeButtons = document.querySelectorAll('[data-set-theme]');
    for (var th = 0; th < themeButtons.length; th++) {
      themeButtons[th].addEventListener('click', function () {
        var t = this.getAttribute('data-set-theme');
        setTheme(t);
      });
    }

    // Capacity & Skip weekends
    el('set-capacity').addEventListener('change', function () {
      data.settings.dailyCapacityMin = parseInt(this.value, 10) || 120;
      el('capacity-hours-label').textContent = (data.settings.dailyCapacityMin / 60).toFixed(1) + ' hours per day';
      persist();
    });

    el('set-skip-weekends').addEventListener('change', function () {
      data.settings.skipWeekends = !!this.checked;
      persist();
    });

    // Data Vault: Export / Import
    el('btn-export-json').addEventListener('click', function () {
      var blob = new Blob([S.exportJSON(data)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'assignment-sanctuary-backup-' + E.todayStr() + '.json';
      a.click();
      URL.revokeObjectURL(url);
    });

    el('btn-import-json').addEventListener('click', function () {
      el('import-file-input').click();
    });

    el('import-file-input').addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (evt) {
        var imported = S.importJSON(data, evt.target.result);
        if (imported) {
          data = imported;
          persist();
          alert('Sanctuary restored successfully.');
          location.reload();
        } else {
          alert('Could not restore backup. Invalid format.');
        }
      };
      reader.readAsText(file);
    });

    el('btn-clear-data').addEventListener('click', function () {
      if (confirm('Reset entire sanctuary and restore fresh starter intentions?')) {
        localStorage.removeItem(C.storageKey);
        location.reload();
      }
    });
  }

  function applyFogMode() {
    if (data.settings.fog) {
      document.body.classList.add('fog-mode');
      el('btn-burnout-shield').style.backgroundColor = 'var(--accent-primary)';
      el('btn-burnout-shield').style.color = '#ffffff';
    } else {
      document.body.classList.remove('fog-mode');
      el('btn-burnout-shield').style.backgroundColor = '';
      el('btn-burnout-shield').style.color = '';
    }
  }

  function setTheme(themeName) {
    data.settings.theme = themeName;
    document.body.setAttribute('data-theme', themeName);
    persist();
  }

  /* ----------------------------------------------------
     15. Bootstrap
     ---------------------------------------------------- */
  function init() {
    try {
      data = S.load(window.localStorage, C.storageKey);
      if (!data.courses || data.courses.length === 0) {
        seedInitialData();
      }

      if (data.settings.theme) {
        document.body.setAttribute('data-theme', data.settings.theme);
      }
      applyFogMode();
      if (el('btn-toggle-sound')) el('btn-toggle-sound').textContent = data.settings.sound ? '🔔' : '🔕';

      initDOM();
      switchTab('today');

      T.init({
        config: C,
        switchTab: switchTab,
        onEnd: function (completed) {
          data.settings.onboarded = true;
          persist();
        }
      });

      if (!data.settings.onboarded) {
        setTimeout(function () {
          T.start();
        }, 350);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose global for testing
  window.ZenApp = {
    getData: function () { return data; },
    switchTab: switchTab,
    openModal: openModal,
    closeModal: closeModal
  };
})();
