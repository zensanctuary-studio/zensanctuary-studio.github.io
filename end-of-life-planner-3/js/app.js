/**
 * End of Life Planner 3 — Edition 3 (Zen Sanctuary Studio / Leo) Wabi-Sabi Controller
 * Renders Radial SVG Legacy Dial, Mindful Stepping Stones, Fog Mode & Printable Executor Brief.
 */
(function () {
  'use strict';

  var E = window.EOLEngine;
  var S = window.EOLStorage;
  var CFG = window.EOLConfig;
  var T = window.EOLTutorial;

  var data = null;
  var activeTab = CFG ? CFG.defaultTab : 'overview';
  var contactFilter = 'all';
  var toastTimer = null;

  function $(id) { return document.getElementById(id); }
  function esc(str) {
    return String(str === null || str === undefined ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function chime(freq) {
    try {
      if (!data || !data.settings.sound) return;
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx(), osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq || 432;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.36);
    } catch (err) {}
  }

  function toast(msg) {
    var el = $('toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  function persist() { S.save(data); }

  function switchTab(tab) {
    if (!CFG.tabs.includes(tab)) tab = CFG.defaultTab;
    activeTab = tab;
    document.body.setAttribute('data-active-tab', tab);
    CFG.tabs.forEach(function (t) {
      var scr = $('screen-' + t);
      if (scr) scr.classList.toggle('active', t === tab);
    });
    document.querySelectorAll('.nav-btn[data-tab]').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });
  }

  function applyTheme(themeId) {
    var valid = CFG.themes.some(function (t) { return t.id === themeId; });
    data.settings.theme = valid ? themeId : CFG.themes[0].id;
    document.body.setAttribute('data-theme', data.settings.theme);
    renderThemePicker();
  }

  function applyFog() {
    var on = !!data.settings.fog;
    document.body.classList.toggle('fog', on);
    var btn = $('btn-toggle-fog');
    if (btn) {
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.textContent = on ? 'Fog Mode: ON' : 'Fog Mode';
    }
  }

  function openModal(id) { populateContactSelects(); var m = $(id); if (m) m.classList.add('open'); }
  function closeModal(id) { var m = $(id); if (m) m.classList.remove('open'); }
  function contactNameById(id) {
    var f = id ? data.contacts.find(function (c) { return c.id === id; }) : null;
    return f ? f.name : '';
  }

  function populateContactSelects() {
    var opts = '<option value="">None / Unassigned</option>' + data.contacts.map(function (c) {
      return '<option value="' + esc(c.id) + '">' + esc(c.name) + (c.relation ? ' (' + esc(c.relation) + ')' : '') + '</option>';
    }).join('');
    ['f-dep-guardian', 'f-doc-custodian', 'f-acc-ben', 'f-let-contact'].forEach(function (sid) {
      var sel = $(sid); if (sel) sel.innerHTML = opts;
    });
  }

  function renderOverview() {
    var readiness = E.calculateReadiness(data);
    var estate = E.calculateEstateSummary(data.accounts, data.adjustments, data.autopays);
    var review = E.calculateReviewSchedule(data.settings.lastReviewed, data.settings.reviewCadenceMonths, data.settings.shiftWeekendReview, E.todayLocalISO());
    var cur = data.settings.currency;

    if ($('badge-readiness')) $('badge-readiness').textContent = E.formatPercent(readiness.score) + ' Ready';
    if ($('stat-contacts')) $('stat-contacts').textContent = String(data.contacts.length + data.dependents.length);
    if ($('stat-estate')) $('stat-estate').textContent = E.formatCents(estate.netEstateCents, cur, true);
    if ($('stat-review')) $('stat-review').textContent = review.daysUntil < 0 ? 'Overdue' : E.formatDays(review.daysUntil);

    var hero = $('hero-readiness');
    if (hero) {
      var step = readiness.nextMicroStep;
      var radius = 40;
      var circumference = 2 * Math.PI * radius;
      var offset = circumference * (1 - readiness.score / 100);

      hero.innerHTML =
        '<div class="zen-hero-top">' +
          '<div class="zen-dial-wrap">' +
            '<svg class="zen-dial" viewBox="0 0 96 96" aria-hidden="true">' +
              '<circle class="zen-dial-bg" cx="48" cy="48" r="' + radius + '"/>' +
              '<circle class="zen-dial-fg" cx="48" cy="48" r="' + radius + '" stroke-dasharray="' + circumference.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '"/>' +
            '</svg>' +
            '<div class="zen-dial-center"><div class="zen-dial-num">' + E.formatPercent(readiness.score) + '</div><div class="zen-dial-lbl">Ready</div></div>' +
          '</div>' +
          '<div class="zen-hero-copy">' +
            '<div class="hero-eyebrow"><span>Radial Legacy Sanctuary</span><span class="tag ok">' + esc(readiness.tier) + '</span></div>' +
            '<div class="hero-sub">Place one peaceful stepping stone at a time. Everything rests privately on this device.</div>' +
          '</div>' +
        '</div>' +
        '<div class="hero-meta-grid">' +
          '<div class="meta-cell"><div class="meta-label">Papers</div><div class="meta-val">' + readiness.locatedDocs + ' / ' + Math.max(readiness.totalDocs, 4) + '</div></div>' +
          '<div class="meta-cell"><div class="meta-label">Net Estate</div><div class="meta-val">' + esc(E.formatCents(estate.netEstateCents, cur, true)) + '</div></div>' +
          '<div class="meta-cell"><div class="meta-label">Reflection</div><div class="meta-val">' + esc(review.daysUntil < 0 ? 'Due' : E.formatDays(review.daysUntil)) + '</div></div>' +
        '</div>' +
        '<div class="next-move-box">' +
          '<div class="next-move-text">' +
            '<div class="next-move-title">Next ' + step.estMinutes + '-Min Stone: ' + esc(step.title) + '</div>' +
            '<div class="next-move-sub">' + esc(step.reason) + '</div>' +
          '</div>' +
          '<button type="button" class="btn btn-primary btn-sm" id="btn-hero-next-step">' + esc(step.actionLabel) + '</button>' +
        '</div>';

      var btnStep = $('btn-hero-next-step');
      if (btnStep) btnStep.addEventListener('click', function () { switchTab(step.tabId); if (step.modalId) openModal(step.modalId); });
    }

    var pGrid = $('pillars-grid');
    if (pGrid) {
      pGrid.innerHTML = readiness.pillars.map(function (p) {
        return '<button type="button" class="stone-pill" data-jump-tab="' + esc(p.tabId) + '">' +
          '<div class="stone-head"><span>' + esc(p.label) + '</span><span class="tag ok">' + E.formatPercent(p.percent) + '</span></div>' +
          '<div class="progress-track"><div class="progress-fill" style="width:' + p.percent + '%;"></div></div>' +
        '</button>';
      }).join('');
    }
  }

  function renderContacts() {
    var list = $('contacts-list');
    if (list) {
      var items = data.contacts.filter(function (c) {
        if (contactFilter === 'first') return c.isFirstCall || c.role === 'executor';
        if (contactFilter === 'pro') return c.role === 'legal' || c.role === 'medical' || c.role === 'advisor';
        return true;
      });
      list.innerHTML = items.length === 0
        ? '<div class="empty-state"><p>Your kinship circle is quiet. Add your trusted executor, spouse, legal guide, or doctor.</p><div class="empty-actions"><button type="button" class="btn btn-primary btn-sm" data-open-modal="modal-add-contact">+ Add First Person</button><button type="button" class="btn btn-ghost btn-sm" data-action="load-sample">Load Sample Data</button></div></div>'
        : items.map(function (c) {
            var badge = c.isFirstCall ? '<span class="tag warn">First Call</span>' : '<span class="tag">' + esc(c.role) + '</span>';
            var meta = [c.relation, c.phone, c.email].filter(Boolean).join(' · ');
            return '<div class="row-item"><div class="row-main"><div class="row-title">' + esc(c.name) + ' ' + badge + '</div>' + (meta ? '<div class="row-sub">' + esc(meta) + '</div>' : '') + (c.notes ? '<div class="row-sub">' + esc(c.notes) + '</div>' : '') + '</div><div class="row-actions"><button type="button" class="btn btn-danger-soft btn-sm" data-del-contact="' + esc(c.id) + '">Remove</button></div></div>';
          }).join('');
    }
    var dList = $('dependents-list');
    if (dList) {
      dList.innerHTML = data.dependents.length === 0
        ? '<div class="empty-state"><p>Document care routines and guardians for pets, children, or loved ones who rely on you.</p><div class="empty-actions"><button type="button" class="btn btn-secondary btn-sm" data-open-modal="modal-add-dependent">+ Add Care Plan</button></div></div>'
        : data.dependents.map(function (dp) {
            var gName = contactNameById(dp.guardianContactId);
            return '<div class="row-item"><div class="row-main"><div class="row-title">' + esc(dp.name) + ' <span class="tag ok">' + esc(dp.type) + '</span></div>' + (gName ? '<div class="row-sub">Guardian: <strong>' + esc(gName) + '</strong></div>' : '') + (dp.careNotes ? '<div class="row-sub">' + esc(dp.careNotes) + '</div>' : '') + '</div><div class="row-actions"><button type="button" class="btn btn-danger-soft btn-sm" data-del-dependent="' + esc(dp.id) + '">Remove</button></div></div>';
          }).join('');
    }
  }

  function renderVault() {
    var cur = data.settings.currency;
    var loc = data.documents.filter(function (d) { return d.status === 'signed' || d.status === 'located'; }).length;
    if ($('docs-progress-tag')) $('docs-progress-tag').textContent = loc + ' / ' + data.documents.length + ' mapped';

    var dList = $('documents-list');
    if (dList) {
      dList.innerHTML = data.documents.length === 0
        ? '<div class="empty-state"><p>Map where your signed Will, Advance Directive, and safe keys rest.</p><div class="empty-actions"><button type="button" class="btn btn-primary btn-sm" data-open-modal="modal-add-document">+ Map Paper</button><button type="button" class="btn btn-ghost btn-sm" data-action="load-sample">Load Sample Data</button></div></div>'
        : data.documents.map(function (doc) {
            var stClass = (doc.status === 'signed' || doc.status === 'located') ? 'ok' : doc.status === 'drafting' ? 'warn' : 'danger';
            var stLabel = doc.status === 'signed' ? 'Signed & Stored' : doc.status === 'located' ? 'Located' : doc.status === 'drafting' ? 'Drafting' : 'Missing';
            var cust = contactNameById(doc.custodianContactId);
            return '<div class="row-item"><div class="row-main"><div class="row-title">' + esc(doc.title) + ' <span class="tag">' + esc(doc.category) + '</span></div>' + (doc.location ? '<div class="row-sub">Location: ' + esc(doc.location) + '</div>' : '') + (cust ? '<div class="row-sub">Copy held by: ' + esc(cust) + '</div>' : '') + '</div><div class="row-actions"><button type="button" class="btn btn-secondary btn-sm" data-cycle-doc="' + esc(doc.id) + '"><span class="tag ' + stClass + '">' + stLabel + '</span></button><button type="button" class="btn btn-danger-soft btn-sm" data-del-doc="' + esc(doc.id) + '">Remove</button></div></div>';
          }).join('');
    }

    var estate = E.calculateEstateSummary(data.accounts, data.adjustments, data.autopays);
    if ($('est-assets')) $('est-assets').textContent = E.formatCents(estate.totalAssetsCents, cur, true);
    if ($('est-policies')) $('est-policies').textContent = E.formatCents(estate.totalPoliciesCents, cur, true);
    if ($('est-debts')) $('est-debts').textContent = E.formatCents(estate.totalDebtsCents, cur, true);
    if ($('autopay-monthly-tag')) $('autopay-monthly-tag').textContent = E.formatCents(estate.monthlyAutopayCents, cur, false) + '/mo';

    var aList = $('accounts-list');
    if (aList) {
      aList.innerHTML = data.accounts.length === 0
        ? '<div class="empty-state"><p>Note bank accounts, retirement, life insurance, and debts using only last-4 digits.</p><div class="empty-actions"><button type="button" class="btn btn-primary btn-sm" data-open-modal="modal-add-account">+ Add Account</button></div></div>'
        : data.accounts.map(function (a) {
            var eff = E.computeEffectiveAccountCents(a, data.adjustments);
            var kindTag = a.kind === 'policy' ? '<span class="tag ok">Insurance</span>' : a.kind === 'debt' ? '<span class="tag danger">Debt</span>' : '<span class="tag">Asset</span>';
            var ben = contactNameById(a.beneficiaryContactId);
            var sub = [a.institution, a.last4 ? '••' + a.last4 : '', ben ? 'Beneficiary: ' + ben : ''].filter(Boolean).join(' · ');
            return '<div class="row-item"><div class="row-main"><div class="row-title">' + esc(a.name) + ' ' + kindTag + '</div>' + (sub ? '<div class="row-sub">' + esc(sub) + '</div>' : '') + (a.locationHint ? '<div class="row-sub">' + esc(a.locationHint) + '</div>' : '') + '</div><div class="row-actions"><span class="tag ok">' + esc(E.formatCents(eff, cur, true)) + '</span><button type="button" class="btn btn-danger-soft btn-sm" data-del-account="' + esc(a.id) + '">Remove</button></div></div>';
          }).join('');
    }

    var apList = $('autopays-list');
    if (apList) {
      apList.innerHTML = data.autopays.length === 0
        ? '<div class="empty-state"><p>Note recurring auto-pays so loved ones can cancel or transfer them easily.</p><div class="empty-actions"><button type="button" class="btn btn-secondary btn-sm" data-open-modal="modal-add-autopay">+ Add Auto-Pay</button></div></div>'
        : data.autopays.map(function (ap) {
            var active = ap.status !== 'cancelled';
            return '<div class="row-item"><div class="row-main"><div class="row-title">' + esc(ap.title) + ' <span class="tag ' + (active ? 'warn' : 'ok') + '">' + (active ? esc(ap.cycle) : 'Handled') + '</span></div><div class="row-sub">' + esc(E.formatCents(ap.amountCents, cur, false)) + (ap.paymentMethod ? ' · ' + esc(ap.paymentMethod) : '') + (ap.actionNote ? ' · ' + esc(ap.actionNote) : '') + '</div></div><div class="row-actions"><button type="button" class="btn btn-secondary btn-sm" data-toggle-autopay="' + esc(ap.id) + '">' + (active ? 'Handled' : 'Reopen') + '</button><button type="button" class="btn btn-danger-soft btn-sm" data-del-autopay="' + esc(ap.id) + '">Remove</button></div></div>';
          }).join('');
    }
  }

  function renderDigital() {
    if ($('vm-manager')) $('vm-manager').value = data.vaultMeta.passwordManager || '';
    if ($('vm-recovery')) $('vm-recovery').value = data.vaultMeta.recoveryKitLocation || '';
    if ($('vm-legacy-contact')) $('vm-legacy-contact').value = data.vaultMeta.legacyContactNote || '';
    var tally = E.summarizeDigitalLegacy(data.digital);
    if ($('digital-tally-tag')) $('digital-tally-tag').textContent = tally.total + ' accounts (' + tally.transfer + ' transfer · ' + tally.memorialize + ' memorialize)';

    var list = $('digital-list');
    if (list) {
      list.innerHTML = data.digital.length === 0
        ? '<div class="empty-state"><p>Record key digital accounts and whether to transfer, memorialize, or close them.</p><div class="empty-actions"><button type="button" class="btn btn-primary btn-sm" data-open-modal="modal-add-digital">+ Add Key</button></div></div>'
        : data.digital.map(function (dg) {
            var cls = dg.directive === 'transfer' ? 'ok' : dg.directive === 'delete' ? 'danger' : 'warn';
            return '<div class="row-item"><div class="row-main"><div class="row-title">' + esc(dg.service) + ' <span class="tag ' + cls + '">' + esc(dg.directive) + '</span></div>' + (dg.handle ? '<div class="row-sub">Handle: ' + esc(dg.handle) + '</div>' : '') + (dg.accessHint ? '<div class="row-sub">Access: ' + esc(dg.accessHint) + '</div>' : '') + '</div><div class="row-actions"><button type="button" class="btn btn-danger-soft btn-sm" data-del-digital="' + esc(dg.id) + '">Remove</button></div></div>';
          }).join('');
    }
  }

  function renderWishes() {
    if ($('w-disposition')) $('w-disposition').value = data.wishes.disposition || '';
    if ($('w-organ')) $('w-organ').value = data.wishes.organDonation || '';
    if ($('w-tone')) $('w-tone').value = data.wishes.serviceTone || '';
    if ($('w-music')) $('w-music').value = data.wishes.musicReadings || '';
    if ($('w-notes')) $('w-notes').value = data.wishes.serviceNotes || '';

    var lList = $('letters-list');
    if (lList) {
      lList.innerHTML = data.letters.length === 0
        ? '<div class="empty-state"><p>Leave a few tender words or heirloom wishes for someone dear to you.</p><div class="empty-actions"><button type="button" class="btn btn-secondary btn-sm" data-open-modal="modal-add-letter">+ Write Letter</button></div></div>'
        : data.letters.map(function (lt) {
            return '<div class="row-item"><div class="row-main"><div class="row-title">' + esc(lt.title) + ' <span class="tag ok">To: ' + esc(lt.recipientName) + '</span></div><div class="row-sub">' + esc(lt.body) + '</div></div><div class="row-actions"><button type="button" class="btn btn-danger-soft btn-sm" data-del-letter="' + esc(lt.id) + '">Remove</button></div></div>';
          }).join('');
    }

    var exec = E.summarizeExecutorChecklist(data.checklist);
    if ($('exec-progress-tag')) $('exec-progress-tag').textContent = E.formatPercent(exec.percent) + ' (' + exec.done + '/' + exec.total + ')';
    var cWrap = $('checklist-phases');
    if (cWrap) {
      var phases = [
        { id: '24h', label: 'First 24–48 Hours' },
        { id: 'week1', label: 'First Week' },
        { id: 'month1', label: 'First Month & Beyond' }
      ];
      cWrap.innerHTML = phases.map(function (ph) {
        var rows = data.checklist.filter(function (x) { return x.phase === ph.id; });
        return '<div style="margin-bottom:8px;"><div class="chip-label" style="color:var(--accent);font-weight:800;">' + esc(ph.label) + '</div><div class="list">' +
          rows.map(function (item) {
            return '<label class="check-row ' + (item.completed ? 'done' : '') + '"><input type="checkbox" data-toggle-chk="' + esc(item.id) + '"' + (item.completed ? ' checked' : '') + '><div class="row-main"><div class="row-title">' + esc(item.title) + '</div>' + (item.notes ? '<div class="row-sub">' + esc(item.notes) + '</div>' : '') + '</div></label>';
          }).join('') + '</div></div>';
      }).join('');
    }
  }

  function renderThemePicker() {
    var wrap = $('theme-picker'); if (!wrap) return;
    wrap.innerHTML = CFG.themes.map(function (t) {
      return '<button type="button" class="theme-btn' + (data.settings.theme === t.id ? ' active' : '') + '" data-select-theme="' + esc(t.id) + '"><span class="swatch" style="background:' + esc(t.swatch) + ';"></span><span>' + esc(t.label) + '</span></button>';
    }).join('');
  }

  function renderSettings() {
    if ($('set-owner-name')) $('set-owner-name').value = data.settings.ownerName || '';
    if ($('set-safe-loc')) $('set-safe-loc').value = data.settings.safeLocation || '';
    if ($('set-cadence')) $('set-cadence').value = String(data.settings.reviewCadenceMonths || 12);
    if ($('set-currency')) $('set-currency').value = data.settings.currency || 'USD';
    if ($('btn-toggle-sound')) $('btn-toggle-sound').textContent = 'Singing Bowl Chime: ' + (data.settings.sound ? 'ON' : 'OFF');
    var rev = E.calculateReviewSchedule(data.settings.lastReviewed, data.settings.reviewCadenceMonths, data.settings.shiftWeekendReview, E.todayLocalISO());
    if ($('review-schedule-tag')) $('review-schedule-tag').textContent = 'Next Reflection: ' + rev.nextReviewDate + ' (' + (rev.daysUntil < 0 ? 'Overdue' : E.formatDays(rev.daysUntil)) + ')';
    renderThemePicker();
  }

  function buildPrintablePacket() {
    var sheet = $('print-packet-sheet'); if (!sheet) return;
    var cur = data.settings.currency;
    var estate = E.calculateEstateSummary(data.accounts, data.adjustments, data.autopays);
    sheet.innerHTML =
      '<div class="print-section"><h2>END OF LIFE SANCTUARY — EXECUTOR BRIEF</h2><p><strong>Prepared By:</strong> ' + esc(data.settings.ownerName || 'Owner') + ' | <strong>Date:</strong> ' + esc(E.todayLocalISO()) + '</p>' + (data.settings.safeLocation ? '<p><strong>Safe Location:</strong> ' + esc(data.settings.safeLocation) + '</p>' : '') + '<p style="font-size:9.5pt;color:#4b5563;"><em>Organizational legacy locator — does not replace a legally executed Will or Power of Attorney.</em></p></div>' +
      '<div class="print-section"><h3>1. Kinship &amp; First Calls</h3>' + (data.contacts.map(function (c) { return '<div class="print-row"><strong>' + esc(c.name) + '</strong> (' + esc(c.relation || c.role) + ') — ' + esc(c.phone || '') + ' ' + esc(c.email || '') + '</div>'; }).join('') || '<div class="print-row">None listed.</div>') + '</div>' +
      '<div class="print-section"><h3>2. Essential Papers</h3>' + (data.documents.map(function (d) { return '<div class="print-row"><strong>' + esc(d.title) + '</strong> [' + esc(d.status) + '] — ' + esc(d.location) + '</div>'; }).join('') || '<div class="print-row">None listed.</div>') + '</div>' +
      '<div class="print-section"><h3>3. Estate &amp; Policies (Est. Net: ' + esc(E.formatCents(estate.netEstateCents, cur, true)) + ')</h3>' + (data.accounts.map(function (a) { return '<div class="print-row"><strong>' + esc(a.name) + '</strong> (' + esc(a.institution) + (a.last4 ? ' ••' + esc(a.last4) : '') + ') — ' + esc(E.formatCents(E.computeEffectiveAccountCents(a, data.adjustments), cur, true)) + '</div>'; }).join('') || '<div class="print-row">None listed.</div>') + '</div>' +
      '<div class="print-section"><h3>4. Digital Keys &amp; Final Wishes</h3><div class="print-row"><strong>Password Manager:</strong> ' + esc(data.vaultMeta.passwordManager || 'Not set') + ' | <strong>Recovery Kit:</strong> ' + esc(data.vaultMeta.recoveryKitLocation || 'Not set') + '</div><div class="print-row"><strong>Disposition:</strong> ' + esc(data.wishes.disposition || 'Not set') + ' | <strong>Gathering:</strong> ' + esc(data.wishes.serviceTone || 'Not set') + '</div></div>';
  }

  function renderAll() {
    applyTheme(data.settings.theme);
    applyFog();
    renderOverview();
    renderContacts();
    renderVault();
    renderDigital();
    renderWishes();
    renderSettings();
  }

  window.setCleanSlateState = function (force) {
    data = S.cleanSlate(data, !!force, CFG.themes[0].id);
    persist();
    renderAll();
  };

  function bindEvents() {
    document.querySelectorAll('.nav-btn[data-tab]').forEach(function (btn) {
      btn.addEventListener('click', function () { switchTab(btn.getAttribute('data-tab')); });
    });

    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-open-modal]'); if (opener) return openModal(opener.getAttribute('data-open-modal'));
      var closer = e.target.closest('[data-close-modal]'); if (closer) return closeModal(closer.getAttribute('data-close-modal'));
      var jumper = e.target.closest('[data-jump-tab]'); if (jumper) return switchTab(jumper.getAttribute('data-jump-tab'));
      var themeBtn = e.target.closest('[data-select-theme]'); if (themeBtn) { applyTheme(themeBtn.getAttribute('data-select-theme')); persist(); toast('Sanctuary theme updated'); return; }
      var sampleBtn = e.target.closest('[data-action="load-sample"]'); if (sampleBtn) { data = S.getSampleData(data.settings.theme, true); persist(); renderAll(); toast('Sample sanctuary loaded'); return; }
      var delCnt = e.target.closest('[data-del-contact]'); if (delCnt) { E.pruneDeletedContact(data, delCnt.getAttribute('data-del-contact')); persist(); renderAll(); return; }
      var delDep = e.target.closest('[data-del-dependent]'); if (delDep) { var id = delDep.getAttribute('data-del-dependent'); data.dependents = data.dependents.filter(function (x) { return x.id !== id; }); persist(); renderAll(); return; }
      var cycDoc = e.target.closest('[data-cycle-doc]'); if (cycDoc) {
        var doc = data.documents.find(function (x) { return x.id === cycDoc.getAttribute('data-cycle-doc'); });
        if (doc) { var ord = ['missing', 'drafting', 'located', 'signed']; doc.status = ord[(ord.indexOf(doc.status) + 1) % ord.length]; persist(); renderAll(); chime(528); T.emit('doc-toggled'); }
        return;
      }
      var delDoc = e.target.closest('[data-del-doc]'); if (delDoc) { var did = delDoc.getAttribute('data-del-doc'); data.documents = data.documents.filter(function (x) { return x.id !== did; }); persist(); renderAll(); return; }
      var delAcc = e.target.closest('[data-del-account]'); if (delAcc) { E.pruneDeletedAccount(data, delAcc.getAttribute('data-del-account')); persist(); renderAll(); return; }
      var togAp = e.target.closest('[data-toggle-autopay]'); if (togAp) { var ap = data.autopays.find(function (x) { return x.id === togAp.getAttribute('data-toggle-autopay'); }); if (ap) { ap.status = ap.status === 'cancelled' ? 'active' : 'cancelled'; persist(); renderAll(); } return; }
      var delAp = e.target.closest('[data-del-autopay]'); if (delAp) { var aid = delAp.getAttribute('data-del-autopay'); data.autopays = data.autopays.filter(function (x) { return x.id !== aid; }); persist(); renderAll(); return; }
      var delDig = e.target.closest('[data-del-digital]'); if (delDig) { var dgid = delDig.getAttribute('data-del-digital'); data.digital = data.digital.filter(function (x) { return x.id !== dgid; }); persist(); renderAll(); return; }
      var delLet = e.target.closest('[data-del-letter]'); if (delLet) { var lid = delLet.getAttribute('data-del-letter'); data.letters = data.letters.filter(function (x) { return x.id !== lid; }); persist(); renderAll(); return; }
    });

    document.addEventListener('change', function (e) {
      var chk = e.target.closest('[data-toggle-chk]');
      if (chk) {
        var item = data.checklist.find(function (x) { return x.id === chk.getAttribute('data-toggle-chk'); });
        if (item) { item.completed = !!chk.checked; persist(); renderOverview(); renderWishes(); chime(528); T.emit('checklist-toggled'); }
      }
    });

    if ($('btn-toggle-fog')) $('btn-toggle-fog').addEventListener('click', function () { data.settings.fog = !data.settings.fog; persist(); applyFog(); T.emit('fog-toggled'); });
    if ($('btn-launch-tour')) $('btn-launch-tour').addEventListener('click', function () { T.start(); });
    if ($('btn-start-tour')) $('btn-start-tour').addEventListener('click', function () { T.start(); });

    if ($('qa-prompt-chips')) {
      $('qa-prompt-chips').addEventListener('click', function (e) {
        var chip = e.target.closest('.chip'); if (!chip) return;
        $('qa-kind').value = chip.getAttribute('data-kind') || 'document';
        $('qa-title').value = chip.getAttribute('data-text') || '';
        $('qa-title').focus();
        $('qa-title').dispatchEvent(new Event('input', { bubbles: true }));
      });
    }

    if ($('btn-qa-add')) {
      $('btn-qa-add').addEventListener('click', function () {
        var kind = $('qa-kind').value, title = $('qa-title').value.trim();
        if (!title) return toast('Enter a short note first');
        var today = E.todayLocalISO();
        data.settings.isSampleSeed = false;
        if (kind === 'contact') data.contacts.unshift({ id: S.uid('cnt'), name: title, relation: 'Trusted', role: 'executor', phone: '', email: '', isFirstCall: true, notes: '', isSample: false });
        else if (kind === 'account') { data.settings.seqCounter = (data.settings.seqCounter || 1) + 1; data.accounts.unshift({ id: S.uid('acc'), name: title, institution: '', last4: '', kind: 'asset', balanceCents: 0, balanceAsOf: today, updatedSeq: data.settings.seqCounter, beneficiaryContactId: '', locationHint: '', isSample: false }); }
        else if (kind === 'digital') data.digital.unshift({ id: S.uid('dig'), service: title, handle: '', directive: 'archive', accessHint: '', isSample: false });
        else data.documents.unshift({ id: S.uid('doc'), title: title, category: 'Legal', status: 'located', location: 'Placed via Quick Stone', custodianContactId: '', updatedAt: today, isSample: false });
        $('qa-title').value = '';
        persist(); renderAll(); chime(432); toast('Stepping stone placed');
      });
    }

    if ($('contact-filter-chips')) {
      $('contact-filter-chips').addEventListener('click', function (e) {
        var chip = e.target.closest('.chip'); if (!chip) return;
        contactFilter = chip.getAttribute('data-filter') || 'all';
        $('contact-filter-chips').querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('selected', c === chip); });
        renderContacts();
      });
    }

    if ($('btn-submit-contact')) $('btn-submit-contact').addEventListener('click', function () {
      var name = $('f-cnt-name').value.trim(); if (!name) return toast('Enter name');
      data.settings.isSampleSeed = false;
      data.contacts.unshift({ id: S.uid('cnt'), name: name, role: $('f-cnt-role').value, relation: $('f-cnt-rel').value.trim(), phone: $('f-cnt-phone').value.trim(), email: $('f-cnt-email').value.trim(), notes: $('f-cnt-notes').value.trim(), isFirstCall: !!$('f-cnt-first').checked, isSample: false });
      ['f-cnt-name', 'f-cnt-rel', 'f-cnt-phone', 'f-cnt-email', 'f-cnt-notes'].forEach(function (i) { $(i).value = ''; });
      $('f-cnt-first').checked = false;
      closeModal('modal-add-contact'); persist(); renderAll(); toast('Person saved');
    });

    if ($('btn-submit-dependent')) $('btn-submit-dependent').addEventListener('click', function () {
      var name = $('f-dep-name').value.trim(); if (!name) return toast('Enter name');
      data.settings.isSampleSeed = false;
      data.dependents.unshift({ id: S.uid('dep'), name: name, type: $('f-dep-type').value, guardianContactId: $('f-dep-guardian').value, careNotes: $('f-dep-notes').value.trim(), isSample: false });
      $('f-dep-name').value = ''; $('f-dep-notes').value = '';
      closeModal('modal-add-dependent'); persist(); renderAll(); toast('Care plan saved');
    });

    if ($('btn-submit-document')) $('btn-submit-document').addEventListener('click', function () {
      var title = $('f-doc-title').value.trim(); if (!title) return toast('Enter title');
      data.settings.isSampleSeed = false;
      data.documents.unshift({ id: S.uid('doc'), title: title, category: $('f-doc-cat').value, status: $('f-doc-status').value, location: $('f-doc-loc').value.trim(), custodianContactId: $('f-doc-custodian').value, updatedAt: E.todayLocalISO(), isSample: false });
      $('f-doc-title').value = ''; $('f-doc-loc').value = '';
      closeModal('modal-add-document'); persist(); renderAll(); toast('Paper mapped');
    });

    if ($('btn-submit-account')) $('btn-submit-account').addEventListener('click', function () {
      var name = $('f-acc-name').value.trim(); if (!name) return toast('Enter label');
      data.settings.isSampleSeed = false;
      data.settings.seqCounter = (data.settings.seqCounter || 1) + 1;
      data.accounts.unshift({ id: S.uid('acc'), name: name, institution: $('f-acc-inst').value.trim(), last4: $('f-acc-last4').value.trim().slice(0, 10), kind: $('f-acc-kind').value, balanceCents: E.parseToCents($('f-acc-bal').value), balanceAsOf: E.todayLocalISO(), updatedSeq: data.settings.seqCounter, beneficiaryContactId: $('f-acc-ben').value, locationHint: $('f-acc-hint').value.trim(), isSample: false });
      ['f-acc-name', 'f-acc-inst', 'f-acc-last4', 'f-acc-bal', 'f-acc-hint'].forEach(function (i) { $(i).value = ''; });
      closeModal('modal-add-account'); persist(); renderAll(); toast('Account saved');
    });

    if ($('btn-submit-autopay')) $('btn-submit-autopay').addEventListener('click', function () {
      var title = $('f-ap-title').value.trim(); if (!title) return toast('Enter title');
      data.settings.isSampleSeed = false;
      data.autopays.unshift({ id: S.uid('ap'), title: title, amountCents: Math.max(0, E.parseToCents($('f-ap-amount').value)), cycle: $('f-ap-cycle').value, paymentMethod: $('f-ap-method').value.trim(), actionNote: $('f-ap-note').value.trim(), status: 'active', isSample: false });
      ['f-ap-title', 'f-ap-amount', 'f-ap-method', 'f-ap-note'].forEach(function (i) { $(i).value = ''; });
      closeModal('modal-add-autopay'); persist(); renderAll(); toast('Auto-pay added');
    });

    if ($('btn-submit-digital')) $('btn-submit-digital').addEventListener('click', function () {
      var svc = $('f-dig-service').value.trim(); if (!svc) return toast('Enter service');
      data.settings.isSampleSeed = false;
      data.digital.unshift({ id: S.uid('dig'), service: svc, handle: $('f-dig-handle').value.trim(), directive: $('f-dig-dir').value, accessHint: $('f-dig-hint').value.trim(), isSample: false });
      ['f-dig-service', 'f-dig-handle', 'f-dig-hint'].forEach(function (i) { $(i).value = ''; });
      closeModal('modal-add-digital'); persist(); renderAll(); toast('Digital key saved');
    });

    if ($('btn-submit-letter')) $('btn-submit-letter').addEventListener('click', function () {
      var to = $('f-let-to').value.trim(), body = $('f-let-body').value.trim();
      if (!to || !body) return toast('Enter recipient & message');
      data.settings.isSampleSeed = false;
      data.letters.unshift({ id: S.uid('let'), recipientName: to, recipientContactId: $('f-let-contact').value, title: $('f-let-title').value.trim() || 'Legacy Letter', body: body, updatedAt: E.todayLocalISO(), isSample: false });
      ['f-let-to', 'f-let-title', 'f-let-body'].forEach(function (i) { $(i).value = ''; });
      closeModal('modal-add-letter'); persist(); renderAll(); toast('Letter saved privately');
    });

    if ($('btn-save-vault-meta')) $('btn-save-vault-meta').addEventListener('click', function () { data.vaultMeta.passwordManager = $('vm-manager').value.trim(); data.vaultMeta.recoveryKitLocation = $('vm-recovery').value.trim(); data.vaultMeta.legacyContactNote = $('vm-legacy-contact').value.trim(); persist(); renderOverview(); toast('Pointer saved'); });
    if ($('btn-save-wishes')) $('btn-save-wishes').addEventListener('click', function () { data.wishes.disposition = $('w-disposition').value.trim(); data.wishes.organDonation = $('w-organ').value.trim(); data.wishes.serviceTone = $('w-tone').value.trim(); data.wishes.musicReadings = $('w-music').value.trim(); data.wishes.serviceNotes = $('w-notes').value.trim(); persist(); renderOverview(); toast('Wishes saved'); });
    if ($('btn-save-profile')) $('btn-save-profile').addEventListener('click', function () { data.settings.ownerName = $('set-owner-name').value.trim(); data.settings.safeLocation = $('set-safe-loc').value.trim(); persist(); toast('Details saved'); });
    if ($('btn-print-packet')) $('btn-print-packet').addEventListener('click', function () { buildPrintablePacket(); window.print(); });
    if ($('btn-export-json')) $('btn-export-json').addEventListener('click', function () {
      var blob = new Blob([S.exportJSON(data)], { type: 'application/json' });
      var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'zen-end-of-life-backup-' + E.todayLocalISO() + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); toast('Backup exported');
    });
    if ($('input-import-json')) $('input-import-json').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0]; if (!file) return;
      var reader = new FileReader(); reader.onload = function () { var res = S.importJSON(reader.result, CFG.themes[0].id); if (res.ok) { data = res.data; persist(); renderAll(); toast('Sanctuary restored'); } else toast(res.error); };
      reader.readAsText(file); e.target.value = '';
    });
    if ($('set-cadence')) $('set-cadence').addEventListener('change', function () { data.settings.reviewCadenceMonths = parseInt($('set-cadence').value, 10) || 12; persist(); renderOverview(); renderSettings(); });
    if ($('set-currency')) $('set-currency').addEventListener('change', function () { data.settings.currency = $('set-currency').value; persist(); renderAll(); });
    if ($('btn-mark-reviewed')) $('btn-mark-reviewed').addEventListener('click', function () { data.settings.lastReviewed = E.todayLocalISO(); persist(); renderOverview(); renderSettings(); toast('Sanctuary reviewed today'); });
    if ($('btn-toggle-sound')) $('btn-toggle-sound').addEventListener('click', function () { data.settings.sound = !data.settings.sound; persist(); renderSettings(); });
    if ($('btn-clean-slate')) $('btn-clean-slate').addEventListener('click', function () { window.setCleanSlateState(true); toast('Clean Slate ready'); });
    if ($('btn-load-sample')) $('btn-load-sample').addEventListener('click', function () { data = S.getSampleData(data.settings.theme, true); persist(); renderAll(); toast('Sample sanctuary loaded'); });
  }

  function init() {
    data = S.load(CFG.themes[0].id);
    try {
      switchTab(CFG.defaultTab);
      renderAll();
      bindEvents();
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) console.error(err);
    }
    if (T && typeof T.init === 'function') {
      T.init({
        config: CFG,
        switchTab: switchTab,
        onEnd: function () {
          data.settings.onboarded = true;
          persist();
          switchTab(CFG.defaultTab);
        }
      });
      if (!data.settings.onboarded) {
        setTimeout(function () { T.start(); }, 120);
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
