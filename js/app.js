(function () {
  'use strict';

  // ── 1. NAV ACTIVE STATE ────────────────────────────────────────────────────
  var NAV_MAP = {
    '/':                   'dashboard',
    '/index.html':         'dashboard',
    '/projects.html':      'projects',
    '/projects':           'projects',
    '/subscriptions.html': 'subscriptions',
    '/subscriptions':      'subscriptions',
    '/briefing.html':      'projects',
    '/briefing':           'projects',
  };

  var ACTIVE   = ['text-primary', 'bg-surface-container-high', 'border-l-2', 'border-primary'];
  var INACTIVE = ['text-on-surface-variant', 'hover:text-on-surface', 'hover:bg-surface-container', 'transition-colors'];

  function setNavActiveState() {
    var currentKey = NAV_MAP[window.location.pathname] || 'dashboard';
    document.querySelectorAll('[data-nav]').forEach(function (link) {
      if (link.dataset.nav === currentKey) {
        INACTIVE.forEach(function (c) { link.classList.remove(c); });
        ACTIVE.forEach(function (c)   { link.classList.add(c);    });
      } else {
        ACTIVE.forEach(function (c)   { link.classList.remove(c); });
        INACTIVE.forEach(function (c) { link.classList.add(c);    });
      }
    });
  }

  // ── 2. PAGE FADE TRANSITIONS ──────────────────────────────────────────────
  function initFadeTransitions() {
    document.body.style.opacity    = '0';
    document.body.style.transition = 'opacity 0.2s ease';
    requestAnimationFrame(function () { document.body.style.opacity = '1'; });

    document.querySelectorAll('[data-nav]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;
        e.preventDefault();
        document.body.style.opacity = '0';
        setTimeout(function () { window.location.href = href; }, 200);
      });
    });
  }

  // ── 3. LIVE SECURITY LOG ──────────────────────────────────────────────────
  var LOG_MESSAGES = [
    'ENCRYPTED_HANDSHAKE: Node verified with RSA-4096.',
    'FIREWALL_SCAN: 0 threats detected in inbound traffic.',
    'DB_SYNC: Replication successful. Region: US-EAST.',
    'HEALTH_CHECK: All modules operational.',
    'AUTH_SUCCESS: Client session renewed.',
    'EDGE_CACHE: Purged in 12ms across EU-Central.',
    'SEC_AUDIT: No vulnerabilities in /api/v2.',
    'HEARTBEAT: All global nodes 99.99% uptime.',
    'SPRINT_LOG: Daily task progress committed.',
    'CERT_RENEWAL: TLS certificate auto-renewed.',
    'RATE_LIMIT: 0 suspicious requests blocked.',
    'BACKUP: Encrypted snapshot completed.',
  ];

  function liveTime() {
    return new Date().toLocaleTimeString('en-GB', { hour12: false });
  }

  function addLogEntry(container) {
    var msg  = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
    var time = liveTime();

    var entry = document.createElement('div');
    entry.className = 'flex gap-4 border-l border-primary/30 pl-3 transition-opacity duration-700';
    entry.style.opacity = '0';
    entry.innerHTML =
      '<span class="text-primary/60 shrink-0 font-mono text-[11px]">' + time + '</span>' +
      '<span class="text-text-muted font-mono text-[11px]">' + msg + '</span>';

    container.prepend(entry);
    setTimeout(function () { entry.style.opacity = '1'; }, 50);

    var all = container.querySelectorAll('div');
    if (all.length > 20) { all[all.length - 1].remove(); }

    var stored = JSON.parse(localStorage.getItem('vld_log_entries') || '[]');
    stored.unshift({ time: time, msg: msg });
    if (stored.length > 20) { stored.pop(); }
    localStorage.setItem('vld_log_entries', JSON.stringify(stored));
  }

  function initSecurityLog() {
    var container = document.getElementById('security-log-feed');
    if (!container) { return; }
    setInterval(function () { addLogEntry(container); }, 30000);
  }

  // ── 4. MOBILE SIDEBAR TOGGLE ──────────────────────────────────────────────
  function initMobileSidebar() {
    var sidebar = document.querySelector('aside');
    var header  = document.querySelector('header');
    if (!sidebar || !header) { return; }

    var btn = document.createElement('button');
    btn.id = 'sidebar-toggle';
    btn.className = 'md:hidden flex flex-col gap-1.5 p-2 mr-2 text-on-surface-variant hover:text-primary transition-colors shrink-0';
    btn.setAttribute('aria-label', 'Toggle navigation');
    btn.innerHTML =
      '<span class="w-5 h-px bg-current block"></span>' +
      '<span class="w-5 h-px bg-current block"></span>' +
      '<span class="w-5 h-px bg-current block"></span>';
    header.prepend(btn);

    var overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/70 z-40 hidden';
    document.body.appendChild(overlay);

    if (window.innerWidth < 768) {
      sidebar.style.transform = 'translateX(-100%)';
    }
    sidebar.style.transition = 'transform 0.3s ease';

    btn.addEventListener('click', function () {
      sidebar.style.transform = 'translateX(0)';
      overlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });

    overlay.addEventListener('click', function () {
      sidebar.style.transform = 'translateX(-100%)';
      overlay.classList.add('hidden');
      document.body.style.overflow = '';
    });
  }

  // ── 5. BRIEFING FORM AUTO-SAVE ────────────────────────────────────────────
  function initBriefingForm() {
    var form = document.getElementById('briefing-form');
    if (!form) { return; }

    var draft = JSON.parse(localStorage.getItem('vld_briefing_draft') || '{}');

    form.querySelectorAll('input[type="text"], textarea, select').forEach(function (el) {
      var key = el.id || el.name || el.getAttribute('placeholder') || '';
      if (key && draft[key] !== undefined) { el.value = draft[key]; }
    });
    form.querySelectorAll('input[type="checkbox"]').forEach(function (el) {
      var key = el.value || el.id || '';
      if (key && draft[key] !== undefined) { el.checked = draft[key]; }
    });

    function saveDraft() {
      var data = JSON.parse(localStorage.getItem('vld_briefing_draft') || '{}');
      form.querySelectorAll('input[type="text"], textarea, select').forEach(function (el) {
        var key = el.id || el.name || el.getAttribute('placeholder') || '';
        if (key) { data[key] = el.value; }
      });
      form.querySelectorAll('input[type="checkbox"]').forEach(function (el) {
        var key = el.value || el.id || '';
        if (key) { data[key] = el.checked; }
      });
      localStorage.setItem('vld_briefing_draft', JSON.stringify(data));
    }

    form.addEventListener('input',  saveDraft);
    form.addEventListener('change', saveDraft);
  }

  // ── 6. CALENDAR DATE PERSISTENCE ─────────────────────────────────────────
  function initCalendar() {
    var saved = localStorage.getItem('vld_calendar_date');
    document.querySelectorAll('.calendar-day').forEach(function (day) {
      if (saved && day.textContent.trim() === saved && !day.classList.contains('opacity-30')) {
        day.classList.add('bg-primary-container', 'text-on-primary-container');
      }
      day.addEventListener('click', function () {
        if (this.classList.contains('opacity-30')) { return; }
        document.querySelectorAll('.calendar-day').forEach(function (d) {
          d.classList.remove('bg-primary-container', 'text-on-primary-container');
        });
        this.classList.add('bg-primary-container', 'text-on-primary-container');
        localStorage.setItem('vld_calendar_date', this.textContent.trim());
      });
    });
  }

  // ── INIT ──────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    setNavActiveState();
    initFadeTransitions();
    initSecurityLog();
    initMobileSidebar();
    initBriefingForm();
    initCalendar();
  });
}());
