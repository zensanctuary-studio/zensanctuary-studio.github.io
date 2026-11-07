/**
 * ADHD Life Planner 3 (Edition 3) - Leo's Mindful Guided Sanctuary Tour
 * Strict capture-phase UX guardrails (blocks non-tour clicks & nudges user),
 * interactive modal hand-holding, auto-typing simulation, and DOM-anchored spotlights.
 * Resilient, self-healing architecture: never freezes, restores visibility seamlessly.
 */

(function (global) {
  'use strict';

  const Leo = {};
  let currentStepIndex = 0;
  let isTourActive = false;
  let currentTargetEl = null;

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  function getVisibleNavTab(tabName) {
    return document.querySelector(`[data-tab="${tabName}"]`);
  }

  // ========================================================
  // 1. DOM-ANCHORED TARGET HIGHLIGHT & BEACON
  // Physically attached to the element so it never shifts on resize/scroll!
  // ========================================================
  function highlightTarget(target, badgeText = '🌿 Tap here') {
    clearHighlight();
    if (!target) return null;

    const el = (typeof target === 'string') ? document.querySelector(target) : target;
    if (!el) return null;

    currentTargetEl = el;

    if (typeof el.scrollIntoView === 'function') {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (e) {}
    }

    el.classList.add('tutorial-target-active');

    const badge = document.createElement('span');
    badge.className = 'leo-target-badge';
    badge.id = 'leo-target-badge';
    badge.innerHTML = `<span>${badgeText}</span>`;

    const isVoidEl = ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName);
    const hostEl = isVoidEl ? el.parentElement : el;

    if (hostEl) {
      const computed = window.getComputedStyle(hostEl).position;
      if (computed === 'static') {
        hostEl.dataset.origPosition = 'static';
        hostEl.style.position = 'relative';
      }
      if (isVoidEl) {
        badge.style.top = '-12px';
        badge.style.right = '4px';
      }
      hostEl.appendChild(badge);
    }

    return el;
  }

  function clearHighlight() {
    if (currentTargetEl) {
      currentTargetEl.classList.remove('tutorial-target-active');
      if (currentTargetEl.dataset.origPosition === 'static') {
        currentTargetEl.style.position = '';
        delete currentTargetEl.dataset.origPosition;
      }
      const b = currentTargetEl.querySelector('#leo-target-badge');
      if (b) b.remove();
      if (currentTargetEl.parentElement) {
        const pb = currentTargetEl.parentElement.querySelector('#leo-target-badge');
        if (pb) pb.remove();
      }
      currentTargetEl = null;
    }

    document.querySelectorAll('.tutorial-target-active').forEach(el => {
      el.classList.remove('tutorial-target-active');
      const b = el.querySelector('#leo-target-badge');
      if (b) b.remove();
      if (el.parentElement) {
        const pb = el.parentElement.querySelector('#leo-target-badge');
        if (pb) pb.remove();
      }
    });
  }

  // Realistic Human Typing Animation
  async function typeIntoField(element, text, speed = 20) {
    if (!element) return;
    element.focus();
    element.value = '';
    element.classList.add('typing-active');

    return new Promise((resolve) => {
      let currentVal = '';
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          currentVal += text.charAt(i);
          element.value = currentVal;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          i++;
        } else {
          clearInterval(timer);
          element.classList.remove('typing-active');
          element.dispatchEvent(new Event('change', { bubbles: true }));
          resolve();
        }
      }, speed);
    });
  }

  // ========================================================
  // 2. MODAL-EMBEDDED GUIDE BANNER
  // ========================================================
  function showModalGuideBanner(modalSelector, { message, actionText, actionHandler }) {
    removeModalGuideBanner();
    hideGuideCard();

    const modalEl = document.querySelector(modalSelector);
    if (!modalEl) {
      showGuideCard();
      return;
    }

    const dialog = modalEl.querySelector('.modal-dialog') || modalEl;
    const banner = document.createElement('div');
    banner.className = 'leo-modal-banner';
    banner.id = 'leo-modal-banner';

    banner.innerHTML = `
      <div class="leo-guide-header">
        <div class="leo-guide-identity">
          <span class="leo-avatar">🌿</span>
          <div>
            <div class="leo-name">Leo • Sanctuary Guide</div>
            <div class="leo-role">Step ${currentStepIndex + 1} of ${MASTER_STORY.steps.length}</div>
          </div>
        </div>
      </div>
      <div class="leo-bubble-message">${message}</div>
      ${actionText ? `
        <div style="display:flex;justify-content:flex-end;margin-top:4px;">
          <button class="leo-prompt-btn pulse" id="btn-modal-action">${actionText}</button>
        </div>
      ` : ''}
    `;

    const firstChild = dialog.firstElementChild;
    dialog.insertBefore(banner, firstChild);

    const actBtn = banner.querySelector('#btn-modal-action');
    if (actBtn && typeof actionHandler === 'function') {
      actBtn.addEventListener('click', async () => {
        actBtn.disabled = true;
        actBtn.classList.remove('pulse');
        await actionHandler();
      });
    }
  }

  function removeModalGuideBanner() {
    const banner = document.getElementById('leo-modal-banner');
    if (banner) banner.remove();
    showGuideCard();
  }

  function hideGuideCard() {
    const card = document.getElementById('tutorial-guide-card');
    if (card) card.style.display = 'none';
  }

  function showGuideCard() {
    const card = document.getElementById('tutorial-guide-card');
    if (card) card.style.display = 'flex';
  }

  // ========================================================
  // 3. UX GUARDRAILS (MINDFUL ENCOURAGEMENT)
  // ========================================================
  function handleTourClickGuard(e) {
    if (!isTourActive) return;
    if (!e.isTrusted) return;

    const isGuide = e.target.closest('#tutorial-guide-card');
    const isHUD = e.target.closest('#tutorial-hud-bar');
    const isModal = e.target.closest('.zen-modal') || e.target.closest('.modal-overlay') || e.target.closest('.modal-dialog') || e.target.closest('#zen-drawer-overlay');
    const isNav = e.target.closest('#zen-island-nav') || e.target.closest('.zen-nav-item') || e.target.closest('#btn-island-fab');
    const isTarget = currentTargetEl && (currentTargetEl === e.target || currentTargetEl.contains(e.target));
    const isFormElement = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'LABEL'].includes(e.target.tagName);

    if (isGuide || isHUD || isModal || isNav || isTarget || isFormElement) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    triggerEncouragementNudge();
  }

  function triggerEncouragementNudge() {
    const card = document.getElementById('tutorial-guide-card');
    if (card && card.style.display !== 'none') {
      card.classList.remove('nudge');
      void card.offsetWidth;
      card.classList.add('nudge');

      let toast = card.querySelector('.leo-nudge-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'leo-nudge-toast';
        toast.textContent = "🌿 Gently follow Leo's highlighted step to proceed.";
        const msg = card.querySelector('.leo-bubble-message');
        if (msg) msg.parentNode.insertBefore(toast, msg.nextSibling);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2800);
      }
    }
  }

  // ========================================================
  // 4. FLOATING CHAT BUBBLE RENDERER
  // ========================================================
  function renderChatBubble({ message, actionText, actionHandler, isComplete, canSkip = true }) {
    let card = document.getElementById('tutorial-guide-card');
    if (!card) {
      card = document.createElement('div');
      card.id = 'tutorial-guide-card';
      card.className = 'leo-guide-card';
      document.body.appendChild(card);
    }

    card.style.display = 'flex'; // ALWAYS ENSURE VISIBILITY

    card.innerHTML = `
      <div class="leo-guide-header">
        <div class="leo-guide-identity">
          <span class="leo-avatar">🌿</span>
          <div>
            <div class="leo-name">Leo • Sanctuary Guide</div>
            <div class="leo-role">Step ${currentStepIndex + 1} of ${MASTER_STORY.steps.length}</div>
          </div>
        </div>
        <span style="font-size:10px;color:#e07a5f;font-weight:700;">MINDFUL</span>
      </div>
      <div class="leo-bubble-message">${message}</div>
      <div class="leo-bubble-actions">
        ${canSkip && !isComplete ? `<button class="btn-tour-skip" id="btn-tour-skip">Skip Guide</button>` : `<div></div>`}
        ${actionText ? `
          <button class="leo-prompt-btn pulse" id="btn-bubble-act">
            ${actionText}
          </button>
        ` : ''}
      </div>
    `;

    const actBtn = card.querySelector('#btn-bubble-act');
    if (actBtn && typeof actionHandler === 'function') {
      actBtn.addEventListener('click', async () => {
        actBtn.disabled = true;
        actBtn.classList.remove('pulse');
        await actionHandler();
      });
    }

    const skipBtn = card.querySelector('#btn-tour-skip');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => {
        Leo.exitTour();
      });
    }

    updateHUD();
  }

  function renderHUD() {
    let hud = document.getElementById('tutorial-hud-bar');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'tutorial-hud-bar';
      hud.className = 'tutorial-hud-bar';
      document.body.appendChild(hud);
    }
    updateHUD();
  }

  function updateHUD() {
    const hud = document.getElementById('tutorial-hud-bar');
    if (!hud) return;
    const currentStep = MASTER_STORY.steps[currentStepIndex];
    if (!currentStep) return;
    hud.innerHTML = `
      <div class="tutorial-hud-title">
        <span class="tutorial-hud-step-pill">Step ${currentStepIndex + 1}/${MASTER_STORY.steps.length}</span>
        <span>${currentStep.title}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="tutorial-hud-sub">Wabi-Sabi Sanctuary</span>
        <button class="tutorial-hud-exit" id="btn-hud-exit-tour">✕ Exit</button>
      </div>
    `;

    const exitBtn = hud.querySelector('#btn-hud-exit-tour');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => Leo.exitTour());
    }
  }

  // ========================================================
  // 5. MASTER 5-STEP HAND-HOLDING STORY (DUAL-TRIGGER RESILIENT)
  // ========================================================
  const MASTER_STORY = {
    steps: [
      // STEP 1: Daily Focus Anchor
      {
        stepNum: 1,
        title: "The Daily Focus Anchor",
        init: async () => {
          clearHighlight();
          showGuideCard();
          if (window.ZenApp) window.ZenApp.switchTab('today');
          await wait(200);

          highlightTarget('#daily-anchor-card', '👉 1. Focus Anchor Card');

          let anchorDone = false;
          const advanceToAnchorCheck = () => {
            clearHighlight();
            highlightTarget('#anchor-checkbox', '👉 Check Anchor');

            renderChatBubble({
              message: "Now tap the checkmark to complete your anchor. Hear the calming harmonic chord!",
              actionText: "🎉 Complete Anchor Win",
              actionHandler: async () => {
                const chk = document.getElementById('anchor-checkbox');
                if (chk) {
                  chk.checked = true;
                  chk.dispatchEvent(new Event('change', { bubbles: true }));
                }
                onAnchorCompleted();
              }
            });

            const chk = document.getElementById('anchor-checkbox');
            if (chk) {
              chk.addEventListener('change', () => {
                if (chk.checked) onAnchorCompleted();
              }, { once: true });
            }
          };

          const onAnchorCompleted = () => {
            if (anchorDone) return;
            anchorDone = true;
            clearHighlight();
            setTimeout(() => {
              const dial = document.querySelector('.radial-hero-card') || document.getElementById('dial-number');
              if (dial) highlightTarget(dial, '🌿 Momentum 100%');
              renderChatBubble({
                message: "🎉 Look at the concentric radial dial! You've already won today. Next, let's explore your Capacity Battery and Low-Spoons Sanctuary.",
                actionText: "Next: Capacity & Low Spoons →",
                actionHandler: () => Leo.nextStep()
              });
            }, 300);
          };

          renderChatBubble({
            message: "Welcome friend. I am <strong>Leo</strong> 🌿. Traditional apps drown your attention in 30 tasks. In our sanctuary, we honor the <strong>Single Win Rule</strong>: choose just 1 focus anchor.",
            actionText: "🌿 Type Mindful Anchor",
            actionHandler: async () => {
              const input = document.getElementById('anchor-input');
              if (input) {
                await typeIntoField(input, "Drink warm tea & stretch gently for 2 minutes", 20);
              }
              advanceToAnchorCheck();
            }
          });

          const input = document.getElementById('anchor-input');
          if (input) {
            input.addEventListener('change', () => {
              if (input.value.trim().length > 0) advanceToAnchorCheck();
            }, { once: true });
          }
        }
      },

      // STEP 2: Battery Capacity & Low-Spoons Sanctuary
      {
        stepNum: 2,
        title: "Battery Dial & Low Spoons",
        init: async () => {
          clearHighlight();
          showGuideCard();
          highlightTarget('#energy-dial-bar', '👉 2. Battery Dial');

          const advanceToShield = () => {
            clearHighlight();
            highlightTarget('#btn-burnout-shield', '👉 🛡️ Low-Spoons Shield');

            renderChatBubble({
              message: "When overwhelmed, activate the <strong>🛡️ Shield</strong> in the top header. It softly dims all non-essential chores, showing only survival basics:",
              actionText: "🛡️ Toggle Low-Spoons Shield",
              actionHandler: async () => {
                const shieldBtn = document.getElementById('btn-burnout-shield');
                if (shieldBtn) shieldBtn.click();
                advanceToShieldOff();
              }
            });

            const shieldBtn = document.getElementById('btn-burnout-shield');
            if (shieldBtn) {
              shieldBtn.addEventListener('click', advanceToShieldOff, { once: true });
            }
          };

          const advanceToShieldOff = () => {
            renderChatBubble({
              message: "Notice the peaceful atmosphere and reduced visual clutter. Zero guilt. Tap below to turn the shield off and continue:",
              actionText: "☀️ Turn Shield OFF",
              actionHandler: async () => {
                const shieldBtn = document.getElementById('btn-burnout-shield');
                if (shieldBtn) shieldBtn.click();
                const normalPill = document.querySelector('.energy-pill[data-energy="normal"]');
                if (normalPill) normalPill.click();
                clearHighlight();
                await wait(200);

                renderChatBubble({
                  message: "Beautiful. Now let me share our gentlest tool for task initiation: the <strong>1-Click Task De-chunker</strong>.",
                  actionText: "Next: Task De-chunker →",
                  actionHandler: () => Leo.nextStep()
                });
              }
            });
          };

          renderChatBubble({
            message: "ADHD energy fluctuates naturally. On low-energy days, pushing through leads to burnout. Tap <strong>Low Spoons</strong>:",
            actionText: "🌧️ Select 'Low Spoons'",
            actionHandler: async () => {
              const lowPill = document.querySelector('.energy-pill[data-energy="low"]');
              if (lowPill) lowPill.click();
              await wait(200);
              advanceToShield();
            }
          });

          const lowPill = document.querySelector('.energy-pill[data-energy="low"]');
          if (lowPill) {
            lowPill.addEventListener('click', advanceToShield, { once: true });
          }
        }
      },

      // STEP 3: Task De-chunker
      {
        stepNum: 3,
        title: "Task De-chunker (Paralysis Breaker)",
        init: async () => {
          clearHighlight();
          showGuideCard();
          highlightTarget('#btn-open-add-task', '👉 3. Tap \'+ Add Task\'');

          let taskOpened = false;
          const openTaskModal = async () => {
            if (taskOpened) return;
            taskOpened = true;
            if (window.ZenApp) window.ZenApp.openModal('modal-add-task');
            clearHighlight();
            await wait(250);

            highlightTarget('#input-task-title', '👉 Intention Name');
            showModalGuideBanner('#modal-add-task', {
              message: "Let's enter a heavy chore that causes task paralysis like <em>'Tidy messy room'</em>:",
              actionText: "🌿 Type \"Tidy messy room\"",
              actionHandler: async () => {
                const titleInput = document.getElementById('input-task-title');
                if (titleInput) await typeIntoField(titleInput, "Tidy messy room", 20);

                clearHighlight();
                const saveBtn = document.querySelector('#form-add-task button[type="submit"]');
                highlightTarget(saveBtn, '👉 Save Task');

                showModalGuideBanner('#modal-add-task', {
                  message: "Now tap <strong>Save Task</strong> below:",
                  actionText: "💾 Save Task",
                  actionHandler: async () => {
                    const form = document.getElementById('form-add-task');
                    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                    removeModalGuideBanner();
                    clearHighlight();
                    await wait(350);
                    setupDechunkStep();
                  }
                });
              }
            });

            const form = document.getElementById('form-add-task');
            if (form) {
              const onNativeSubmit = () => {
                form.removeEventListener('submit', onNativeSubmit);
                removeModalGuideBanner();
                clearHighlight();
                setTimeout(setupDechunkStep, 350);
              };
              form.addEventListener('submit', onNativeSubmit, { once: true });
            }
          };

          const setupDechunkStep = () => {
            showGuideCard();
            const dechunkBtn = document.querySelector('.btn-dechunk');
            if (dechunkBtn) {
              highlightTarget(dechunkBtn, '👉 4. Tap ✂️ to De-chunk!');
            }

            let dechunked = false;
            const onDechunkDone = () => {
              if (dechunked) return;
              dechunked = true;
              clearHighlight();
              setTimeout(() => {
                const subtasks = document.querySelector('.subtasks-container') || document.querySelector('.task-card');
                if (subtasks) highlightTarget(subtasks, '🎉 Micro-Steps Generated');
                renderChatBubble({
                  message: "🎉 Notice how the heaviness vanishes. 3-minute micro-actions create effortless momentum without friction!",
                  actionText: "Next: The Dopamine Menu →",
                  actionHandler: () => Leo.nextStep()
                });
              }, 300);
            };

            renderChatBubble({
              message: "Here is the gentle secret! Tap the <strong>✂️ scissors icon</strong> to split this heavy task into 3-minute steps:",
              actionText: "✂️ De-chunk This Task Now",
              actionHandler: async () => {
                const btn = document.querySelector('.btn-dechunk');
                if (btn) btn.click();
                onDechunkDone();
              }
            });

            document.querySelectorAll('.btn-dechunk').forEach(b => {
              b.addEventListener('click', onDechunkDone, { once: true });
            });
          };

          renderChatBubble({
            message: "When executive dysfunction strikes, large projects feel impossible. Tap <strong>'+ Add Task'</strong>:",
            actionText: "👉 Open '+ Add Task'",
            actionHandler: openTaskModal
          });

          const btn = document.getElementById('btn-open-add-task');
          if (btn) btn.addEventListener('click', openTaskModal, { once: true });
        }
      },

      // STEP 4: The Dopamine Menu
      {
        stepNum: 4,
        title: "The Dopamine Menu",
        init: async () => {
          clearHighlight();
          showGuideCard();
          const dopTab = getVisibleNavTab('dopamine');
          if (dopTab) highlightTarget(dopTab, '👉 5. Tap Nourish / Dopamine');

          let tabOpened = false;
          const openDopamineTab = async () => {
            if (tabOpened) return;
            tabOpened = true;
            if (window.ZenApp) window.ZenApp.switchTab('dopamine');
            clearHighlight();
            await wait(250);

            highlightTarget('#btn-dopamine-surprise', '👉 Surprise Me Seed');

            let surpriseDone = false;
            const onSurpriseDone = () => {
              if (surpriseDone) return;
              surpriseDone = true;
              clearHighlight();
              setTimeout(() => {
                renderChatBubble({
                  message: "Our menu categorizes dopamine into <strong>Appetizers</strong> (quick 2-min tea/breaths), <strong>Sides</strong> (soundscapes/candles), and <strong>Desserts</strong> (restful rewards)!",
                  actionText: "Next: Grace Streaks →",
                  actionHandler: () => Leo.nextStep()
                });
              }, 400);
            };

            renderChatBubble({
              message: "When under-stimulated, tap <strong>'Surprise Me'</strong> for an instant healthy dopamine reset without doom-scrolling:",
              actionText: "⚡ Tap 'Surprise Me'",
              actionHandler: async () => {
                const sBtn = document.getElementById('btn-dopamine-surprise');
                if (sBtn) sBtn.click();
                onSurpriseDone();
              }
            });

            const sBtn = document.getElementById('btn-dopamine-surprise');
            if (sBtn) sBtn.addEventListener('click', onSurpriseDone, { once: true });
          };

          renderChatBubble({
            message: "Now let's visit your dopamine garden. Tap the <strong>Nourish 🍵</strong> tab in the navigation:",
            actionText: "👉 Open Nourish & Dopamine 🍵",
            actionHandler: openDopamineTab
          });

          if (dopTab) dopTab.addEventListener('click', openDopamineTab, { once: true });
        }
      },

      // STEP 5: Grace Streaks & Routines
      {
        stepNum: 5,
        title: "Grace Streaks (Zero Guilt)",
        init: async () => {
          clearHighlight();
          showGuideCard();
          const rTab = getVisibleNavTab('routines');
          if (rTab) highlightTarget(rTab, '👉 6. Tap Rituals / Routines');

          let routinesOpened = false;
          const openRoutinesTab = async () => {
            if (routinesOpened) return;
            routinesOpened = true;
            if (window.ZenApp) window.ZenApp.switchTab('routines');
            clearHighlight();
            await wait(250);

            const streakCard = document.querySelector('.streak-banner-card') || document.querySelector('.zen-vitals-card');
            if (streakCard) highlightTarget(streakCard, '🌿 Grace Streaks');

            renderChatBubble({
              message: "Habits are living seeds, not punishments. If you miss a day, our <strong>Grace Days</strong> absorb the gap so your momentum flows uninterrupted.",
              actionText: "🎉 Complete Leo's Tour!",
              isComplete: true,
              actionHandler: () => {
                clearHighlight();
                renderChatBubble({
                  message: "🎉 <strong>Sanctuary Blessed!</strong> You now hold the calm keys to effortless ADHD momentum. Tap below to begin:",
                  actionText: "🌿 Enter Sanctuary",
                  isComplete: true,
                  actionHandler: () => {
                    Leo.exitTour();
                    if (window.ZenApp) window.ZenApp.switchTab('today');
                  }
                });
              }
            });
          };

          renderChatBubble({
            message: "Finally, let's explore gentle routines. Tap the <strong>Rituals 🌿</strong> tab in the navigation:",
            actionText: "👉 Open Rituals & Routines 🌿",
            actionHandler: openRoutinesTab
          });

          if (rTab) rTab.addEventListener('click', openRoutinesTab, { once: true });
        }
      }
    ]
  };

  // ========================================================
  // 6. PUBLIC TOUR CONTROLLER API
  // ========================================================
  Leo.startTour = function (fromBeginning = true) {
    if (fromBeginning) currentStepIndex = 0;
    isTourActive = true;
    document.body.classList.add('tutorial-active');

    let mask = document.getElementById('tutorial-mask-overlay');
    if (!mask) {
      mask = document.createElement('div');
      mask.id = 'tutorial-mask-overlay';
      mask.className = 'tutorial-mask-overlay';
      document.body.appendChild(mask);
    }
    mask.classList.add('active');

    renderHUD();

    document.addEventListener('click', handleTourClickGuard, true);

    this.runCurrentStep();
  };

  Leo.runCurrentStep = function () {
    if (currentStepIndex >= MASTER_STORY.steps.length) {
      this.exitTour();
      return;
    }
    const step = MASTER_STORY.steps[currentStepIndex];
    if (step && typeof step.init === 'function') {
      step.init();
    }
  };

  Leo.nextStep = function () {
    currentStepIndex++;
    if (currentStepIndex < MASTER_STORY.steps.length) {
      this.runCurrentStep();
    } else {
      this.exitTour();
    }
  };

  Leo.exitTour = function () {
    isTourActive = false;
    clearHighlight();
    removeModalGuideBanner();

    document.body.classList.remove('tutorial-active');

    const mask = document.getElementById('tutorial-mask-overlay');
    if (mask) mask.classList.remove('active');

    const card = document.getElementById('tutorial-guide-card');
    if (card) card.remove();

    const hud = document.getElementById('tutorial-hud-bar');
    if (hud) hud.remove();

    document.removeEventListener('click', handleTourClickGuard, true);
  };

  Leo.isTourRunning = function () {
    return isTourActive;
  };

  global.Leo = Leo;

  // Auto-bind help badge clicks
  document.addEventListener('click', (e) => {
    const badge = e.target.closest('[data-leo-help]');
    if (badge) {
      const key = badge.getAttribute('data-leo-help');
      if (global.showLeoHelp) global.showLeoHelp(key);
    }
  });

})(typeof window !== 'undefined' ? window : this);
