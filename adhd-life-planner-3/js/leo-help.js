/**
 * ADHD Life Planner 3 (Edition 3) - Leo's Mindful Contextual Help & Guidance
 * Warm, restorative, guilt-free tactical wisdom for each sanctuary screen.
 */

(function (global) {
  'use strict';

  const LeoHelp = {
    'anchor.focus': {
      title: 'Daily Focus Anchor (The Single Win Rule)',
      core: 'One single win anchors the entire day. Complete this one win and your day is a total, indisputable success.',
      action: 'Write your single primary intention each morning. When finished, check the box and breathe.',
      brain: 'ADHD brains freeze when confronted with 30 competing tasks. Choosing 1 focus anchor dissolves cognitive resistance.',
      rule: 'If you accomplish nothing else today except this single anchor, your day is a complete victory. Everything else is a bonus gift.'
    },
    'energy.dial': {
      title: 'Dynamic Battery Dial (Capacity Matching)',
      core: 'A 3-mode battery selector: Low Spoons, Steady Flow, and Hyper-Focus.',
      action: 'Select the level that matches your biological battery today. The sanctuary gently adapts your task load.',
      brain: 'ADHD energy is cyclical, not flat. Forcing high willpower on low-spoons days causes burnout. Honoring capacity restores natural flow.',
      rule: 'Selecting Low Spoons is an act of wisdom, not weakness. Consistency comes from honoring your real energy.'
    },
    'shield.burnout': {
      title: 'Low-Spoons Sanctuary (Fog Mode Shield)',
      core: 'Emergency sensory and demand reduction. Softly dims all non-essential chores, showing only survival basics.',
      action: 'Tap the 🛡️ Shield button in the top bar whenever you feel overstimulated, exhausted, or in brain fog.',
      brain: 'Visual clutter amplifies executive overwhelm. The sanctuary dims 80% of interface distractions so your nervous system can reset.',
      rule: 'All your routines, notes, and upcoming projects remain safely preserved in local storage while the shield is active.'
    },
    'dechunk.paralysis': {
      title: '1-Click Task De-chunker (Paralysis Breaker)',
      core: 'Gentle breakdown engine that splits overwhelming, monolithic chores into 3-minute micro-actions.',
      action: 'Tap the ✂️ scissors icon on any task. The system automatically creates painless 3-minute steps.',
      brain: 'Executive dysfunction causes task paralysis because the brain cannot visualize the initial sequencing. Micro-steps bypass the initiation wall.',
      rule: 'You do not need to finish all micro-steps. Just beginning the first 2-minute step unlocks momentum naturally.'
    },
    'dopamine.menu': {
      title: '4-Quadrant Dopamine Sanctuary',
      core: 'A restaurant menu for healthy stimulation: Appetizers (2–5 min), Entrees (deep flow), Sides (calming sensory cues), Desserts (guilt-free rest).',
      action: 'When feeling under-stimulated or drifting into doom-scrolling, visit the Dopamine menu or tap [Surprise Me] for a mindful reset.',
      brain: 'ADHD seeks stimulation instinctively. An intentional dopamine menu prevents rabbit holes and restores intrinsic drive.',
      rule: 'Desserts are planned rest rituals, not prizes you have to suffer to earn. Rest is essential maintenance.'
    },
    'streaks.grace': {
      title: 'Guilt-Free Grace Streaks (Zero Shame)',
      core: 'A gentle consistency tracker equipped with automatic Grace Days that absorb missed days without resetting your score to zero.',
      action: 'Check in with your daily anchor or routine. If life gets chaotic and you miss 1–2 days, your grace buffer protects your momentum.',
      brain: 'Shame spirals cause ADHDers to abandon apps after a single missed day. Grace days protect emotional safety and reward return.',
      rule: 'Your total active days never reset. Consistency is defined by your return, not rigid perfection.'
    },
    'braindump.memory': {
      title: 'Mind Unburdening (Brain Dump)',
      core: 'A zero-friction scratchpad for releasing racing thoughts, worries, and sudden reminders.',
      action: 'Jot down thoughts as they arrive. Auto-saves continuously into local storage.',
      brain: 'ADHD working memory has limited RAM. Holding open thoughts causes mental fatigue; offloading them frees focus immediately.',
      rule: 'Do not organize this dump while writing. Release thoughts first; sort them later when your energy is higher.'
    },
    'privacy.offline': {
      title: '100% Client-Side Privacy Guarantee',
      core: 'Zero cloud tracking, zero external servers, zero logins or monthly fees.',
      action: 'Your planner works offline anywhere. Use the Config tab to export JSON backups anytime.',
      brain: 'No subscription anxiety, no passwords to remember. Your health and productivity data remains strictly on your device.',
      rule: 'You have complete lifetime ownership. Export a JSON backup before clearing browser cache or switching phones.'
    }
  };

  global.LeoHelp = LeoHelp;

  global.showLeoHelp = function (key) {
    const data = LeoHelp[key];
    if (!data) return;

    let modal = document.getElementById('leo-help-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'leo-help-modal';
      modal.className = 'leo-help-dialog-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="leo-help-card">
        <div class="leo-help-title">
          <span>🌿</span>
          <span>${data.title}</span>
        </div>
        <div class="leo-help-body">
          <p style="margin-bottom:8px;"><strong>Core Wisdom:</strong> ${data.core}</p>
          <p style="margin-bottom:8px;"><strong>ADHD Science:</strong> ${data.brain}</p>
          <p style="margin-bottom:8px;"><strong>Mindful Action:</strong> ${data.action}</p>
          <p style="color:var(--accent-gold);font-weight:600;"><strong>Golden Rule:</strong> ${data.rule}</p>
        </div>
        <button type="button" class="leo-help-close" id="btn-close-leo-help">Understood (Close)</button>
      </div>
    `;

    modal.classList.add('active');

    const closeBtn = modal.querySelector('#btn-close-leo-help');
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.remove('active');
    }
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('active');
    };
  };

})(typeof window !== 'undefined' ? window : this);
