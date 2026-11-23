/**
 * End of Life Planner 3 (Zen Sanctuary Studio / Leo) — Demo Sandbox Guard
 */
(function () {
  'use strict';

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register = function () { return Promise.resolve(); };
  }

  var DEMO_STORE_KEY = 'end_of_life_planner_3_data_v1';
  var origGet = localStorage.getItem.bind(localStorage);
  var origSet = localStorage.setItem.bind(localStorage);
  var origRem = localStorage.removeItem.bind(localStorage);

  localStorage.getItem = function (k) { return k === DEMO_STORE_KEY ? sessionStorage.getItem(k) : origGet(k); };
  localStorage.setItem = function (k, v) { return k === DEMO_STORE_KEY ? sessionStorage.setItem(k, v) : origSet(k, v); };
  localStorage.removeItem = function (k) { return k === DEMO_STORE_KEY ? sessionStorage.removeItem(k) : origRem(k); };

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  if (!sessionStorage.getItem(DEMO_STORE_KEY)) {
    var today = todayISO();
    sessionStorage.setItem(DEMO_STORE_KEY, JSON.stringify({
      version: 1,
      settings: { theme: 'wabi-sabi', currency: 'USD', ownerName: 'Alex Morgan (Zen Demo)', safeLocation: 'Fireproof Safe — Closet Top Shelf', reviewCadenceMonths: 12, lastReviewed: today, shiftWeekendReview: true, sound: true, onboarded: false, fog: false, isSampleSeed: true, seqCounter: 10 },
      vaultMeta: { passwordManager: 'Bitwarden Family', recoveryKitLocation: 'Sealed Envelope in Home Safe', legacyContactNote: 'Apple & Google Legacy Contacts configured' },
      wishes: { disposition: 'Cremation with lakeside memorial', organDonation: 'Registered Donor', serviceTone: 'Quiet outdoor gathering with acoustic music', musicReadings: 'Mary Oliver poem', serviceNotes: 'Donations to animal rescue preferred.', obituaryNotes: '' },
      contacts: [
        { id: 'cnt_1', name: 'Elena Morgan', relation: 'Spouse & Executor', role: 'executor', phone: '(555) 210-4812', email: 'elena@example.com', isFirstCall: true, notes: 'Holds safe key.', isSample: true },
        { id: 'cnt_2', name: 'David Chen, Esq.', relation: 'Estate Attorney', role: 'legal', phone: '(555) 394-7720', email: 'dchen@example.com', isFirstCall: false, notes: 'Holds signed Will.', isSample: true }
      ],
      dependents: [{ id: 'dep_1', name: 'Milo (Golden Retriever)', type: 'pet', guardianContactId: 'cnt_1', careNotes: '1 cup salmon kibble AM/PM; Oak Creek Vet.', isSample: true }],
      documents: [
        { id: 'doc_1', title: 'Last Will & Testament (Notarized)', category: 'Legal', status: 'signed', location: 'Fireproof Safe — Folder #1', custodianContactId: 'cnt_2', updatedAt: today, isSample: true },
        { id: 'doc_2', title: 'Advance Healthcare Directive', category: 'Medical', status: 'signed', location: 'Fireproof Safe + Clinic Portal', custodianContactId: 'cnt_1', updatedAt: today, isSample: true },
        { id: 'doc_3', title: 'Durable Financial POA', category: 'Legal', status: 'drafting', location: 'Pending notary', custodianContactId: 'cnt_1', updatedAt: today, isSample: true }
      ],
      accounts: [
        { id: 'acc_1', name: 'Primary Joint Checking', institution: 'Summit Credit Union', last4: '4821', kind: 'asset', balanceCents: 1850000, balanceAsOf: today, updatedSeq: 2, beneficiaryContactId: 'cnt_1', locationHint: 'Joint survivor access', isSample: true },
        { id: 'acc_2', name: '20-Yr Term Life Insurance', institution: 'MassMutual', last4: '7710', kind: 'policy', balanceCents: 50000000, balanceAsOf: today, updatedSeq: 2, beneficiaryContactId: 'cnt_1', locationHint: 'Safe Folder #2', isSample: true },
        { id: 'acc_3', name: 'Home Mortgage Balance', institution: 'First Horizon', last4: '1102', kind: 'debt', balanceCents: 18500000, balanceAsOf: today, updatedSeq: 2, beneficiaryContactId: '', locationHint: 'Auto-draft from #4821', isSample: true }
      ],
      adjustments: [],
      autopays: [{ id: 'ap_1', title: 'Home Utilities & Fiber', amountCents: 21500, cycle: 'monthly', paymentMethod: 'Checking #4821', actionNote: 'Keep until home transfer', status: 'active', isSample: true }],
      digital: [
        { id: 'dig_1', service: 'Primary Email (Gmail)', handle: 'alex@example.com', directive: 'archive', accessHint: 'Bitwarden + Inactive Manager', isSample: true },
        { id: 'dig_2', service: 'iCloud Family Photos', handle: 'Apple ID', directive: 'transfer', accessHint: 'Apple Legacy Contact key in Safe', isSample: true }
      ],
      letters: [{ id: 'let_1', recipientName: 'Elena & Family', recipientContactId: 'cnt_1', title: 'Open When Ready', body: 'Everything practical is organized here so you can rest.', updatedAt: today, isSample: true }],
      checklist: [
        { id: 'chk_1', phase: '24h', title: 'Notify immediate family & executor', notes: 'See Kinship circle', completed: true, isSample: true },
        { id: 'chk_2', phase: '24h', title: 'Secure residence & pet/dependent care', notes: 'Check protocols', completed: false, isSample: true },
        { id: 'chk_3', phase: 'week1', title: 'Order 8–10 certified Death Certificates', notes: 'Via funeral home', completed: false, isSample: true },
        { id: 'chk_4', phase: 'month1', title: 'File insurance claims & cancel auto-pays', notes: 'See Vault tab', completed: false, isSample: true }
      ]
    }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.createElement('div');
    banner.className = 'etsy-demo-banner';
    banner.innerHTML =
      '<div><strong>Live Interactive Demo:</strong> End of Life Sanctuary (Wabi-Sabi Edition) · Data resets on refresh</div>' +
      '<a href="https://zensanctuary-studio.github.io/end-of-life-planner-3/" target="_blank" class="etsy-demo-cta">Unlock Lifetime App on Etsy ($9.00)</a>';
    document.body.prepend(banner);

    var modal = document.createElement('div');
    modal.className = 'etsy-demo-modal-overlay';
    modal.id = 'etsy-demo-modal';
    modal.innerHTML =
      '<div class="etsy-demo-modal-card">' +
        '<h3>Own Your Private Wabi-Sabi Sanctuary Forever</h3>' +
        '<p>You are previewing the live demo sandbox. Unlock the lifetime edition on Etsy for permanent local storage, printable Executor Brief PDFs, and zero subscriptions.</p>' +
        '<a href="https://zensanctuary-studio.github.io/end-of-life-planner-3/" target="_blank" class="etsy-gate-btn-buy">Get Instant Access on Etsy — $9.00</a><br>' +
        '<button type="button" class="etsy-gate-btn-close" id="btn-close-demo-modal">Continue Preview</button>' +
      '</div>';
    document.body.appendChild(modal);

    document.getElementById('btn-close-demo-modal').addEventListener('click', function () { modal.classList.remove('active'); });
    setTimeout(function () {
      ['btn-export-json', 'btn-print-packet'].forEach(function (id) {
        var btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', function (e) { e.stopImmediatePropagation(); modal.classList.add('active'); }, true);
      });
    }, 450);
  });
})();
