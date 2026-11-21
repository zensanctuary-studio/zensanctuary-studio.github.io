/**
 * ADHD Finance Planner 3 — Edition 3 (Zen Sanctuary Studio / Leo) Configuration.
 * Persona: Leo (L), Wabi-Sabi Sanctuary (#161311), 6 symmetric Zen Island tabs, and 8-step interactive tour.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FPConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    edition: 3,
    storageKey: 'adhd_finance_planner_3_data_v1',
    persona: { name: 'Leo', initial: 'L' },
    themes: [
      { id: 'wabi-sabi', label: 'Wabi-Sabi Linen' },
      { id: 'terracotta-dawn', label: 'Terracotta Dawn' },
      { id: 'moss-garden', label: 'Moss Garden' },
      { id: 'espresso-zen', label: 'Espresso Zen' }
    ],
    defaultTab: 'hearth',
    tabs: ['hearth', 'flow', 'weeds', 'vessels', 'horizon', 'settings'],
    tour: [
      {
        tabId: 'hearth',
        section: '📍 SECTION: Abundance Hearth • Radial Abundance Dial',
        targetId: 'hero-pulse',
        title: "Peace, I'm Leo. Welcome to your Mindful Money Sanctuary.",
        message: 'Money anxiety fades when we separate what is already promised from what is free to flow. My Radial Abundance Dial protects your shelter, utilities, and clay vessels first — revealing your Safe Mindful Flow for today.',
        hint: '100% private and grounded on your device. No bank passwords ever.'
      },
      {
        tabId: 'hearth',
        section: '📍 SECTION: Abundance Hearth • Mindful Exchange Log',
        targetId: 'qa-spend-title',
        title: 'Acknowledge a daily exchange in 5 seconds',
        message: 'Type a gentle note for an everyday purchase — like "Warm Tea" or "Market Greens".',
        hint: 'Try it now: type at least 3 letters into the box.',
        gate: { type: 'dom', event: 'input', selector: '#qa-spend-title', test: 'value-min-3' }
      },
      {
        tabId: 'hearth',
        section: '📍 SECTION: Abundance Hearth • Anchor Exchange',
        targetId: 'btn-qa-spend',
        title: 'Anchor your exchange without shame',
        message: 'Choose a preset stone or enter an amount, then tap Anchor Exchange. Every calculation uses exact integer cents.',
        hint: 'Tap Anchor Exchange (or Next) to continue.',
        gate: { type: 'app', name: 'spend-logged' }
      },
      {
        tabId: 'hearth',
        section: '📍 SECTION: Header • Stillness Shield (Fog Mode)',
        targetId: 'btn-toggle-fog',
        title: 'Feeling sensory overload? Raise the Stillness Shield.',
        message: 'Stillness Shield gently folds away the 14-day river, obligations, and logs — leaving only your Abundance Dial and single Next Mindful Step.',
        hint: 'Try toggling the Stillness Shield now.',
        gate: { type: 'app', name: 'fog-toggled' }
      },
      {
        tabId: 'flow',
        section: '📍 SECTION: Payday Ritual • 4-Vessel Pour',
        targetId: 'autopilot-card',
        title: 'The Mindful Payday Tea Ritual (4-Vessel Pour)',
        message: 'When income arrives, pour it into 4 clay vessels in one tap: Shelter & Bills, Clay Sinking Vessels, Future Peace Buffer, and Present Joy Flow.',
        hint: 'Tap Pour Paycheck Ritual to experience a 1-tap allocation.',
        gate: { type: 'app', name: 'autopilot-applied' }
      },
      {
        tabId: 'weeds',
        section: '📍 SECTION: Garden Weeds • Subscription Sanctuary',
        targetId: 'radar-trophy-card',
        title: 'Pulling the Weeds: Stop the ADHD Tax',
        message: 'Forgotten free trials and unused memberships are weeds drawing water from your garden. Pulling a weed immediately adds its yearly cost to your Reclaimed Energy Vessel.',
        hint: 'Every cancelled drain is celebrated, never judged.'
      },
      {
        tabId: 'vessels',
        section: '📍 SECTION: Clay Vessels • Sinking Cushions',
        targetId: 'buckets-card',
        title: 'Clay Vessels for Seasonal & True Expenses',
        message: 'Car repairs, annual renewals, and gifts become peaceful when filled drop by drop each pay cycle.',
        hint: 'Tap +$25 on any vessel to pour in extra cushion.'
      },
      {
        tabId: 'horizon',
        section: '📍 SECTION: Peace Horizon • Net Worth & Runway',
        targetId: 'wealth-summary-card',
        title: 'Your Grounded Horizon & Days of Peace',
        message: 'See your checking, savings buffers, clay vessels, and debts in one quiet space — plus how many days of bare-bones peace you hold.',
        hint: 'When we finish this tour, sample stones clear automatically to a fresh clean slate!'
      }
    ]
  };
});
