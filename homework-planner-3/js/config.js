/**
 * Homework Planner 3 (Wabi-Sabi Sanctuary) — Edition Configuration
 * Persona: Leo | Shop: Zen Sanctuary Studio (zensanctuary-studio.github.io)
 * Tabs: tonight, timeline, rituals, peace, settings
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HPConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    edition: 3,
    storageKey: 'homework_planner_3_data_v1',
    brand: {
      name: 'Zen Sanctuary Studio',
      org: 'zensanctuary-studio',
      tagline: 'Mindful Evening Homework OS',
      url: 'https://zensanctuary-studio.github.io/homework-planner-3/'
    },
    persona: {
      name: 'Leo',
      initial: 'L',
      tag: 'Sanctuary Guide',
      note: 'One mindful step tonight. The rest can wait.'
    },
    defaultTab: 'tonight',
    tabs: ['tonight', 'timeline', 'rituals', 'peace', 'settings'],
    themes: [
      { id: 'wabi-sabi', label: 'Wabi-Sabi Terracotta' },
      { id: 'sand-linen', label: 'Warm Sand & Linen' },
      { id: 'forest-moss', label: 'Forest Moss' },
      { id: 'espresso-dark', label: 'Espresso Night' },
      { id: 'high-contrast', label: 'High Contrast' }
    ],
    defaultCapacity: 90,
    tour: [
      {
        tabId: 'tonight', section: '📍 SECTION: Tonight • Evening Hearth', targetId: 'hero-next',
        title: "Welcome to your Homework Sanctuary. I'm Leo.",
        message: 'Evening overwhelm ends here. Instead of scattering your energy across ten tasks, the Hearth anchors only your single most urgent homework item.',
        hint: 'This stone updates gently as dates and your progress evolve.'
      },
      {
        tabId: 'tonight', section: '📍 SECTION: Tonight • Quick Capture', targetId: 'qa-title',
        title: 'Mindful Homework Capture',
        message: 'Jot down homework in seconds right after school. A short title is plenty — your sanctuary will assign kind defaults so nothing escapes memory.',
        hint: 'Type at least 3 letters to try it now.',
        gate: { type: 'dom', event: 'input', selector: '#qa-title', test: 'value-min-3' }
      },
      {
        tabId: 'tonight', section: '📍 SECTION: Tonight • Quick Capture', targetId: 'btn-qa-add',
        title: 'Anchor into your Sanctuary',
        message: 'Select when it is due and roughly how long it might take, then tap Anchor it to place it safely in tonight’s flow.',
        hint: 'Tap Anchor it to proceed.',
        gate: { type: 'app', name: 'assignment-added' }
      },
      {
        tabId: 'tonight', section: '📍 SECTION: Tonight • Backpack Check', targetId: 'backpack-bar',
        title: 'Backpack Zen Check',
        message: 'Finishing a sheet at night only helps if it makes it to school. Completed homework rests here until physically placed in your bag.',
        hint: 'Tap "Packed in Bag" once zipped.'
      },
      {
        tabId: 'tonight', section: '📍 SECTION: Header • Shield Mode', targetId: 'btn-toggle-fog',
        title: 'Low-Spoons Shield (Fog Mode)',
        message: 'When energy is low or burnout looms, tap Shield. It gently dims queues, stats, and capture bars, leaving only your single active win.',
        hint: 'Toggle Shield on and off to feel the quiet.',
        gate: { type: 'app', name: 'fog-toggled' }
      },
      {
        tabId: 'timeline', section: '📍 SECTION: Timeline • River of Work', targetId: 'timeline-river',
        title: '14-Day River of Work',
        message: 'See your next two weeks as an organic flow of homework stones, arranged by calculated Start-By dates rather than stressful panic due dates.',
        hint: 'Evenings are shaded from Light to Heavy based on your energy budget.'
      },
      {
        tabId: 'rituals', section: '📍 SECTION: Rituals • Repeating Study', targetId: 'routine-card',
        title: 'Weekly Homework Rituals',
        message: 'Repeating weekly sheets (like Friday vocab or Monday math) can be saved once as peaceful rituals and summoned each week in one click.',
        hint: 'Save rituals once; load your week anytime without duplicates.'
      },
      {
        tabId: 'peace', section: '📍 SECTION: Peace • Catch-Up Chamber', targetId: 'rescue-list',
        title: 'Guilt-Free Rest & Catch-Up Chamber',
        message: 'Slipped behind? You are human. Pick one restorative action: Do it tonight, Ask teacher for an extension, or Release it with a late pass.',
        hint: 'No red alarms or flashing warnings. Just peaceful progress.'
      },
      {
        tabId: 'settings', section: '📍 SECTION: Settings • Daily Capacity', targetId: 'set-capacity',
        title: 'Honest Evening Energy Budget',
        message: 'Set how many realistic minutes of homework you can comfortably give each night. Your Start-By dates will calibrate automatically.',
        hint: 'Tap Done to return to your sanctuary and begin.'
      }
    ]
  };
});
