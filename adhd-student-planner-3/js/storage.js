/**
 * ADHD Student Planner 3 — Data Persistence & Storage Engine (Edition 3: Wabi-Sabi Sanctuary)
 * Client-side localStorage engine with schema validation, anti-double-counting,
 * and JSON backup export/import.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StudentStorage = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'adhd_student_zen_state_v1';
  const CURRENT_SCHEMA = 1;

  function getTodayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function getDefaultData() {
    const today = getTodayISO();
    const parts = today.split('-');
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    function offsetDays(n) {
      const dt = new Date(Date.UTC(y, m, d + n));
      const oy = dt.getUTCFullYear();
      const om = String(dt.getUTCMonth() + 1).padStart(2, '0');
      const od = String(dt.getUTCDate()).padStart(2, '0');
      return `${oy}-${om}-${od}`;
    }

    return {
      schema: CURRENT_SCHEMA,
      profile: {
        name: 'Jordan',
        schoolName: 'Zen Sanctuary Academy of Design & Computation',
        currentTerm: 'Fall Semester',
        studyStreak: 5,
        lastActiveDate: today,
        graceTokens: 3,
        totalStudyMinutes: 320
      },
      settings: {
        fogMode: false,
        soundEnabled: true,
        hapticsEnabled: true,
        theme: 'sage-harmony', // Shop 3 Master Brand
        defaultSprintMinutes: 20
      },
      courses: [
        {
          id: 'course-1',
          code: 'CS 240',
          name: 'Data Structures & Algorithms',
          color: '#e07a5f',
          instructor: 'Dr. Katherine Lin',
          room: 'Turing Hall 301',
          scheduleDays: ['Mon', 'Wed', 'Fri'],
          scheduleTime: '11:00 AM - 12:15 PM',
          targetGrade: 92,
          weights: { assignments: 40, quizzes: 20, midterm: 20, final: 20 }
        },
        {
          id: 'course-2',
          code: 'MATH 215',
          name: 'Discrete Mathematics & Proofs',
          color: '#81b29a',
          instructor: 'Prof. Henrik Rossi',
          room: 'Newton Hall 112',
          scheduleDays: ['Tue', 'Thu'],
          scheduleTime: '9:30 - 11:00 AM',
          targetGrade: 88,
          weights: { assignments: 30, quizzes: 20, midterm: 25, final: 25 }
        },
        {
          id: 'course-3',
          code: 'DES 110',
          name: 'Sensory HCI & Neurodivergent Accessibility',
          color: '#f2cc8f',
          instructor: 'Dr. Sarah Sterling',
          room: 'Humanities 204',
          scheduleDays: ['Wed'],
          scheduleTime: '2:00 - 4:45 PM',
          targetGrade: 95,
          weights: { assignments: 50, quizzes: 20, midterm: 15, final: 15 }
        }
      ],
      assignments: [
        {
          id: 'asg-1',
          courseId: 'course-1',
          title: 'Graph Traversal & Dijkstra Implementation',
          category: 'assignments',
          dueDate: offsetDays(1),
          dueTime: '23:59',
          score: null,
          maxScore: 100,
          isEssential: true,
          completed: false,
          completedDate: null,
          dechunkedMilestones: [
            { id: 'm-101', text: 'Define adjacency list node class and priority queue', minutes: 15, done: true },
            { id: 'm-102', text: 'Implement shortest-path relaxation logic', minutes: 25, done: false },
            { id: 'm-103', text: 'Run edge-case test suites (cycles, disconnected nodes)', minutes: 20, done: false },
            { id: 'm-104', text: 'Submit GitHub commit and autograder link', minutes: 10, done: false }
          ]
        },
        {
          id: 'asg-2',
          courseId: 'course-2',
          title: 'Combinatorics & Induction Problem Set',
          category: 'assignments',
          dueDate: offsetDays(3),
          dueTime: '17:00',
          score: null,
          maxScore: 50,
          isEssential: false,
          completed: false,
          completedDate: null,
          dechunkedMilestones: [
            { id: 'm-201', text: 'Read lecture notes on strong induction', minutes: 15, done: false },
            { id: 'm-202', text: 'Draft base case and inductive step scratch proofs', minutes: 25, done: false },
            { id: 'm-203', text: 'Solve pigeonhole principle exercises #3-7', minutes: 30, done: false },
            { id: 'm-204', text: 'Typeset formal solutions in LaTeX and proofread', minutes: 20, done: false }
          ]
        },
        {
          id: 'asg-3',
          courseId: 'course-3',
          title: 'Sensory Low-Stimulation Audit Report',
          category: 'assignments',
          dueDate: offsetDays(5),
          dueTime: '23:59',
          score: null,
          maxScore: 100,
          isEssential: false,
          completed: false,
          completedDate: null,
          dechunkedMilestones: [
            { id: 'm-301', text: 'Select 2 digital tools for neurodivergent sensory audit', minutes: 15, done: false },
            { id: 'm-302', text: 'Document contrast ratios, visual noise, and animations', minutes: 30, done: false },
            { id: 'm-303', text: 'Synthesize cognitive spoon recommendations', minutes: 25, done: false },
            { id: 'm-304', text: 'Finalize PDF submission with UI teardown figures', minutes: 20, done: false }
          ]
        },
        {
          id: 'asg-4',
          courseId: 'course-1',
          title: 'Binary Search Tree Balancing Lab',
          category: 'quizzes',
          dueDate: offsetDays(-2),
          dueTime: '23:59',
          score: 95,
          maxScore: 100,
          isEssential: false,
          completed: true,
          completedDate: offsetDays(-2),
          dechunkedMilestones: [
            { id: 'm-401', text: 'Review AVL tree rotations', minutes: 20, done: true },
            { id: 'm-402', text: 'Implement left and right balance rotations', minutes: 30, done: true },
            { id: 'm-403', text: 'Verify invariants on randomized tree inputs', minutes: 20, done: true },
            { id: 'm-404', text: 'Submit verified code to autograder', minutes: 10, done: true }
          ]
        }
      ],
      exams: [
        {
          id: 'exam-1',
          courseId: 'course-1',
          title: 'CS 240 Midterm Examination',
          examDate: offsetDays(12),
          examTime: '11:00 AM',
          location: 'Turing Hall Auditorium',
          weight: 20,
          targetScore: 90,
          checklist: [
            { id: 'c-1', text: 'Review red-black tree rotation invariants', done: true },
            { id: 'c-2', text: 'Speed-drill BFS/DFS graph traversals on paper', done: false },
            { id: 'c-3', text: 'Complete Fall 2025 practice midterm', done: false }
          ]
        },
        {
          id: 'exam-2',
          courseId: 'course-2',
          title: 'MATH 215 Midterm Examination',
          examDate: offsetDays(19),
          examTime: '9:30 AM',
          location: 'Newton Hall 112',
          weight: 25,
          targetScore: 88,
          checklist: [
            { id: 'c-4', text: 'Review inductive hypothesis formulation', done: false },
            { id: 'c-5', text: 'Practice modular arithmetic congruence proofs', done: false }
          ]
        }
      ]
    };
  }

  function sanitize(data) {
    const defaults = getDefaultData();
    if (!data || typeof data !== 'object') return defaults;

    const clean = {
      schema: CURRENT_SCHEMA,
      profile: Object.assign({}, defaults.profile, data.profile || {}),
      settings: Object.assign({}, defaults.settings, data.settings || {}),
      courses: Array.isArray(data.courses) ? data.courses : defaults.courses,
      assignments: Array.isArray(data.assignments) ? data.assignments : defaults.assignments,
      exams: Array.isArray(data.exams) ? data.exams : defaults.exams
    };

    if (typeof clean.profile.studyStreak !== 'number' || isNaN(clean.profile.studyStreak) || !isFinite(clean.profile.studyStreak) || clean.profile.studyStreak < 0) {
      clean.profile.studyStreak = defaults.profile.studyStreak;
    }
    if (typeof clean.profile.graceTokens !== 'number' || isNaN(clean.profile.graceTokens) || !isFinite(clean.profile.graceTokens) || clean.profile.graceTokens < 0) {
      clean.profile.graceTokens = defaults.profile.graceTokens;
    }
    if (typeof clean.profile.totalStudyMinutes !== 'number' || isNaN(clean.profile.totalStudyMinutes) || !isFinite(clean.profile.totalStudyMinutes) || clean.profile.totalStudyMinutes < 0) {
      clean.profile.totalStudyMinutes = defaults.profile.totalStudyMinutes;
    }

    return clean;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = getDefaultData();
        save(initial);
        return initial;
      }
      const parsed = JSON.parse(raw);
      return sanitize(parsed);
    } catch (e) {
      console.warn('StudentStorage: Storage corrupted or unreadable. Initializing safe defaults.', e);
      const fallback = getDefaultData();
      save(fallback);
      return fallback;
    }
  }

  function save(state) {
    try {
      const clean = sanitize(state);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
      return true;
    } catch (e) {
      console.error('StudentStorage: Save failed.', e);
      return false;
    }
  }

  function reset() {
    const fresh = getDefaultData();
    save(fresh);
    return fresh;
  }

  function exportJSON(state) {
    const clean = sanitize(state || load());
    return JSON.stringify(clean, null, 2);
  }

  function importJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure');
      }
      const clean = sanitize(parsed);
      save(clean);
      return { success: true, state: clean };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    CURRENT_SCHEMA: CURRENT_SCHEMA,
    load: load,
    save: save,
    reset: reset,
    getDefaultData: getDefaultData,
    sanitize: sanitize,
    exportJSON: exportJSON,
    importJSON: importJSON
  };
});
