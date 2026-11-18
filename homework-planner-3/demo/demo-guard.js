/**
 * Homework Planner 3 (Wabi-Sabi Sanctuary) — Demo Sandbox Guard
 * Isolates demo state into sessionStorage, seeds realistic homework sanctuary data,
 * disables service workers, and injects Etsy conversion prompts.
 */
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register = function () {
      return Promise.resolve();
    };
  }

  const DEMO_STORE_KEY = 'homework_planner_3_data_v1';

  const origGetItem = localStorage.getItem.bind(localStorage);
  const origSetItem = localStorage.setItem.bind(localStorage);
  const origRemoveItem = localStorage.removeItem.bind(localStorage);

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

  function relDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Seed realistic homework sanctuary demo data if fresh session
  if (!sessionStorage.getItem(DEMO_STORE_KEY)) {
    const today = relDate(0);
    const demoData = {
      version: 1,
      settings: {
        theme: 'wabi-sabi',
        dailyCapacityMin: 90,
        skipWeekends: true,
        sound: true,
        onboarded: true,
        tourDone: true,
        fog: false
      },
      courses: [
        { id: 'c1', name: 'AP Biology', color: '#789068' },
        { id: 'c2', name: 'World Literature', color: '#c27050' },
        { id: 'c3', name: 'Calculus BC', color: '#d4b483' },
        { id: 'c4', name: 'US History', color: '#a3816a' }
      ],
      routines: [
        { id: 'r1', title: 'Biology Lab Pre-Read & Summary', courseId: 'c1', weekday: 4, estMin: 35, template: 'reading' },
        { id: 'r2', title: 'Calculus Weekly Problem Set', courseId: 'c3', weekday: 1, estMin: 45, template: 'worksheet' }
      ],
      assignments: [
        {
          id: 'hw1', courseId: 'c1', routineId: '', title: 'Cellular Respiration Lab Questions', due: relDate(1), weight: 25, estMin: 45, manualMin: 0, packed: false,
          steps: [
            { id: 's1', text: 'Diagram the Krebs cycle steps', done: true },
            { id: 's2', text: 'Calculate ATP net yield table', done: false },
            { id: 's3', text: 'Write conclusion paragraph', done: false },
            { id: 's4', text: 'Slide lab report into binder', done: false }
          ],
          status: 'doing', rescue: '', createdAt: relDate(-1) + 'T16:00', completedAt: ''
        },
        {
          id: 'hw2', courseId: 'c3', routineId: '', title: 'Integration by Parts Problem Set', due: relDate(3), weight: 20, estMin: 90, manualMin: 0, packed: false,
          steps: [
            { id: 's5', text: 'Review tabular method examples', done: false },
            { id: 's6', text: 'Solve odd problems #1-15', done: false },
            { id: 's7', text: 'Check answers in back of textbook', done: false }
          ],
          status: 'todo', rescue: '', createdAt: relDate(-1) + 'T17:00', completedAt: ''
        },
        {
          id: 'hw3', courseId: 'c4', routineId: '', title: 'Civil Rights Movement Outline', due: relDate(-1), weight: 15, estMin: 30, manualMin: 0, packed: false,
          steps: [
            { id: 's8', text: 'Review Chapter 14 primary sources', done: false },
            { id: 's9', text: 'Bullet point 3 historical turning points', done: false }
          ],
          status: 'todo', rescue: '', createdAt: relDate(-3) + 'T15:00', completedAt: ''
        },
        {
          id: 'hw4', courseId: 'c2', routineId: '', title: 'Comparative Essay Intro Paragraph', due: today, weight: 15, estMin: 25, manualMin: 25, packed: true,
          steps: [
            { id: 's10', text: 'Formulate thesis statement', done: true },
            { id: 's11', text: 'Print out clean double-spaced draft', done: true }
          ],
          status: 'done', rescue: '', createdAt: relDate(-2) + 'T16:00', completedAt: today + 'T18:10'
        }
      ],
      sprints: [
        { id: 'sp1', assignmentId: 'hw1', date: today, minutes: 15 }
      ]
    };
    sessionStorage.setItem(DEMO_STORE_KEY, JSON.stringify(demoData));
  }

  // Inject Demo Banner & Conversion Modal
  document.addEventListener('DOMContentLoaded', function () {
    const banner = document.createElement('div');
    banner.className = 'etsy-demo-banner';
    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>🕯 <strong>Live Interactive Demo:</strong> Homework Planner 3 (Wabi-Sabi Sanctuary)</span>
      </div>
      <div>
        <a href="https://zensanctuary-studio.github.io/homework-planner-3/" target="_blank" class="etsy-demo-cta">
          ⚡ Unlock Full Lifetime App ($14.00)
        </a>
      </div>
    `;
    document.body.prepend(banner);

    const modal = document.createElement('div');
    modal.className = 'etsy-demo-modal-overlay';
    modal.id = 'etsy-demo-modal';
    modal.innerHTML = `
      <div class="etsy-demo-modal-card">
        <h3>🕯 Unlock the Complete Wabi-Sabi Homework Sanctuary</h3>
        <p>
          You are test-driving the live sandbox. Get the complete lifetime edition on Etsy with instant offline PWA access, Leo's illustrated customer handbook, and printable evening sanctuary worksheets.
        </p>
        <a href="https://zensanctuary-studio.github.io/homework-planner-3/" target="_blank" class="etsy-gate-btn-buy">
          Get Instant Access on Etsy — $14.00
        </a>
        <br>
        <button type="button" class="etsy-gate-btn-close" id="btn-close-demo-modal">
          Continue Test Drive
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = document.getElementById('btn-close-demo-modal');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        modal.classList.remove('active');
      });
    }

    setTimeout(function () {
      const btnExport = document.getElementById('btn-export');
      if (btnExport) {
        btnExport.addEventListener('click', function (e) {
          e.stopImmediatePropagation();
          modal.classList.add('active');
        }, true);
      }
    }, 500);
  });
})();
