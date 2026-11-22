/**
 * Invoice Planner 3 — Edition 3 (Zen Sanctuary Studio / Leo) Configuration.
 * Persona: Leo (L), Wabi-Sabi Sanctuary (#161311), 6 symmetric Zen Island tabs, and 8-step interactive tour.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.IPConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    edition: 3,
    storageKey: 'invoice_planner_3_data_v1',
    persona: { name: 'Leo', initial: 'L' },
    themes: [
      { id: 'wabi-sabi', label: 'Wabi-Sabi Linen' },
      { id: 'terracotta-dawn', label: 'Terracotta Dawn' },
      { id: 'moss-garden', label: 'Moss Garden' },
      { id: 'espresso-zen', label: 'Espresso Zen' }
    ],
    defaultTab: 'hearth',
    tabs: ['hearth', 'scrolls', 'harvest', 'letters', 'seasons', 'settings'],
    tour: [
      {
        tabId: 'hearth',
        section: '📍 SECTION: Artisan Hearth • Radial Harvest Dial',
        targetId: 'hero-pulse',
        title: "Peace, I'm Leo. Welcome to your Artisan Billing Sanctuary.",
        message: 'Asking to be paid for your craft is an honorable exchange of energy. My Radial Harvest Dial shows your Awaiting Offerings, Unbilled Craft Stones, and Grounded Owner Abundance in one peaceful space.',
        hint: '100% private and grounded on your device. Zero monthly subscriptions.'
      },
      {
        tabId: 'hearth',
        section: '📍 SECTION: Artisan Hearth • 5-Second Craft Note',
        targetId: 'qa-work-title',
        title: 'Place an unbilled craft stone in 5 seconds',
        message: 'When you complete a consultation, sketch, or revision, note it gently here so your time is always honored.',
        hint: 'Try it now: type at least 3 letters into the deliverable box.',
        gate: { type: 'dom', event: 'input', selector: '#qa-work-title', test: 'value-min-3' }
      },
      {
        tabId: 'hearth',
        section: '📍 SECTION: Artisan Hearth • Anchor Craft Stone',
        targetId: 'btn-qa-work',
        title: 'Anchor your craft in the Unbilled Bowl',
        message: 'Choose a preset stone or enter an amount, then tap Anchor Craft Work. You can shape any stone into a formal client invoice scroll in one tap.',
        hint: 'Tap Anchor Craft Work (or Next) to continue.',
        gate: { type: 'app', name: 'work-logged' }
      },
      {
        tabId: 'hearth',
        section: '📍 SECTION: Header • Stillness Shield (Fog Mode)',
        targetId: 'btn-toggle-fog',
        title: 'Feeling sensory fatigue? Raise the Stillness Shield.',
        message: 'Stillness Shield folds away secondary lists and timelines — leaving only your Radial Harvest Dial and single Next Mindful Exchange.',
        hint: 'Try toggling the Stillness Shield now.',
        gate: { type: 'app', name: 'fog-toggled' }
      },
      {
        tabId: 'scrolls',
        section: '📍 SECTION: Invoice Scrolls • Printable Client Scrolls',
        targetId: 'invoices-card',
        title: 'Artisan Invoice Scrolls with Friday Early Shift',
        message: 'Draft, send, and honor client invoices with integer-cent accuracy. When Net-14 or Net-30 falls on a weekend, I gently shift the date to Friday early.',
        hint: 'Tap Preview on any scroll to open a print-ready client summary.'
      },
      {
        tabId: 'harvest',
        section: '📍 SECTION: Harvest Pour • 4-Vessel Tax & Profit Ritual',
        targetId: 'payout-card',
        title: 'The 4-Vessel Harvest Pour (Tax & Profit Shield)',
        message: 'When a client payment arrives, pour it calmly across 4 clay vessels: Tax Shield Vessel (25%), Studio Tools (15%), Quiet Season Buffer (10%), and Present Owner Harvest (50%).',
        hint: 'Tap Pour Harvest Split to experience a 1-tap payout allocation.',
        gate: { type: 'app', name: 'payout-applied' }
      },
      {
        tabId: 'letters',
        section: '📍 SECTION: Kind Letters • Shame-Free Follow-Up Notes',
        targetId: 'followup-card',
        title: 'Kind Follow-Up Letters Without Anxiety',
        message: 'Send a warm, dignified reminder for any due or past-due invoice. Choose Warm Reminder, Gentle Overdue Note, or Clear Final Notice — pre-filled and ready to copy.',
        hint: 'Copy any kind letter to your clipboard in one tap.'
      },
      {
        tabId: 'seasons',
        section: '📍 SECTION: Seasonal Retainers • Recurring Clients & Sync',
        targetId: 'retainers-card',
        title: 'Seasonal Retainers & Anti-Double-Counting Sync',
        message: 'Nurture recurring client relationships and ground your business checking balance without double-counting. When we finish this tour, sample stones clear automatically to a fresh clean slate!',
        hint: 'Tap Done to begin on your clean sanctuary slate.'
      }
    ]
  };
});
