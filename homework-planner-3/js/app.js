/**
 * Homework Planner 3 (Wabi-Sabi Sanctuary) — Edition 3 UI Controller
 * Persona: Leo | Shop: Zen Sanctuary Studio
 *
 * All mathematical calculations reside in HPEngine (pure, immutable).
 * All persistence logic resides in HPStorage (local, clean).
 * This controller manages the DOM, navigation, floating zen island, and audio cues.
 */
(function () {
  'use strict';

  var E = window.HPEngine;
  var S = window.HPStorage;
  var CFG = window.HPConfig;
  var T = window.HPTutorial;

  var data = S.load(window.localStorage, CFG.storageKey);
  var activeTab = CFG.defaultTab;
  var timelineFilter = 'open';
  var rescueIdx = 0;
  var detailId = null;
  var confirmAction = null;
  var qa = { due: 'tomorrow', est: 45 };
  var sprint = null; // { assignmentId, totalSec, elapsedSec, running, timer }
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }
  function today() { return E.todayStr(new Date()); }
  function esc(s) { return E.escapeHtml(s); }
  function commit() { S.save(window.localStorage, CFG.storageKey, data); }
  function courseOf(a) {
    if (!a || !a.courseId) return null;
    for (var i = 0; i < data.courses.length; i++) {
      if (data.courses[i].id === a.courseId) return data.courses[i];
    }
    return null;
  }
  function ctxNow() { return E.buildCtx(data, today()); }

  function toast(msg) {
    var t = $('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  // Harmonic singing bowl chime
  function chime(freq, ms) {
    if (!data.settings.sound) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq || 528; // 528Hz Solfeggio transformation & peace
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ((ms || 320) / 1000));
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(function () {
        try { o.stop(); ctx.close(); } catch (err) {}
      }, ms || 350);
    } catch (e) { /* audio is optional */ }
  }

  // ---------- Navigation ----------
  function switchTab(tab) {
    if (CFG.tabs.indexOf(tab) < 0) tab = CFG.defaultTab;
    activeTab = tab;
    CFG.tabs.forEach(function (t) {
      var s = $('screen-' + t);
      if (s) s.classList.toggle('active', t === tab);
    });
    var btns = document.querySelectorAll('.nav-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.toggle('active', btns[i].getAttribute('data-tab') === tab);
    }
    renderAll();
  }
  window.switchTab = switchTab;

  // ---------- Modals ----------
  function openModal(id) {
    var m = $(id);
    if (m) m.classList.add('open');
  }

  function closeModal(id) {
    var m = $(id);
    if (!m || !m.classList.contains('open')) return;
    m.classList.remove('open');
    if (id === 'modal-assignment-detail') detailId = null;
    renderAll();
    T.emit('modal-closed');
  }

  // ---------- Render Helpers ----------
  function startByInfo(a) {
    var c = ctxNow();
    var sb = E.startBy(a, c);
    var diff = E.daysBetween(c.today, sb);
    if (diff < 0) return { text: 'Start-By date passed. One mindful step tonight gets you moving.', now: true };
    if (diff === 0) return { text: 'Start tonight. A short sprint is plenty to begin.', now: true };
    return { text: 'Start by ' + E.prettyDate(sb) + ' (in ' + E.plural(diff, 'day') + ')', now: false };
  }

  function dueTag(a) {
    var lbl = E.dueLabel(a.due, today());
    var overdue = E.daysBetween(today(), a.due) < 0;
    return '<span class="tag ' + (overdue ? 'overdue' : '') + '">' + esc(lbl) + '</span>';
  }

  function courseTag(a) {
    var c = courseOf(a);
    return c ? '<span class="tag"><span class="dot" style="background:' + esc(c.color) + '"></span>' + esc(c.name) + '</span>' : '';
  }

  function rowHtml(a) {
    var sb = E.startBy(a, ctxNow());
    var sub = a.status === 'done'
      ? ('Completed ' + esc(String(a.completedAt).slice(0, 10)) + (a.packed ? ' · In Backpack' : ''))
      : ('Start by ' + E.prettyDate(sb));
    var rightBadge = '';
    if (a.status === 'done') {
      if (E.daysBetween(today(), a.due) >= 0) {
        rightBadge = '<button class="tag ' + (a.packed ? 'ok' : '') + '" style="border:0;cursor:pointer;" type="button" data-act="toggle-packed" data-id="' + a.id + '">' + (a.packed ? 'In Bag ✓' : 'Pack?') + '</button>';
      }
    } else {
      rightBadge = dueTag(a);
    }
    return '<div class="row" tabindex="0" role="button" data-act="detail" data-id="' + a.id + '">' +
      '<button class="check ' + (a.status === 'done' ? 'done' : '') + '" type="button" data-act="' + (a.status === 'done' ? 'reopen' : 'complete') + '" data-id="' + a.id + '" aria-label="' + (a.status === 'done' ? 'Reopen' : 'Mark finished') + '">' + (a.status === 'done' ? '✓' : '') + '</button>' +
      '<div class="row-main"><div class="row-title">' + esc(a.title) + '</div><div class="row-sub">' + esc(sub) + '</div></div>' +
      rightBadge + '</div>';
  }

  // ---------- Screen 1: Tonight (Evening Hearth) ----------
  function renderHero() {
    var host = $('hero-next');
    if (!host) return;
    var a = E.doThisNext(data, today());
    if (!a) {
      host.innerHTML = '<div class="empty"><strong>Hearth is clear & peaceful.</strong>' +
        (data.assignments.length ? 'All homework is finished or handled for now. Rest your mind.' : 'Anchor your first homework item below to begin.') + '</div>';
      return;
    }
    var sbi = startByInfo(a);
    var actual = E.actualMinutes(a, data.sprints);
    var rem = E.remainingMinutes(a, data.sprints);
    var step = E.nextStepOf(a);
    var prog = E.stepProgress(a);

    host.innerHTML =
      '<div class="hero-eyebrow"><span>Active Focus Stone</span>' + (a.steps.length ? '<span>' + prog + '% complete</span>' : '') + '</div>' +
      '<div class="hero-title">' + esc(a.title) + '</div>' +
      '<div class="hero-meta">' + dueTag(a) + courseTag(a) + (a.weight ? '<span class="tag">Weight ' + a.weight + '%</span>' : '') + '</div>' +
      '<div class="hero-startby ' + (sbi.now ? 'now' : '') + '">' + esc(sbi.text) + '</div>' +
      '<div class="hero-times">Guess ' + E.fmtMin(a.estMin) + ' · Spent ' + E.fmtMin(actual) + ' · About ' + E.fmtMin(rem) + ' left</div>' +
      (a.steps.length ? '<div class="progress" aria-label="Progress ' + prog + ' percent"><i style="width:' + prog + '%"></i></div>' : '') +
      (step ? '<div class="next-step"><button id="btn-hero-step" class="check" type="button" data-act="hero-step" data-id="' + a.id + '" data-step="' + step.id + '" aria-label="Complete step"></button><div><div class="label">Tiny Next Step</div><div class="text">' + esc(step.text) + '</div></div></div>' : '') +
      '<div class="hero-actions" style="display:flex;flex-wrap:wrap;gap:8px;">' +
      '<button id="btn-hero-sprint" class="btn btn-primary" type="button" data-act="sprint" data-id="' + a.id + '" data-min="15">15-min focus</button>' +
      '<button class="btn btn-secondary" type="button" data-act="sprint" data-id="' + a.id + '" data-min="25">25-min</button>' +
      '<button id="btn-hero-done" class="btn btn-ghost" type="button" data-act="complete" data-id="' + a.id + '">Complete</button>' +
      '<button id="btn-hero-detail" class="btn btn-ghost" type="button" data-act="detail" data-id="' + a.id + '">Details</button>' +
      '</div>';
  }

  function renderBackpack() {
    var host = $('backpack-bar');
    if (!host) return;
    var bp = E.backpackStatus(data, today());
    if (!bp.totalDoneDueSoon) { host.style.display = 'none'; host.innerHTML = ''; return; }
    host.style.display = 'block';
    if (!bp.needPack.length) {
      host.innerHTML = '<div class="card-title" style="margin-bottom:4px;"><span>Backpack Zen Check</span><span class="tag ok">All ' + bp.packedCount + ' packed</span></div>' +
        '<p class="row-sub">Every finished sheet for today or tomorrow is safely in your backpack.</p>';
      return;
    }
    host.innerHTML = '<div class="card-title"><span>Backpack Zen Check</span><span class="tag overdue">' + E.plural(bp.needPack.length, 'item') + ' to pack</span></div>' +
      bp.needPack.map(function (a) {
        return '<div class="pack-row"><div class="pack-info"><div class="pack-title">' + esc(a.title) + '</div><div class="row-sub">' + esc(E.dueLabel(a.due, today())) + ' · Finished tonight</div></div>' +
          '<button class="btn btn-secondary btn-sm" type="button" data-act="toggle-packed" data-id="' + a.id + '">Packed in Bag</button></div>';
      }).join('');
  }

  function renderNudge() {
    var n = E.rescueCandidates(data, today()).length;
    var host = $('rescue-nudge');
    if (!host) return;
    if (!n) { host.style.display = 'none'; return; }
    host.style.display = 'flex';
    host.innerHTML = '<span>' + E.plural(n, 'homework item') + ' slipped behind. The Catch-Up Chamber can restore peace in 60 seconds.</span>' +
      '<button class="btn btn-sm btn-secondary" type="button" data-act="goto" data-tab="peace">Open Chamber</button>';
  }

  function renderRibbon() {
    var cells = E.capacityHeatmap(data, today(), 7);
    var host = $('week-ribbon');
    if (!host) return;
    host.innerHTML = cells.map(function (c) {
      return '<div class="ribbon-cell' + (c.level === 'none' ? '' : ' lv-' + c.level) + '"><span>' + E.weekdayShort(c.date) + '</span><span>' + (c.minutes ? E.fmtMin(c.minutes) : '·') + '</span></div>';
    }).join('');
  }

  function renderUpcoming() {
    var ranked = E.rankOpen(data, today());
    var hero = ranked[0];
    var rest = ranked.slice(1, 5);
    var load = E.tonightMinutes(data, today());
    var cap = data.settings.dailyCapacityMin;
    var loadEl = $('tonight-load');
    if (loadEl) {
      loadEl.textContent = E.fmtMin(load) + ' / ' + E.fmtMin(cap) + ' tonight';
      loadEl.className = 'tag ' + (load > cap ? 'overdue' : 'ok');
    }
    var host = $('upcoming-list');
    if (!host) return;
    if (!hero) { host.innerHTML = '<div class="empty">Sanctuary is quiet. Nothing queued for tonight.</div>'; return; }
    host.innerHTML = rest.length ? rest.map(rowHtml).join('') : '<div class="empty">Only one open item remains. Clean slate ahead.</div>';
  }

  function renderStats() {
    var st = E.stats(data, today());
    if ($('stat-open')) $('stat-open').textContent = st.open;
    if ($('stat-week')) $('stat-week').textContent = st.thisWeek;
    if ($('stat-done')) $('stat-done').textContent = st.done;
    var streak = E.completionStreak(data, today());
    if ($('badge-streak')) $('badge-streak').textContent = streak + '-day streak';
  }

  // ---------- Screen 2: Timeline (River of Work) ----------
  function renderTimeline() {
    var cells = E.capacityHeatmap(data, today(), 14);
    var t = today();
    var riverHost = $('timeline-river');
    if (riverHost) {
      riverHost.innerHTML = cells.map(function (c) {
        var lv = c.level === 'none' ? '' : ' lv-' + c.level;
        return '<div class="timeline-stone' + lv + (c.date === t ? ' today' : '') + '">' +
          '<div class="stone-day">' + E.weekdayShort(c.date) + '</div>' +
          '<div class="stone-date">' + E.prettyDate(c.date).split(' ').slice(1).join(' ') + '</div>' +
          '<div class="stone-min">' + (c.minutes ? E.fmtMin(c.minutes) : 'peace') + '</div>' +
          '</div>';
      }).join('');
    }

    var over = cells.filter(function (c) { return c.level === 'over'; }).length;
    var heavy = cells.filter(function (c) { return c.level === 'heavy'; }).length;
    var noteEl = $('timeline-note');
    if (noteEl) {
      noteEl.textContent = over ? E.plural(over, 'evening') + ' exceed your budget of ' + E.fmtMin(data.settings.dailyCapacityMin) + '. Gently space out deadlines or start earlier.' :
        heavy ? E.plural(heavy, 'evening') + ' carry a full load. Keep a peaceful rhythm.' : 'Your next 14 evenings sit comfortably within your mindful budget of ' + E.fmtMin(data.settings.dailyCapacityMin) + ' each.';
    }

    // Filter chips
    var chips = document.querySelectorAll('#timeline-filter .chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].classList.toggle('selected', chips[i].getAttribute('data-filter') === timelineFilter);
    }

    var listHost = $('timeline-list');
    if (listHost) {
      if (timelineFilter === 'done') {
        var done = data.assignments.filter(function (a) { return a.status === 'done'; })
          .sort(function (x, y) { return String(y.completedAt).localeCompare(String(x.completedAt)); });
        listHost.innerHTML = done.length ? done.map(rowHtml).join('') : '<div class="empty">No completed homework yet. Each small step counts.</div>';
      } else {
        var open = E.rankOpen(data, today());
        listHost.innerHTML = open.length ? open.map(rowHtml).join('') : '<div class="empty">No open homework items. Take a peaceful break.</div>';
      }
    }
  }

  // ---------- Screen 3: Rituals (Weekly Homework Rituals & Subjects) ----------
  function renderRituals() {
    var cHost = $('course-list');
    if (cHost) {
      if (!data.courses.length) {
        cHost.innerHTML = '<div class="empty">No subjects added yet. Add classes to organize your sanctuary.</div>';
      } else {
        cHost.innerHTML = data.courses.map(function (c) {
          var mine = data.assignments.filter(function (a) { return a.courseId === c.id; });
          var open = mine.filter(E.isOpen).length;
          var done = mine.filter(function (a) { return a.status === 'done'; }).length;
          return '<div class="row"><span class="dot" style="background:' + esc(c.color) + ';width:14px;height:14px"></span>' +
            '<div class="row-main"><div class="row-title">' + esc(c.name) + '</div><div class="row-sub">' + open + ' open · ' + done + ' completed</div></div>' +
            '<button class="btn btn-sm btn-ghost" type="button" data-act="del-course" data-id="' + c.id + '">Remove</button></div>';
        }).join('');
      }
    }

    var rCourse = $('routine-course');
    if (rCourse) {
      rCourse.innerHTML = '<option value="">No subject</option>' + data.courses.map(function (c) {
        return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
      }).join('');
    }

    var rTmpl = $('routine-template');
    if (rTmpl) {
      rTmpl.innerHTML = '<option value="">No steps (single stone)</option>' + Object.keys(E.STEP_TEMPLATES).map(function (k) {
        return '<option value="' + k + '">' + esc(E.STEP_TEMPLATES[k].label) + '</option>';
      }).join('');
    }

    var rHost = $('routine-list');
    if (rHost) {
      if (!data.routines.length) {
        rHost.innerHTML = '<div class="row-sub">No weekly study rituals saved yet.</div>';
      } else {
        rHost.innerHTML = data.routines.map(function (r) {
          var c = courseOf(r);
          var cname = c ? c.name + ' · ' : '';
          return '<div class="routine-row"><div class="row-main"><div class="row-title">' + esc(r.title) + '</div>' +
            '<div class="row-sub">' + esc(cname) + 'Every ' + esc(E.weekdayName(r.weekday)) + ' · ' + E.fmtMin(r.estMin) + '</div></div>' +
            '<button class="btn btn-sm btn-ghost" type="button" data-act="del-routine" data-id="' + r.id + '">Remove</button></div>';
        }).join('');
      }
    }
  }

  // ---------- Screen 4: Peace (Catch-Up Chamber) ----------
  function renderPeace() {
    var host = $('rescue-list');
    if (!host) return;
    var list = E.rescueCandidates(data, today());
    if (!list.length) {
      rescueIdx = 0;
      host.innerHTML = '<div class="empty"><strong>Chamber is tranquil.</strong>Nothing has slipped behind. The Catch-Up Chamber waits quietly whenever life gets heavy.</div>';
      return;
    }
    if (rescueIdx >= list.length) rescueIdx = 0;
    var a = list[rescueIdx];
    var defDue = E.addDays(today(), 3);
    host.innerHTML =
      '<div class="row-sub" style="margin-bottom:8px;font-weight:700;">Restoring Stone ' + (rescueIdx + 1) + ' of ' + list.length + '</div>' +
      '<div class="card rescue-card">' +
      '<div class="rescue-title">' + esc(a.title) + '</div>' +
      '<div class="row-sub">' + esc(E.dueLabel(a.due, today())) + ' · about ' + E.fmtMin(E.remainingMinutes(a, data.sprints)) + ' remaining</div>' +
      '<div class="rescue-actions">' +
      '<button class="btn btn-primary" type="button" data-act="rescue-now" data-id="' + a.id + '">Do Tonight</button>' +
      '<button class="btn btn-secondary" type="button" data-act="rescue-ext" data-id="' + a.id + '">Request Extension</button>' +
      '<button class="btn btn-ghost" type="button" data-act="rescue-letgo" data-id="' + a.id + '">Use Late Pass</button>' +
      '</div>' +
      '<div class="rescue-ext"><span class="row-sub">Target extension date:</span><input class="input" type="date" id="resc-date-' + a.id + '" value="' + defDue + '" style="max-width:180px;"></div>' +
      (list.length > 1 ? '<div style="margin-top:14px;"><button class="btn btn-ghost btn-sm" type="button" data-act="rescue-skip">Skip for now</button></div>' : '') +
      '</div>';
  }

  // ---------- Screen 5: Settings ----------
  function renderSettings() {
    if ($('set-capacity')) $('set-capacity').value = data.settings.dailyCapacityMin;
    if ($('set-weekends')) $('set-weekends').checked = !!data.settings.skipWeekends;
    if ($('set-sound')) $('set-sound').checked = !!data.settings.sound;
    var f = E.fudgeFactor(data.assignments, data.sprints);
    if ($('fudge-note')) {
      $('fudge-note').textContent = 'Honest Calibration: your time estimates are adjusted by ×' + f.toFixed(2) + ' when calculating Start-By dates. It calibrates automatically as you finish homework.';
    }
    var host = $('theme-picker');
    if (host) {
      var current = data.settings.theme || CFG.themes[0].id;
      host.innerHTML = CFG.themes.map(function (t) {
        return '<button type="button" class="chip ' + (t.id === current ? 'selected' : '') + '" data-act="theme" data-theme-id="' + t.id + '">' + esc(t.label) + '</button>';
      }).join('');
    }
  }

  // ---------- Detail Modal ----------
  function renderDetail() {
    var host = $('detail-body');
    if (!host) return;
    var a = detailId ? S.findA(data, detailId) : null;
    if (!a) { host.innerHTML = ''; return; }
    var actual = E.actualMinutes(a, data.sprints);
    var sbi = startByInfo(a);
    if ($('detail-title-h')) $('detail-title-h').textContent = a.title;

    var courseOpts = '<option value="">No subject</option>' + data.courses.map(function (c) {
      return '<option value="' + c.id + '"' + (c.id === a.courseId ? ' selected' : '') + '>' + esc(c.name) + '</option>';
    }).join('');

    var tmplOpts = '<option value="">Add steps from a template...</option>' + Object.keys(E.STEP_TEMPLATES).map(function (k) {
      return '<option value="' + k + '">' + esc(E.STEP_TEMPLATES[k].label) + '</option>';
    }).join('');

    var steps = a.steps.length ? a.steps.map(function (s) {
      return '<div class="step-row ' + (s.done ? 'done' : '') + '"><button class="check ' + (s.done ? 'done' : '') + '" type="button" data-act="toggle-step" data-id="' + a.id + '" data-step="' + s.id + '" aria-label="Toggle step">' + (s.done ? '✓' : '') + '</button><div class="text">' + esc(s.text) + '</div></div>';
    }).join('') : '<p class="row-sub">No steps yet. Large homework feels lighter when broken into small 2-minute steps.</p>';

    host.innerHTML =
      '<div class="detail-block"><div class="hero-meta">' + dueTag(a) + courseTag(a) + '<span class="tag">' + esc(a.status) + '</span>' + (a.status === 'done' ? '<span class="tag ' + (a.packed ? 'ok' : '') + '">' + (a.packed ? 'Packed in Bag' : 'Not in bag yet') + '</span>' : '') + '</div>' +
      '<div class="hero-startby ' + (sbi.now ? 'now' : '') + '">' + esc(a.status === 'done' ? 'Completed. Peace achieved.' : sbi.text) + '</div></div>' +
      '<div class="detail-block"><h4>Steps · ' + E.stepProgress(a) + '%</h4>' + steps +
      '<div class="inline-form" style="margin-top:8px"><input id="detail-new-step" class="input" type="text" maxlength="200" placeholder="Add a tiny step..."><button class="btn btn-secondary" type="button" data-act="add-step" data-id="' + a.id + '">Add</button></div>' +
      '<div class="inline-form" style="margin-top:8px"><select id="detail-template" class="input">' + tmplOpts + '</select><button class="btn btn-secondary" type="button" data-act="apply-template" data-id="' + a.id + '">Apply</button></div></div>' +
      '<div class="detail-block"><h4>Mindful Log</h4><div class="row-sub">Guess ' + E.fmtMin(a.estMin) + ' · Logged ' + E.fmtMin(actual) + ' (' + E.fmtMin(E.sprintMinutes(a.id, data.sprints)) + ' in focus sprints + ' + E.fmtMin(a.manualMin) + ' manual)</div>' +
      '<div class="inline-form" style="margin-top:8px"><input id="detail-manual" class="input" type="number" min="0" max="6000" step="5" value="' + a.manualMin + '" aria-label="Minutes added manually"><button class="btn btn-secondary" type="button" data-act="save-manual" data-id="' + a.id + '">Save Minutes</button></div></div>' +
      '<div class="detail-block"><h4>Edit Homework Stone</h4>' +
      '<label class="field"><span>Title</span><input id="detail-edit-title" class="input" type="text" maxlength="120" value="' + esc(a.title) + '"></label>' +
      '<div class="grid-2"><label class="field"><span>Due Date</span><input id="detail-edit-due" class="input" type="date" value="' + a.due + '"></label>' +
      '<label class="field"><span>Estimate (min)</span><input id="detail-edit-est" class="input" type="number" min="5" max="6000" step="5" value="' + a.estMin + '"></label></div>' +
      '<div class="grid-2"><label class="field"><span>Subject</span><select id="detail-edit-course" class="input">' + courseOpts + '</select></label>' +
      '<label class="field"><span>Grade Weight (%)</span><input id="detail-edit-weight" class="input" type="number" min="0" max="100" value="' + a.weight + '"></label></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;">' +
      '<button class="btn btn-primary" type="button" data-act="save-edit" data-id="' + a.id + '">Save Changes</button>' +
      (a.status === 'done'
        ? '<button class="btn btn-secondary" type="button" data-act="toggle-packed" data-id="' + a.id + '">' + (a.packed ? 'Mark Unpacked' : 'Pack in Bag') + '</button><button class="btn btn-secondary" type="button" data-act="reopen" data-id="' + a.id + '">Reopen</button>'
        : '<button class="btn btn-secondary" type="button" data-act="complete" data-id="' + a.id + '">Complete</button><button class="btn btn-secondary" type="button" data-act="sprint" data-id="' + a.id + '" data-min="15">Focus 15m</button>') +
      '<button class="btn btn-danger-soft" type="button" data-act="delete" data-id="' + a.id + '">Delete</button>' +
      '</div></div>';
  }

  // ---------- Master Render ----------
  function renderAll() {
    renderStats();
    if (activeTab === 'tonight') {
      renderHero();
      renderBackpack();
      renderUpcoming();
      renderNudge();
      renderRibbon();
    }
    if (activeTab === 'timeline') renderTimeline();
    if (activeTab === 'rituals') renderRituals();
    if (activeTab === 'peace') renderPeace();
    if (activeTab === 'settings') renderSettings();
    if (detailId) renderDetail();

    document.body.classList.toggle('fog', !!data.settings.fog);
    var fb = $('btn-toggle-fog');
    if (fb) {
      fb.setAttribute('aria-pressed', data.settings.fog ? 'true' : 'false');
      fb.textContent = data.settings.fog ? 'Shield: Active' : 'Shield';
    }
    document.body.setAttribute('data-theme', data.settings.theme || CFG.themes[0].id);
  }

  // ---------- Form & Action Helpers ----------
  function resolveQuickDue(key) {
    var t = today();
    if (key === 'today') return t;
    if (key === 'tomorrow') return E.addDays(t, 1);
    if (key === 'friday') return E.nextWeekday(E.addDays(t, -1), 5);
    return E.addDays(t, 7);
  }

  function fillAddModal() {
    if ($('add-title')) $('add-title').value = '';
    if ($('add-due')) $('add-due').value = E.addDays(today(), 2);
    if ($('add-est')) $('add-est').value = 45;
    if ($('add-weight')) $('add-weight').value = 10;
    if ($('add-error')) $('add-error').textContent = '';
    if ($('add-course')) {
      $('add-course').innerHTML = '<option value="">No subject</option>' + data.courses.map(function (c) {
        return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
      }).join('');
    }
    if ($('add-template')) {
      $('add-template').innerHTML = '<option value="">No steps (keep single stone)</option>' + Object.keys(E.STEP_TEMPLATES).map(function (k) {
        return '<option value="' + k + '">' + esc(E.STEP_TEMPLATES[k].label) + '</option>';
      }).join('');
    }
  }

  function afterAdd(a) {
    commit();
    chime(528, 200);
    toast('Anchored "' + a.title + '" safely.');
    T.emit('assignment-added');
    renderAll();
  }

  function quickAdd() {
    var titleInput = $('qa-title');
    var title = titleInput ? titleInput.value : '';
    var a = S.addAssignment(data, {
      title: title,
      due: resolveQuickDue(qa.due),
      estMin: qa.est,
      weight: 10
    }, S.stamp());
    if (!a) {
      toast('Please type a homework title first.');
      if (titleInput) titleInput.focus();
      return;
    }
    if (titleInput) titleInput.value = '';
    afterAdd(a);
  }

  // ---------- Focus Sprint HUD ----------
  function updateSprintUI() {
    var hud = $('hud-sprint');
    if (!hud) return;
    if (!sprint) { hud.style.display = 'none'; return; }
    hud.style.display = 'flex';
    var rem = Math.max(0, sprint.totalSec - sprint.elapsedSec);
    var mm = Math.floor(rem / 60);
    var ss = rem % 60;
    var digits = $('sprint-digits');
    if (digits) digits.textContent = (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
    var a = S.findA(data, sprint.assignmentId);
    var st = $('sprint-title');
    if (st) st.textContent = a ? a.title : 'Homework Focus';
    var bar = $('sprint-bar');
    if (bar) {
      var pct = sprint.totalSec > 0 ? (sprint.elapsedSec / sprint.totalSec) * 100 : 0;
      bar.style.width = Math.min(100, pct) + '%';
    }
    var pauseBtn = $('btn-pause-sprint');
    if (pauseBtn) pauseBtn.textContent = sprint.running ? 'Pause' : 'Resume';
  }

  function startSprint(aId, minutes) {
    if (sprint && sprint.timer) clearInterval(sprint.timer);
    sprint = {
      assignmentId: aId,
      totalSec: (minutes || 15) * 60,
      elapsedSec: 0,
      running: true,
      timer: null
    };
    sprint.timer = setInterval(function () {
      if (!sprint || !sprint.running) return;
      sprint.elapsedSec++;
      updateSprintUI();
      if (sprint.elapsedSec >= sprint.totalSec) {
        finishSprint(true);
      }
    }, 1000);
    updateSprintUI();
    chime(660, 250);
    toast('Focus timer started for ' + minutes + ' minutes.');
  }

  function finishSprint(completed) {
    if (!sprint) return;
    clearInterval(sprint.timer);
    var minLogged = Math.max(1, Math.round(sprint.elapsedSec / 60));
    S.recordSprint(data, sprint.assignmentId, minLogged, S.stamp());
    commit();
    chime(528, 400);
    toast('Focus session ended. Logged ' + minLogged + ' mindful minutes.');
    sprint = null;
    updateSprintUI();
    renderAll();
  }

  // ---------- Global Click Dispatcher ----------
  document.addEventListener('click', function (e) {
    var t = e.target;
    var btn = t.closest('button, [data-act], [data-open-modal], [data-close-modal], [data-tab]');
    if (!btn) return;

    // Navigation tabs
    if (btn.hasAttribute('data-tab') && btn.classList.contains('nav-btn')) {
      switchTab(btn.getAttribute('data-tab'));
      return;
    }

    // Modal open / close
    if (btn.hasAttribute('data-open-modal')) {
      var targetModal = btn.getAttribute('data-open-modal');
      if (targetModal === 'modal-add-assignment') fillAddModal();
      openModal(targetModal);
      return;
    }
    if (btn.hasAttribute('data-close-modal')) {
      var modalParent = btn.closest('.app-modal');
      if (modalParent) closeModal(modalParent.id);
      return;
    }

    // Quick Add due/est chips
    if (btn.parentNode && btn.parentNode.id === 'qa-due') {
      var dueChips = btn.parentNode.querySelectorAll('.chip');
      for (var i = 0; i < dueChips.length; i++) dueChips[i].classList.remove('selected');
      btn.classList.add('selected');
      qa.due = btn.getAttribute('data-due');
      return;
    }
    if (btn.parentNode && btn.parentNode.id === 'qa-est') {
      var estChips = btn.parentNode.querySelectorAll('.chip');
      for (var j = 0; j < estChips.length; j++) estChips[j].classList.remove('selected');
      btn.classList.add('selected');
      qa.est = parseInt(btn.getAttribute('data-est'), 10) || 45;
      return;
    }

    // Timeline filter chips
    if (btn.parentNode && btn.parentNode.id === 'timeline-filter') {
      timelineFilter = btn.getAttribute('data-filter') || 'open';
      renderTimeline();
      return;
    }

    // Actions via data-act
    var act = btn.getAttribute('data-act');
    var id = btn.getAttribute('data-id');

    if (act === 'goto') {
      switchTab(btn.getAttribute('data-tab'));
      return;
    }

    if (act === 'detail') {
      detailId = id;
      openModal('modal-assignment-detail');
      renderDetail();
      return;
    }

    if (act === 'complete') {
      S.completeAssignment(data, id, S.stamp());
      commit();
      chime(528, 300);
      toast('Homework stone completed. Deep breath.');
      renderAll();
      return;
    }

    if (act === 'reopen') {
      S.reopenAssignment(data, id);
      commit();
      toast('Reopened homework stone.');
      renderAll();
      return;
    }

    if (act === 'toggle-packed') {
      var a = S.findA(data, id);
      if (a) {
        a.packed = !a.packed;
        commit();
        chime(660, 180);
        toast(a.packed ? 'Tucked safely into your backpack.' : 'Marked unpacked.');
        renderAll();
      }
      return;
    }

    if (act === 'hero-step') {
      var sId = btn.getAttribute('data-step');
      S.toggleStep(data, id, sId);
      commit();
      chime(660, 200);
      renderAll();
      return;
    }

    if (act === 'toggle-step') {
      var stId = btn.getAttribute('data-step');
      S.toggleStep(data, id, stId);
      commit();
      chime(660, 180);
      renderAll();
      return;
    }

    if (act === 'sprint') {
      var m = parseInt(btn.getAttribute('data-min'), 10) || 15;
      startSprint(id, m);
      return;
    }

    if (act === 'theme') {
      var th = btn.getAttribute('data-theme-id');
      data.settings.theme = th;
      commit();
      renderAll();
      return;
    }

    // Detail modal actions
    if (act === 'add-step') {
      var sInp = $('detail-new-step');
      if (sInp && sInp.value.trim()) {
        S.addStep(data, id, sInp.value.trim());
        commit();
        sInp.value = '';
        renderAll();
      }
      return;
    }

    if (act === 'apply-template') {
      var tSel = $('detail-template');
      if (tSel && tSel.value) {
        S.applyTemplate(data, id, tSel.value);
        commit();
        renderAll();
      }
      return;
    }

    if (act === 'save-manual') {
      var mInp = $('detail-manual');
      var aItem = S.findA(data, id);
      if (mInp && aItem) {
        aItem.manualMin = Math.max(0, parseInt(mInp.value, 10) || 0);
        commit();
        toast('Logged manual minutes.');
        renderAll();
      }
      return;
    }

    if (act === 'save-edit') {
      var eTitle = $('detail-edit-title') ? $('detail-edit-title').value.trim() : '';
      var eDue = $('detail-edit-due') ? $('detail-edit-due').value : '';
      var eEst = $('detail-edit-est') ? parseInt($('detail-edit-est').value, 10) : 45;
      var eCourse = $('detail-edit-course') ? $('detail-edit-course').value : '';
      var eWeight = $('detail-edit-weight') ? parseInt($('detail-edit-weight').value, 10) : 10;
      if (!eTitle) { toast('Title cannot be empty.'); return; }
      S.editAssignment(data, id, {
        title: eTitle,
        due: eDue,
        estMin: eEst,
        courseId: eCourse,
        weight: eWeight
      });
      commit();
      toast('Homework stone updated.');
      closeModal('modal-assignment-detail');
      return;
    }

    if (act === 'delete') {
      confirmAction = function () {
        S.deleteAssignment(data, id);
        commit();
        closeModal('modal-confirm');
        closeModal('modal-assignment-detail');
        toast('Homework stone removed.');
        renderAll();
      };
      if ($('confirm-title')) $('confirm-title').textContent = 'Remove Homework?';
      if ($('confirm-msg')) $('confirm-msg').textContent = 'This will remove the assignment from your sanctuary.';
      openModal('modal-confirm');
      return;
    }

    // Catch-up / Peace actions
    if (act === 'rescue-now') {
      var rA = S.findA(data, id);
      if (rA) {
        rA.due = today();
        commit();
        toast('Scheduled for tonight. Take it one step at a time.');
        renderAll();
      }
      return;
    }

    if (act === 'rescue-ext') {
      var dtEl = $('resc-date-' + id);
      var newDate = dtEl ? dtEl.value : E.addDays(today(), 3);
      var rExt = S.findA(data, id);
      if (rExt) {
        rExt.due = newDate;
        commit();
        toast('Extension scheduled for ' + E.prettyDate(newDate) + '. Rest your mind.');
        renderAll();
      }
      return;
    }

    if (act === 'rescue-letgo') {
      S.completeAssignment(data, id, S.stamp());
      commit();
      toast('Handled with late pass. Honor your well-being.');
      renderAll();
      return;
    }

    if (act === 'rescue-skip') {
      rescueIdx++;
      renderPeace();
      return;
    }

    // Courses & Routines
    if (act === 'del-course') {
      S.deleteCourse(data, id);
      commit();
      renderAll();
      return;
    }

    if (act === 'del-routine') {
      S.deleteRoutine(data, id);
      commit();
      renderAll();
      return;
    }
  });

  // ---------- Direct Element Listeners ----------
  // Quick Add enter key & button
  var qaBtn = $('btn-qa-add');
  if (qaBtn) qaBtn.addEventListener('click', quickAdd);

  var qaInput = $('qa-title');
  if (qaInput) {
    qaInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        quickAdd();
      }
    });
  }

  // Shield Mode toggle
  var fogBtn = $('btn-toggle-fog');
  if (fogBtn) {
    fogBtn.addEventListener('click', function () {
      data.settings.fog = !data.settings.fog;
      commit();
      renderAll();
      T.emit('fog-toggled');
    });
  }

  // Detailed Add modal submit
  var submitAdd = $('btn-submit-add');
  if (submitAdd) {
    submitAdd.addEventListener('click', function () {
      var title = $('add-title') ? $('add-title').value.trim() : '';
      var due = $('add-due') ? $('add-due').value : '';
      var est = $('add-est') ? parseInt($('add-est').value, 10) : 45;
      var courseId = $('add-course') ? $('add-course').value : '';
      var weight = $('add-weight') ? parseInt($('add-weight').value, 10) : 10;
      var tmpl = $('add-template') ? $('add-template').value : '';
      var errEl = $('add-error');

      if (!title) {
        if (errEl) errEl.textContent = 'Please enter a title.';
        return;
      }
      if (!due) {
        if (errEl) errEl.textContent = 'Please select a due date.';
        return;
      }

      var a = S.addAssignment(data, {
        title: title,
        due: due,
        estMin: est,
        courseId: courseId,
        weight: weight,
        templateKey: tmpl
      }, S.stamp());

      closeModal('modal-add-assignment');
      afterAdd(a);
    });
  }

  // Sprint Controls
  var pauseSprintBtn = $('btn-pause-sprint');
  if (pauseSprintBtn) {
    pauseSprintBtn.addEventListener('click', function () {
      if (!sprint) return;
      sprint.running = !sprint.running;
      updateSprintUI();
    });
  }

  var stopSprintBtn = $('btn-stop-sprint');
  if (stopSprintBtn) {
    stopSprintBtn.addEventListener('click', function () {
      finishSprint(false);
    });
  }

  // Add Subject
  var addCourseBtn = $('btn-add-course');
  if (addCourseBtn) {
    addCourseBtn.addEventListener('click', function () {
      var cName = $('course-name') ? $('course-name').value.trim() : '';
      var cColor = $('course-color') ? $('course-color').value : '#c27050';
      if (!cName) return;
      S.addCourse(data, { name: cName, color: cColor });
      commit();
      if ($('course-name')) $('course-name').value = '';
      renderAll();
    });
  }

  // Add Weekly Ritual
  var addRoutineBtn = $('btn-add-routine');
  if (addRoutineBtn) {
    addRoutineBtn.addEventListener('click', function () {
      var title = $('routine-title') ? $('routine-title').value.trim() : '';
      var weekday = $('routine-weekday') ? parseInt($('routine-weekday').value, 10) : 5;
      var est = $('routine-est') ? parseInt($('routine-est').value, 10) : 30;
      var courseId = $('routine-course') ? $('routine-course').value : '';
      var tmpl = $('routine-template') ? $('routine-template').value : '';
      if (!title) { toast('Please give your weekly ritual a title.'); return; }
      S.addRoutine(data, {
        title: title,
        weekday: weekday,
        estMin: est,
        courseId: courseId,
        templateKey: tmpl
      });
      commit();
      if ($('routine-title')) $('routine-title').value = '';
      toast('Weekly ritual saved.');
      renderAll();
    });
  }

  // Apply Weekly Rituals for Current Week
  var applyRitualsBtn = $('btn-apply-rituals');
  if (applyRitualsBtn) {
    applyRitualsBtn.addEventListener('click', function () {
      var candidates = E.expandRoutines(data.routines, today(), 7);
      var added = 0;
      candidates.forEach(function (c) {
        var exists = data.assignments.some(function (a) {
          return a.title === c.title && a.due === c.due;
        });
        if (!exists) {
          S.addAssignment(data, c, S.stamp());
          added++;
        }
      });
      commit();
      chime(528, 250);
      toast(added > 0 ? 'Loaded ' + added + ' rituals for this week.' : 'All rituals for this week are already loaded.');
      renderAll();
    });
  }

  // Settings inputs
  var setCap = $('set-capacity');
  if (setCap) {
    setCap.addEventListener('change', function () {
      data.settings.dailyCapacityMin = Math.max(15, parseInt(this.value, 10) || 90);
      commit();
      renderAll();
    });
  }

  var setWk = $('set-weekends');
  if (setWk) {
    setWk.addEventListener('change', function () {
      data.settings.skipWeekends = !!this.checked;
      commit();
      renderAll();
    });
  }

  var setSnd = $('set-sound');
  if (setSnd) {
    setSnd.addEventListener('change', function () {
      data.settings.sound = !!this.checked;
      commit();
    });
  }

  // JSON Export / Import
  var expBtn = $('btn-export');
  if (expBtn) {
    expBtn.addEventListener('click', function () {
      var json = S.exportJson(data);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'homework-planner-3-sanctuary-' + today() + '.json';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  var impTrig = $('btn-import-trigger');
  var impFile = $('file-import');
  if (impTrig && impFile) {
    impTrig.addEventListener('click', function () { impFile.click(); });
    impFile.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (evt) {
        var parsed = S.importJson(evt.target.result);
        if (parsed) {
          data = parsed;
          commit();
          toast('Sanctuary restored successfully.');
          renderAll();
        } else {
          toast('Invalid JSON backup file.');
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset
  var resetBtn = $('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      confirmAction = function () {
        data = S.resetDefaults(window.localStorage, CFG.storageKey);
        closeModal('modal-confirm');
        toast('Sanctuary reset to fresh defaults.');
        renderAll();
      };
      if ($('confirm-title')) $('confirm-title').textContent = 'Reset All Data?';
      if ($('confirm-msg')) $('confirm-msg').textContent = 'All homework items, courses, and logs will be permanently cleared.';
      openModal('modal-confirm');
    });
  }

  var confirmYesBtn = $('btn-confirm-yes');
  if (confirmYesBtn) {
    confirmYesBtn.addEventListener('click', function () {
      if (confirmAction) {
        confirmAction();
        confirmAction = null;
      }
    });
  }

  // Guided Tour
  var tourBtn = $('btn-start-tour');
  if (tourBtn) {
    tourBtn.addEventListener('click', function () {
      switchTab('tonight');
      T.start();
    });
  }

  // ---------- Initial Setup ----------
  T.init({
    config: CFG,
    switchTab: switchTab,
    onEnd: function () {
      data.settings.onboarded = true;
      commit();
      switchTab('tonight');
    }
  });

  renderAll();

  // Auto-launch tour on first visit
  if (!data.settings.onboarded) {
    setTimeout(function () {
      T.start();
    }, 400);
  }
})();
