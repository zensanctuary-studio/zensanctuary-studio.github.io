/**
 * Assignment Tracker — Edition 3 (Wabi-Sabi Sanctuary / Leo) configuration.
 * Shares pure mathematical engine and state persistence with Editions 1 & 2.
 * Unique layout: Curved Floating Zen Island Nav, Radial Focus Dial, Teahouse Focus Timer,
 * and Grace Rescue Deck.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ATConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    edition: 3,
    storageKey: 'assignment_tracker_3_data_v1',
    persona: { name: 'Leo', initial: 'L', glyph: '🌿' },
    themes: [
      { id: 'terracotta-sun', label: 'Terracotta Sun' },
      { id: 'sand-linen', label: 'Sand & Linen' },
      { id: 'sage-harmony', label: 'Sage Harmony' },
      { id: 'espresso-dark', label: 'Espresso Dark' }
    ],
    defaultTab: 'today',
    tabs: ['today', 'radar', 'teahouse', 'courses', 'rescue', 'settings'],
    tour: [
      {
        tabId: 'today', section: 'Sanctuary · Mindful Horizon', targetId: 'radial-hero-card',
        title: "I'm Leo. Welcome to your sanctuary.",
        message: 'No overwhelming countdowns or panic timers. We focus on one single assignment at a gentle, sustainable pace.',
        hint: 'The radial ring reflects your daily mindful flow.'
      },
      {
        tabId: 'today', section: 'Sanctuary · Quick Capture', targetId: 'qa-title',
        title: 'Offload your assignment without friction',
        message: 'Type the assignment title right here. A quick name is all you need—gentle presets handle the initial estimate.',
        hint: 'Type a name to continue.',
        gate: { type: 'dom', event: 'input', selector: '#qa-title', test: 'value-min-3' }
      },
      {
        tabId: 'today', section: 'Sanctuary · Quick Capture', targetId: 'btn-qa-add',
        title: 'Plant the intention',
        message: 'Select a gentle due date and time estimate, then tap Plant Intention.',
        hint: 'Tap Plant Intention.',
        gate: { type: 'app', name: 'assignment-added' }
      },
      {
        tabId: 'today', section: 'Sanctuary · Start-By Radar', targetId: 'hero-next',
        title: 'Start-By eliminates procrastination shame',
        message: 'Our engine computes your true Start-By date backwards from capacity and past pace. You always know when to begin quietly.',
        hint: 'Start-By protects your evenings and weekends.'
      },
      {
        tabId: 'today', section: 'Sanctuary · Fog Shield', targetId: 'btn-burnout-shield',
        title: 'Low-Spoons Fog Shield',
        message: 'When energy is low or burnout sets in, activate the Fog Shield. It mutes secondary tasks and keeps your visual field serene.',
        hint: 'Toggle the shield or tap Next.',
        gate: { type: 'app', name: 'fog-toggled' }
      },
      {
        tabId: 'radar', section: 'Radar · Mindful Kanban', targetId: 'radar-deck',
        title: 'Mindful visual progression',
        message: 'Your assignments rest in gentle organic stone lanes: Not Started, In Flow, and Completed.',
        hint: 'Drag or tap cards to advance their state with zero guilt.'
      },
      {
        tabId: 'teahouse', section: 'Teahouse · Gentle Sprints', targetId: 'teahouse-card',
        title: 'The Teahouse Focus Timer',
        message: 'Instead of harsh buzzer alarms, choose a 20 or 35-minute tea brewing sprint. Soft singing bowl chimes mark your pauses.',
        hint: 'Tap any timer preset to test the chime.'
      },
      {
        tabId: 'rescue', section: 'Rescue · Grace & Forgiveness', targetId: 'rescue-deck',
        title: 'Zero-Shame Renegotiation Deck',
        message: 'If life happened and an assignment slipped, no alarms trigger. Extend with grace, prioritize immediately, or consciously let it go.',
        hint: 'You are always in control of your commitments.'
      },
      {
        tabId: 'settings', section: 'Sanctuary · Data Sovereignty', targetId: 'set-capacity',
        title: 'Calibrate your daily sustainable energy',
        message: 'Set your realistic daily capacity in minutes. 100% of your data stays on this device—never cloud servers.',
        hint: 'Adjust your minutes or leave as default.'
      },
      {
        tabId: 'today', section: 'Sanctuary · Ready to Begin', targetId: 'radial-hero-card',
        title: 'Your calm sanctuary is ready',
        message: 'Take a breath. Work on one gentle step today. Re-launch this guide anytime with the Guide button.',
        hint: 'Tap Done to enter your sanctuary.'
      }
    ]
  };
});
