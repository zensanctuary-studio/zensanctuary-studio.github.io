/**
 * End of Life Planner 3 — Edition 3 (Zen Sanctuary Studio / Leo) Configuration
 * Brand DNA: Warm Espresso Canvas (#161311), Earthy Sand Surfaces (#211c18), Warm Amber (#fbbf24 / #d97706).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EOLConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    edition: 3,
    brand: 'Zen Sanctuary Studio',
    toolName: 'End of Life Planner 3',
    defaultTab: 'overview',
    tabs: ['overview', 'contacts', 'vault', 'digital', 'wishes', 'settings'],
    persona: {
      name: 'Leo',
      initial: 'L',
      role: 'Mindful Legacy Companion'
    },
    themes: [
      { id: 'wabi-sabi', label: 'Wabi-Sabi Espresso', swatch: '#fbbf24' },
      { id: 'terracotta-hearth', label: 'Terracotta Hearth', swatch: '#e07a5f' },
      { id: 'moss-stone', label: 'Moss & Stone', swatch: '#81b29a' },
      { id: 'warm-parchment', label: 'Warm Parchment', swatch: '#b45309' }
    ],
    tour: [
      {
        tabId: 'overview',
        targetId: 'hero-readiness',
        section: 'SECTION: Sanctuary · Radial Legacy Ring',
        title: 'Breathe Easy — I am Leo',
        message: 'Preparing your legacy does not need to feel cold or rushed. Your Radial Legacy Ring gently fills as you place one small stepping stone at a time.',
        hint: 'Tap Next to see your mindful quick-capture stone.'
      },
      {
        tabId: 'overview',
        targetId: 'quick-capture-card',
        section: 'SECTION: Sanctuary · Mindful Quick Note',
        title: 'Place One Stone Whenever It Comes to Mind',
        message: 'Thought of a document folder, trusted contact, or bank account? Drop it gently here in seconds. Try typing a short note or tap Next.',
        hint: 'Action gate: Type at least 3 letters in the quick input (or tap Next).',
        gate: { type: 'dom', event: 'input', selector: '#qa-title', test: 'value-min-3' }
      },
      {
        tabId: 'overview',
        targetId: 'btn-toggle-fog',
        section: 'SECTION: Header · Fog Mode Sanctuary',
        title: 'Soften the Screen with Fog Mode',
        message: 'If your energy is low, tap Fog Mode to quiet every extra card — keeping only your Radial Ring and a single gentle next step.',
        hint: 'Action gate: Tap Fog Mode to experience low-stimulation calm (or tap Next).',
        gate: { type: 'app', name: 'fog-toggled' }
      },
      {
        tabId: 'contacts',
        targetId: 'contacts-firstcall-card',
        section: 'SECTION: Kinship · Trusted Circle',
        title: 'Your Circle of Care',
        message: 'Gather the people your family should call first — executor, loved ones, legal guide, physician, and the caretakers for any pets or dependents.',
        hint: 'Tap Next to visit your Legal & Estate Vault.'
      },
      {
        tabId: 'vault',
        targetId: 'vault-docs-card',
        section: 'SECTION: Vault · Essential Paper Map',
        title: 'Guide Loved Ones to Real Signed Papers',
        message: 'Tap any status pill to move a document between Missing, Drafting, Located, and Signed & Stored. Remember: this maps your real legal papers.',
        hint: 'Action gate: Tap a document status badge to cycle it (or tap Next).',
        gate: { type: 'app', name: 'doc-toggled' }
      },
      {
        tabId: 'vault',
        targetId: 'vault-estate-card',
        section: 'SECTION: Vault · Accounts & Policies',
        title: 'Peaceful Financial Clarity (Last-4 Only)',
        message: 'Record checking, retirement, life insurance, and mortgages using only institution names and last-4 digits — computed in exact integer cents.',
        hint: 'Tap Next to see your Digital Keys.'
      },
      {
        tabId: 'digital',
        targetId: 'digital-manager-card',
        section: 'SECTION: Keys · Password Vault Pointer',
        title: 'Safe Digital Passing — Zero Raw Passwords',
        message: 'Note where your password manager recovery kit rests and record clear wishes to Transfer, Memorialize, Archive, or Delete each online account.',
        hint: 'Tap Next to explore Final Wishes & Letters.'
      },
      {
        tabId: 'wishes',
        targetId: 'executor-checklist-card',
        section: 'SECTION: Legacy · Gentle Executor Path',
        title: 'Kindness for Your Executor',
        message: 'Beside your memorial wishes and personal letters sits a calm 3-phase executor checklist (24 Hours, First Week, First Month) so loved ones never feel lost.',
        hint: 'Action gate: Check off any step in the executor path (or tap Next).',
        gate: { type: 'app', name: 'checklist-toggled' }
      },
      {
        tabId: 'settings',
        targetId: 'packet-export-card',
        section: 'SECTION: Packet · Offline Sanctuary & Print',
        title: 'Your Private Refuge — Printable Anytime',
        message: 'Nothing ever leaves this device. Print a clean Executor Brief or save a JSON backup anytime. Finishing this tour clears sample items into a fresh Clean Slate.',
        hint: 'Tap Done to step into your quiet Wabi-Sabi Sanctuary.'
      }
    ]
  };
});
