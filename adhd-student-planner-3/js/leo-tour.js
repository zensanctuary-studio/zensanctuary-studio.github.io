/**
 * ADHD Student Planner 3 — Leo's Mindful Onboarding Tour Engine
 * Persona: Leo (Zen Sanctuary Studio) — Mindful, grounding, calm academic companion.
 * Implements Rule-01 (DOM spotlights & beacons), Rule-02 (Crash-proof self-healing display),
 * Rule-11 (Screen-Synchronized Guided Navigation & Viewport Adaptive Positioning),
 * and Rule-15 (Mobile Viewport Edge Hygiene).
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LeoTour = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let currentStep = 0;
  let isActive = false;
  let activeSpotlightElement = null;

  const TOUR_STEPS = [
    {
      tabId: 'dashboard',
      sectionName: 'Sanctuary • Mindful Focus Hero',
      targetId: 'zen-focus-hero',
      title: 'Leo here. Welcome to Your Academic Sanctuary.',
      message: 'Syllabus overwhelm destroys cognitive momentum. This Sanctuary isolates your single highest-yield micro-step right now.',
      actionHint: 'Notice the immediate micro-step and time allocation.',
      beaconPosition: 'top-right'
    },
    {
      tabId: 'dashboard',
      sectionName: 'Sanctuary • Concentric Radial Dial',
      targetId: 'radial-hero-card',
      title: 'Concentric Radial Progress Dial',
      message: 'Track semester flow, weighted GPA harmony, and mindful focus minutes in one calm, low-stimulation visual ring.',
      actionHint: 'Check your semester momentum at a gentle glance.',
      beaconPosition: 'top-left'
    },
    {
      tabId: 'dashboard',
      sectionName: 'Header • Sensory Rest Mode',
      targetId: 'btn-fog-zen',
      title: 'Sensory Rest Mode (Fog Mode)',
      message: 'Feeling overwhelmed? Toggle this mode to quiet non-essential future tasks and reveal only today’s calm milestone.',
      actionHint: 'Toggle Sensory Rest Mode anytime to reduce visual friction.',
      beaconPosition: 'top-right'
    },
    {
      tabId: 'courses',
      sectionName: 'Curriculum • Weighted Grade Harmony',
      targetId: 'grid-courses',
      title: 'Course Grade & GPA Engine',
      message: 'We are now in your Curriculum panel! Automated weighted algorithms track midterms, labs, and assignments with zero spreadsheet stress.',
      actionHint: 'View enrolled courses and letter grade targets.',
      beaconPosition: 'top-right'
    },
    {
      tabId: 'dashboard',
      sectionName: 'Sanctuary • Restorative Flow Sprints',
      targetId: 'btn-sprint-toggle',
      title: 'Restorative Flow Sprints',
      message: 'Back in the Sanctuary: Settle into a gentle 20-minute focus block. If distractions happen, Grace Shields automatically preserve your streak.',
      actionHint: 'Tap Done to embark on your mindful academic semester!',
      beaconPosition: 'bottom-right'
    }
  ];

  function getTourElements() {
    return {
      overlay: document.getElementById('tutorial-overlay'),
      card: document.getElementById('tutorial-card'),
      title: document.getElementById('tutorial-title'),
      message: document.getElementById('tutorial-message'),
      hint: document.getElementById('tutorial-hint'),
      sectionTag: document.getElementById('tutorial-section-tag'),
      stepCount: document.getElementById('tutorial-step-count'),
      btnNext: document.getElementById('tutorial-btn-next'),
      btnPrev: document.getElementById('tutorial-btn-prev'),
      btnSkip: document.getElementById('tutorial-btn-skip')
    };
  }

  function clearSpotlight() {
    if (activeSpotlightElement) {
      activeSpotlightElement.classList.remove('leo-target-active');
      activeSpotlightElement = null;
    }
    const beacons = document.querySelectorAll('.leo-beacon');
    beacons.forEach(b => b.remove());
  }

  function renderStep(index) {
    const els = getTourElements();
    if (!els.overlay || !els.card) return;

    if (index < 0 || index >= TOUR_STEPS.length) {
      endTour();
      return;
    }

    currentStep = index;
    const step = TOUR_STEPS[index];

    // Rule-11: Screen Synchronization
    if (window.switchStudentTab && step.tabId) {
      window.switchStudentTab(step.tabId);
    }

    setTimeout(() => {
      clearSpotlight();

      // Spotlight Target
      const target = document.getElementById(step.targetId);
      if (target) {
        target.classList.add('leo-target-active');
        activeSpotlightElement = target;

        // Pulsing Beacon
        const beacon = document.createElement('div');
        beacon.className = 'leo-beacon';
        const rect = target.getBoundingClientRect();
        target.style.position = (window.getComputedStyle(target).position === 'static') ? 'relative' : target.style.position;

        if (step.beaconPosition === 'top-right') {
          beacon.style.top = '10px';
          beacon.style.right = '10px';
        } else if (step.beaconPosition === 'top-left') {
          beacon.style.top = '10px';
          beacon.style.left = '10px';
        } else if (step.beaconPosition === 'bottom-right') {
          beacon.style.bottom = '10px';
          beacon.style.right = '10px';
        } else {
          beacon.style.top = '10px';
          beacon.style.right = '10px';
        }
        target.appendChild(beacon);

        // Position Card with Mobile Collision Avoidance (Rule-11)
        positionGuideCard(target, els.card);
      }

      // Update Card Content
      if (els.title) els.title.textContent = step.title;
      if (els.message) els.message.textContent = step.message;
      if (els.hint) els.hint.textContent = `💡 Leo’s Tip: ${step.actionHint}`;
      if (els.sectionTag) els.sectionTag.textContent = `📍 SECTION: ${step.sectionName}`;
      if (els.stepCount) els.stepCount.textContent = `Step ${index + 1} of ${TOUR_STEPS.length}`;

      if (els.btnPrev) {
        els.btnPrev.style.display = index === 0 ? 'none' : 'inline-flex';
      }

      if (els.btnNext) {
        els.btnNext.textContent = index === TOUR_STEPS.length - 1 ? 'Engage Sanctuary 🌿' : 'Next Step →';
      }
    }, 60);
  }

  function positionGuideCard(targetEl, cardEl) {
    const rect = targetEl.getBoundingClientRect();
    const vWidth = window.innerWidth;
    const vHeight = window.innerHeight;

    // Desktop vs Mobile Positioning (Rule-11 & Rule-15)
    if (vWidth <= 640) {
      cardEl.style.left = '12px';
      cardEl.style.right = '12px';
      cardEl.style.transform = 'none';

      // Detect if target is in top half or bottom half of viewport
      const targetMid = rect.top + rect.height / 2;
      if (targetMid > vHeight / 2) {
        // Place card near top
        cardEl.style.top = '16px';
        cardEl.style.bottom = 'auto';
      } else {
        // Place card leaving >80px clearance above floating island dock (~70px height)
        cardEl.style.bottom = '85px';
        cardEl.style.top = 'auto';
      }
    } else {
      // Desktop floating placement
      cardEl.style.left = '50%';
      cardEl.style.transform = 'translateX(-50%)';

      if (rect.bottom + 240 < vHeight) {
        cardEl.style.top = `${Math.max(16, rect.bottom + 12)}px`;
        cardEl.style.bottom = 'auto';
      } else {
        cardEl.style.bottom = `${Math.max(20, vHeight - rect.top + 12)}px`;
        cardEl.style.top = 'auto';
      }
    }
  }

  function startTour(forceRestart) {
    const hasSeen = localStorage.getItem('adhd_student_zen_seen_tour_v1');
    if (hasSeen && !forceRestart) return;

    const els = getTourElements();
    if (!els.overlay || !els.card) return;

    isActive = true;
    els.overlay.classList.add('active');
    els.card.style.display = 'flex';
    renderStep(0);
  }

  function endTour() {
    isActive = false;
    clearSpotlight();
    const els = getTourElements();
    if (els.overlay) els.overlay.classList.remove('active');
    if (els.card) els.card.style.display = 'none';
    localStorage.setItem('adhd_student_zen_seen_tour_v1', 'true');

    if (window.switchStudentTab) {
      window.switchStudentTab('dashboard');
    }
  }

  function initTourHandlers() {
    const els = getTourElements();

    if (els.btnNext) {
      els.btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep < TOUR_STEPS.length - 1) {
          renderStep(currentStep + 1);
        } else {
          endTour();
        }
      });
    }

    if (els.btnPrev) {
      els.btnPrev.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 0) {
          renderStep(currentStep - 1);
        }
      });
    }

    if (els.btnSkip) {
      els.btnSkip.addEventListener('click', (e) => {
        e.preventDefault();
        endTour();
      });
    }

    // Self-healing window resize handler
    window.addEventListener('resize', () => {
      if (isActive && activeSpotlightElement && els.card) {
        positionGuideCard(activeSpotlightElement, els.card);
      }
    });
  }

  return {
    startTour: startTour,
    endTour: endTour,
    renderStep: renderStep,
    initTourHandlers: initTourHandlers,
    isTourActive: function () { return isActive; }
  };
});
