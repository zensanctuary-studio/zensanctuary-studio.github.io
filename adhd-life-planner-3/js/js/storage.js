/**
 * ADHD Life Planner 3 — Storage & State Management (Edition 3: Wabi-Sabi Sanctuary)
 * Storage Key: adhd_life_planner_3_state_v1
 * Default Theme: sage-harmony (Shop 3 Brand Identity)
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LifeStorage = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'adhd_life_planner_3_state_v1';
  const CURRENT_SCHEMA = 1;

  function getDefaultState() {
    const today = new Date().toISOString().split('T')[0];
    return {
      schema: CURRENT_SCHEMA,
      profile: {
        name: 'Friend',
        theme: 'sage-harmony',
        soundEnabled: true,
        energyLevel: 'normal', // 'low' | 'normal' | 'high'
        fogMode: false,
        lastOpenedDate: today
      },
      anchor: {
        text: 'Drink a tall glass of warm water and stretch gently for 2 minutes',
        completed: false,
        date: today
      },
      vitals: {
        waterGlasses: 3,
        targetWater: 8,
        medsTaken: false,
        mood: 'calm'
      },
      tasks: [
        {
          id: 'task-1',
          title: 'Reply to 1 urgent message with a quick 2-sentence note',
          energy: 'low',
          completed: false,
          isEssential: true,
          subtasks: []
        },
        {
          id: 'task-2',
          title: 'Clear one single surface on the desk',
          energy: 'normal',
          completed: false,
          isEssential: false,
          subtasks: []
        },
        {
          id: 'task-3',
          title: 'Mindful sorting of today\'s physical notes into folder',
          energy: 'high',
          completed: false,
          isEssential: false,
          subtasks: []
        }
      ],
      dopamineMenu: {
        appetizers: [
          { id: 'dop-1', title: 'Drink a warm cup of herbal tea or ice water', duration: '2 min', icon: 'glass' },
          { id: 'dop-2', title: 'Step outside and feel sunlight on your face', duration: '3 min', icon: 'sun' },
          { id: 'dop-3', title: 'Play 1 restorative acoustic track', duration: '4 min', icon: 'music' },
          { id: 'dop-4', title: 'Slow deep belly breath and neck stretch', duration: '2 min', icon: 'heart' }
        ],
        entrees: [
          { id: 'dop-5', title: '25-minute quiet deep focus flow', duration: '25 min', icon: 'zap' },
          { id: 'dop-6', title: 'Clear and wipe down the kitchen counter', duration: '20 min', icon: 'sparkles' },
          { id: 'dop-7', title: 'Batch finish all small pending phone notifications', duration: '15 min', icon: 'check-circle' }
        ],
        sides: [
          { id: 'dop-8', title: 'Play soft rain or warm fireplace audio', duration: 'Passive', icon: 'headphones' },
          { id: 'dop-9', title: 'Light a calming cedarwood or sandalwood candle', duration: 'Passive', icon: 'flame' },
          { id: 'dop-10', title: 'Quiet body-doubling with study-with-me stream', duration: 'Passive', icon: 'users' }
        ],
        desserts: [
          { id: 'dop-11', title: 'Play favorite cozy exploration game for 30 minutes', duration: '30 min', icon: 'award' },
          { id: 'dop-12', title: 'Watch 1 episode of favorite documentary with tea', duration: '25 min', icon: 'tv' },
          { id: 'dop-13', title: 'Guilt-free 20-minute restorative nap', duration: '20 min', icon: 'moon' }
        ]
      },
      brainDump: '• Remember to buy oat milk & tea\n• Look up comfortable floor cushion\n• Idea for peaceful weekend walk in nature',
      routines: [
        { id: 'rt-1', slot: 'morning', title: 'Hydrate before checking notifications', completed: false, icon: 'sun' },
        { id: 'rt-2', slot: 'morning', title: 'Take morning fuel / vitamins / meds', completed: false, icon: 'heart' },
        { id: 'rt-3', slot: 'morning', title: 'Set 1 single daily focus anchor', completed: false, icon: 'target' },
        { id: 'rt-4', slot: 'afternoon', title: 'Midday stretch & short mindful walk', completed: false, icon: 'coffee' },
        { id: 'rt-5', slot: 'afternoon', title: 'Afternoon water glass & deep breath', completed: false, icon: 'droplet' },
        { id: 'rt-6', slot: 'evening', title: 'Work shutdown: Close all browser tabs', completed: false, icon: 'power' },
        { id: 'rt-7', slot: 'evening', title: 'Empty working memory into brain dump', completed: false, icon: 'edit-3' },
        { id: 'rt-8', slot: 'evening', title: 'Warm dim lighting & restful quiet', completed: false, icon: 'moon' }
      ],
      streaks: {
        currentStreak: 1,
        graceDaysAvailable: 2,
        totalActiveDays: 1,
        lastActiveDate: today
      }
    };
  }

  function loadState() {
    try {
      if (typeof localStorage === 'undefined') {
        return getDefaultState();
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const fresh = getDefaultState();
        saveState(fresh);
        return fresh;
      }
      const parsed = JSON.parse(raw);
      const migrated = migrateSchema(parsed);
      return checkNewDayRollover(migrated);
    } catch (err) {
      console.warn('[LifeStorage] Failed to load state, falling back to defaults:', err);
      return getDefaultState();
    }
  }

  function saveState(state) {
    try {
      if (typeof localStorage === 'undefined') return true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      console.error('[LifeStorage] Failed to save state to localStorage:', err);
      return false;
    }
  }

  function checkNewDayRollover(state) {
    if (!state || !state.anchor) return state;
    const today = new Date().toISOString().split('T')[0];

    if (state.anchor.date !== today) {
      state.anchor.date = today;
      state.anchor.completed = false;
      state.vitals.waterGlasses = 0;
      state.vitals.medsTaken = false;

      if (Array.isArray(state.routines)) {
        state.routines.forEach(r => { r.completed = false; });
      }
      if (state.profile) {
        state.profile.lastOpenedDate = today;
      }
      saveState(state);
    }
    return state;
  }

  function migrateSchema(state) {
    if (!state || typeof state !== 'object') {
      return getDefaultState();
    }
    const defaults = getDefaultState();

    if (!state.schema) state.schema = CURRENT_SCHEMA;
    if (!state.profile) state.profile = defaults.profile;
    if (!state.anchor) state.anchor = defaults.anchor;
    if (!state.vitals) state.vitals = defaults.vitals;
    if (!Array.isArray(state.tasks)) state.tasks = defaults.tasks;
    if (!state.dopamineMenu) state.dopamineMenu = defaults.dopamineMenu;
    if (typeof state.brainDump !== 'string') state.brainDump = defaults.brainDump;
    if (!Array.isArray(state.routines)) state.routines = defaults.routines;
    if (!state.streaks) state.streaks = defaults.streaks;

    return state;
  }

  function exportBackupJSON(state) {
    const data = state || loadState();
    return JSON.stringify(data, null, 2);
  }

  function importBackupJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      const migrated = migrateSchema(parsed);
      saveState(migrated);
      return { success: true, state: migrated };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function resetAllData() {
    const fresh = getDefaultState();
    saveState(fresh);
    return fresh;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    getDefaultState: getDefaultState,
    loadState: loadState,
    saveState: saveState,
    exportBackupJSON: exportBackupJSON,
    importBackupJSON: importBackupJSON,
    resetAllData: resetAllData,
    migrateSchema: migrateSchema
  };
});
