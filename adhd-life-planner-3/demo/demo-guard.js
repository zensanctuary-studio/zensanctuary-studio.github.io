/**
 * Universal Demo Guard & Session Sandbox
 * Isolates demo state into sessionStorage and gates full features with Etsy purchase CTAs.
 */
(function () {
  'use strict';

  // 1. Disable ServiceWorker registration in demo mode
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register = function () {
      return Promise.resolve();
    };
  }

  // 2. Intercept localStorage with sessionStorage for the demo key
  const STORE_KEY = window.__APP_STORE_KEY || 'etsy_app_state_v1';

  const originalGetItem = localStorage.getItem.bind(localStorage);
  const originalSetItem = localStorage.setItem.bind(localStorage);
  const originalRemoveItem = localStorage.removeItem.bind(localStorage);

  localStorage.getItem = function (key) {
    if (key === STORE_KEY) {
      return sessionStorage.getItem(STORE_KEY);
    }
    return originalGetItem(key);
  };

  localStorage.setItem = function (key, value) {
    if (key === STORE_KEY) {
      sessionStorage.setItem(STORE_KEY, value);
      return;
    }
    originalSetItem(key, value);
  };

  localStorage.removeItem = function (key) {
    if (key === STORE_KEY) {
      sessionStorage.removeItem(STORE_KEY);
      return;
    }
    originalRemoveItem(key);
  };

  // 3. Modal logic for gated features (e.g. data backup export)
  window.openDemoGate = function (featureName) {
    const modal = document.getElementById('etsy-demo-gate-modal');
    if (modal) {
      const title = document.getElementById('etsy-gate-modal-title');
      if (title && featureName) title.textContent = featureName;
      modal.classList.add('active');
    }
  };

  window.closeDemoGate = function () {
    const modal = document.getElementById('etsy-demo-gate-modal');
    if (modal) modal.classList.remove('active');
  };
})();
