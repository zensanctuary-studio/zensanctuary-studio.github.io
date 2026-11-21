/**
 * Assignment Tracker — Sanctuary Edition (Edition 3) — Demo Sandbox Guard
 * Isolates demo state into sessionStorage, seeds realistic mindful academic demo data,
 * disables service workers, and injects Etsy conversion prompts.
 */
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register = function () {
      return Promise.resolve();
    };
  }

  var DEMO_STORE_KEY = 'assignment_tracker_3_data_v1';

  var origGetItem = localStorage.getItem.bind(localStorage);
  var origSetItem = localStorage.setItem.bind(localStorage);
  var origRemoveItem = localStorage.removeItem.bind(localStorage);

  localStorage.getItem = function (k) {
    if (k === DEMO_STORE_KEY) return sessionStorage.getItem(k);
    return origGetItem(k);
  };
  localStorage.setItem = function (k, v) {
    if (k === DEMO_STORE_KEY) return sessionStorage.setItem(k, v);
    return origSetItem(k, v);
  };
  localStorage.removeItem = function (k) {
    if (k === DEMO_STORE_KEY) return sessionStorage.removeItem(k);
    return origRemoveItem(k);
  };

  // Seed realistic demo data if fresh session
  if (!sessionStorage.getItem(DEMO_STORE_KEY)) {
    var today = new Date().toISOString().slice(0, 10);
    var demoData = {
      version: 1,
      settings: { theme: 'terracotta-sun', dailyCapacityMin: 120, skipWeekends: true, sound: true, onboarded: false, fog: false },
      courses: [
        { id: 'c1', name: 'Cognitive Ecology', color: '#e07a5f' },
        { id: 'c2', name: 'Mindful Architecture', color: '#81b29a' },
        { id: 'c3', name: 'Wabi-Sabi Design Theory', color: '#d4a373' }
      ],
      assignments: [
        {
          id: 'a1', courseId: 'c1', title: 'Perceptual Restoration Field Study', due: today, weight: 30, estMin: 120, manualMin: 0,
          steps: [
            { id: 's1', text: 'Select observation site in urban greenspace', done: true },
            { id: 's2', text: 'Document 3 restorative sensory cues', done: false },
            { id: 's3', text: 'Synthesize findings into draft summary', done: false }
          ],
          status: 'doing', rescue: '', createdAt: today, completedAt: ''
        },
        {
          id: 'a2', courseId: 'c2', title: 'Japanese Joinery & Wooden Pavilions', due: today, weight: 25, estMin: 90, manualMin: 0,
          steps: [
            { id: 's4', text: 'Sketch mortise and tenon joint diagrams', done: true },
            { id: 's5', text: 'Analyze natural load distribution', done: false }
          ],
          status: 'todo', rescue: '', createdAt: today, completedAt: ''
        },
        {
          id: 'a3', courseId: 'c3', title: 'Wabi-Sabi Aesthetics Essay', due: today, weight: 20, estMin: 60, manualMin: 60,
          steps: [{ id: 's6', text: 'Write final concluding remarks', done: true }],
          status: 'done', rescue: '', createdAt: today, completedAt: today + 'T12:00'
        }
      ],
      sprints: [
        { id: 'sp1', assignmentId: 'a1', date: today, minutes: 25 }
      ]
    };
    sessionStorage.setItem(DEMO_STORE_KEY, JSON.stringify(demoData));
  }

  // Inject Demo Banner & Conversion Modal
  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.createElement('div');
    banner.className = 'etsy-demo-banner';
    banner.innerHTML = 
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<span>🌿 <strong>Live Interactive Demo:</strong> Assignment Tracker (Sanctuary Edition)</span>' +
      '</div>' +
      '<div>' +
        '<a href="https://zensanctuary-studio.github.io/assignment-tracker-3/" target="_blank" class="etsy-demo-cta">' +
          '⚡ Unlock Lifetime Sanctuary ($9.00)' +
        '</a>' +
      '</div>';
    document.body.prepend(banner);

    var modal = document.createElement('div');
    modal.className = 'etsy-demo-modal-overlay';
    modal.id = 'etsy-demo-modal';
    modal.innerHTML = 
      '<div class="etsy-demo-modal-card">' +
        '<h3>🌿 Bring Your Academic Sanctuary Home</h3>' +
        '<p>You are test-driving the demo sandbox. Get the official edition on Etsy for instant offline access and permanent local storage on your phone, tablet, and laptop.</p>' +
        '<a href="https://zensanctuary-studio.github.io/assignment-tracker-3/" target="_blank" class="etsy-gate-btn-buy">' +
          'Get Instant Access on Etsy — $9.00' +
        '</a>' +
        '<br>' +
        '<button type="button" class="etsy-gate-btn-close" id="btn-close-demo-modal">Continue Test Drive</button>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('btn-close-demo-modal').addEventListener('click', function () {
      modal.classList.remove('active');
    });

    setTimeout(function () {
      var btnExport = document.getElementById('btn-export-json');
      if (btnExport) {
        btnExport.addEventListener('click', function (e) {
          e.stopImmediatePropagation();
          modal.classList.add('active');
        }, true);
      }
    }, 500);
  });
})();
