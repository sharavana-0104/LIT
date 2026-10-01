// Bloom QR Modal Controller
(function () {
  const TARGET_URL = 'https://www.bubbbly.com/bloom?u=https%3A%2F%2Fwww.typingmind.com%2F';
  let modalEl = null;
  let bloomQrHoldTriggerEl = null;

  // Companies LIT alumni work at — logo images + fallback initials/colors
  const COMPANY_LIST = [
    { name: 'Google',    logo: '/assets/ui/logos/google.png',    initials: 'G',  bg: '#4285F4', fg: '#fff' },
    { name: 'Microsoft', logo: '/assets/ui/logos/microsoft.png', initials: 'M',  bg: '#00A4EF', fg: '#fff' },
    { name: 'Meta',      logo: '/assets/ui/logos/meta.png',      initials: 'M',  bg: '#0866FF', fg: '#fff' },
    { name: 'Apple',     logo: '/assets/ui/logos/apple.png',     initials: '',  bg: '#1d1d1f', fg: '#fff' },
    { name: 'Amazon',    logo: '/assets/ui/logos/amazon.png',    initials: 'A',  bg: '#FF9900', fg: '#fff' },
    { name: 'NVIDIA',    logo: '/assets/ui/logos/nvidia.png',    initials: 'N',  bg: '#76B900', fg: '#fff' },
    { name: 'OpenAI',    logo: '/assets/ui/logos/openai.png',    initials: 'AI', bg: '#10a37f', fg: '#fff' },
    { name: 'Anthropic', logo: '/assets/ui/logos/anthropic.png', initials: 'Cl', bg: '#D4A574', fg: '#fff' },
    { name: 'Figma',     logo: '/assets/ui/logos/figma.png',     initials: 'F',  bg: '#F24E1E', fg: '#fff' },
    { name: 'Stripe',    logo: '/assets/ui/logos/stripe.png',    initials: 'S',  bg: '#635BFF', fg: '#fff' },
    { name: 'Notion',    logo: '/assets/ui/logos/notion.png',    initials: 'N',  bg: '#1d1d1f', fg: '#fff' },
    { name: 'Vercel',    logo: '/assets/ui/logos/vercel.png',    initials: 'V',  bg: '#000',    fg: '#fff' },
  ];

  // Duplicate so the marquee loops seamlessly
  const MARQUEE_ITEMS = [...COMPANY_LIST, ...COMPANY_LIST];

  function buildCeoStrip() {
    const chips = MARQUEE_ITEMS.map(c =>
      `<div class="bloom-ceo-chip" title="${c.name}">` +
        // Avatar circle: white bg with the logo image; fallback shows initials via onerror
        `<div class="bloom-ceo-avatar" style="background:#fff" aria-hidden="true">` +
          `<img ` +
            `class="bloom-ceo-logo" ` +
            `src="${c.logo}" ` +
            `alt="${c.name}" ` +
            `onerror="this.style.display='none';this.parentNode.dataset.fallback='1';` +
              `this.parentNode.style.background='${c.bg}';` +
              `this.parentNode.style.color='${c.fg}';` +
              `this.parentNode.innerHTML='<span>${c.initials}</span>';" ` +
          `/>` +
        `</div>` +
        `<span class="bloom-ceo-label">${c.name}</span>` +
      `</div>`
    ).join('');

    return (
      `<div class="bloom-social-proof" aria-label="Companies our alumni work at">` +
        `<p class="bloom-social-label">Alumni now work at</p>` +
        `<div class="bloom-marquee-track" aria-hidden="true">` +
          `<div class="bloom-marquee-inner">${chips}</div>` +
        `</div>` +
      `</div>`
    );
  }

  function createModal() {
    if (modalEl) return modalEl;

    const backdrop = document.createElement('div');
    backdrop.className = 'bloom-modal-backdrop';
    backdrop.id = 'bloom-qr-modal';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Scan or Open TypingMind');

    backdrop.innerHTML =
      `<div class="bloom-modal-card">` +
        `<div class="bloom-card-header">` +
          `<div class="bloom-header-left">` +
            `<img class="bloom-avatar" src="/assets/ui/sharavana_avatar.png" alt="Sharavana Chandramohan" />` +
            `<span class="bloom-name">Sharavana Chandramohan</span>` +
          `</div>` +
          `<button class="bloom-close-btn" aria-label="Close" type="button">\u2715</button>` +
        `</div>` +

        `<a class="bloom-inner-card" href="${TARGET_URL}" target="_blank" rel="noopener noreferrer" title="Click to open link">` +
          `<div class="bloom-qr-container">` +
            `<img class="bloom-qr-code" src="/assets/ui/target_qr.svg" alt="Scan QR Code" />` +
            `<div class="bloom-gpay-badge" aria-hidden="true">` +
              `<img src="/assets/ui/gpay_logo.png" alt="Google Pay" />` +
            `</div>` +
          `</div>` +
          `<div class="bloom-upi-id">UPI ID: chandramohansharavana@okicici</div>` +
        `</a>` +

        `<div class="bloom-card-footer">` +
          `<p class="bloom-scan-hint">Scan to pay with any UPI app</p>` +
          `<a class="bloom-open-btn" href="${TARGET_URL}" target="_blank" rel="noopener noreferrer">` +
            `<span>Open Link in Browser</span>` +
            `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
              `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>` +
              `<polyline points="15 3 21 3 21 9"></polyline>` +
              `<line x1="10" y1="14" x2="21" y2="3"></line>` +
            `</svg>` +
          `</a>` +
        `</div>` +

        buildCeoStrip() +

      `</div>`;

    // Close on backdrop click or close button
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop || e.target.closest('.bloom-close-btn')) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && window.__bloomQRModalActive) {
        closeModal();
      }
    });

    document.body.appendChild(backdrop);
    modalEl = backdrop;

    return modalEl;
  }

  function showModal() {
    const el = createModal();
    window.__bloomQRModalActive = true;
    syncBloomQrHoldTrigger();
    requestAnimationFrame(() => {
      el.classList.add('is-active');
    });
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-active');
    window.__bloomQRModalActive = false;
    syncBloomQrHoldTrigger();
  }

  function syncBloomQrHoldTrigger() {
    // Bloom QR hold trigger permanently removed — no-op.
  }

  function createBloomQrHoldTrigger() {
    if (bloomQrHoldTriggerEl) return;

    const trigger = document.createElement('div');
    trigger.className = 'bloom-qr-hold-trigger';
    trigger.innerHTML =
      '<div class="next-stage-btn-stroke"></div>' +
      '<button class="next-stage-btn bloom-qr-hold-button" type="button" aria-label="Tap and hold to open Bloom QR">' +
        '<svg class="next-stage-btn-progress" viewBox="0 0 100 100" aria-hidden="true">' +
          '<circle cx="50" cy="50" r="46"></circle>' +
        '</svg>' +
      '</button>' +
      '<div class="next-stage-label bloom-qr-hold-label">TAP<br>HOLD<br>BLOOM QR</div>';

    const button = trigger.querySelector('.bloom-qr-hold-button');
    const progressCircle = trigger.querySelector('.next-stage-btn-progress circle');
    const circumference = 2 * Math.PI * 46;
    const holdDuration = 1800;
    let isHolding = false;
    let holdStartedAt = 0;
    let animationFrame = 0;

    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = circumference;

    const setProgress = (progress) => {
      progressCircle.style.strokeDashoffset = circumference * (1 - progress);
    };

    const finishHold = (completed) => {
      if (!isHolding) return;
      isHolding = false;
      cancelAnimationFrame(animationFrame);
      trigger.classList.remove('is-holding');
      setProgress(completed ? 1 : 0);
      if (completed) showModal();
    };

    const tick = (now) => {
      if (!isHolding) return;
      const progress = Math.min((now - holdStartedAt) / holdDuration, 1);
      setProgress(progress);
      if (progress >= 1) finishHold(true);
      else animationFrame = requestAnimationFrame(tick);
    };

    button.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      if (isHolding) return;
      isHolding = true;
      holdStartedAt = performance.now();
      trigger.classList.add('is-holding');
      if (button.setPointerCapture && event.pointerId !== undefined) {
        button.setPointerCapture(event.pointerId);
      }
      animationFrame = requestAnimationFrame(tick);
    });
    button.addEventListener('pointerup', (event) => {
      event.stopPropagation();
      finishHold(false);
    });
    button.addEventListener('pointercancel', (event) => {
      event.stopPropagation();
      finishHold(false);
    });
    button.addEventListener('lostpointercapture', () => finishHold(false));
    button.addEventListener('contextmenu', (event) => event.preventDefault());

    document.body.appendChild(trigger);
    bloomQrHoldTriggerEl = trigger;
    watchFinalStageCue();
  }

  function watchFinalStageCue() {
    const attachToCue = () => {
      const stageTrigger = document.querySelector('.next-stage-trigger');
      if (!stageTrigger) return false;

      const observer = new MutationObserver(syncBloomQrHoldTrigger);
      observer.observe(stageTrigger, {
        attributes: true,
        attributeFilter: ['style'],
        childList: true,
        characterData: true,
        subtree: true
      });
      syncBloomQrHoldTrigger();
      return true;
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncBloomQrHoldTrigger);
      window.visualViewport.addEventListener('scroll', syncBloomQrHoldTrigger);
    }

    if (attachToCue()) return;

    const observer = new MutationObserver(() => {
      if (attachToCue()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.__showBloomQRModal = showModal;
  window.__closeBloomQRModal = closeModal;
  window.__testBloomModal = showModal;

  // ── -1 BZ FP Overlay ─────────────────────────────────────────
  let fpOverlayEl = null;

  function createFPOverlay() {
    if (fpOverlayEl) return fpOverlayEl;

    const backdrop = document.createElement('div');
    backdrop.className = 'fp-overlay-backdrop';
    backdrop.id = 'fp-overlay';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-label', '-1 BZ Bloom Experience');
    backdrop.innerHTML =
      '<div class="fp-experience-header">' +
        '<div class="fp-header-badge">' +
          '<span class="fp-badge-tag">-1 BZ</span>' +
          '<span style="font-weight:600;font-size:13px;letter-spacing:0.04em;">BLOOM EXPERIENCE</span>' +
        '</div>' +
      '</div>' +
      '<iframe class="fp-iframe" src="/FP.html" title="Bloom QR Flower Experience" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"></iframe>';

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && window.__fpOverlayActive) closeFPOverlay();
    });

    document.body.appendChild(backdrop);
    fpOverlayEl = backdrop;
    return fpOverlayEl;
  }

  function showFPOverlay() {
    const el = createFPOverlay();
    window.__fpOverlayActive = true;
    window.__bloomQRModalActive = true;
    syncBloomQrHoldTrigger();
    // Hide parent WebGL cursor and custom cursor so it doesn't bleed through the iframe
    const wgl = document.getElementById('webgl');
    if (wgl) wgl.style.cursor = 'none';
    document.body.style.cursor = 'none';
    const customCursor = document.querySelector('[data-custom-cursor="1"]');
    if (customCursor) customCursor.style.display = 'none';
    requestAnimationFrame(() => { el.classList.add('is-active'); });
  }

  function closeFPOverlay() {
    if (!fpOverlayEl) return;
    fpOverlayEl.classList.remove('is-active');
    window.__fpOverlayActive = false;
    window.__bloomQRModalActive = false;
    syncBloomQrHoldTrigger();

    // Hide the TAP HOLD -1 BZ trigger permanently once we return
    document.body.classList.add('has-seen-fp');

    // Restore parent cursor
    const wgl = document.getElementById('webgl');
    if (wgl) wgl.style.cursor = '';
    document.body.style.cursor = '';
    const customCursor = document.querySelector('[data-custom-cursor="1"]');
    if (customCursor) customCursor.style.display = '';
    window.dispatchEvent(new CustomEvent('zero:returnToStage5'));
  }

  window.__showFPOverlay = showFPOverlay;
  window.__closeFPOverlay = closeFPOverlay;
  // ─────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createModal();
      createFPOverlay();
      // TAP HOLD BLOOM QR permanently removed
    });
  } else {
    createModal();
    createFPOverlay();
    // TAP HOLD BLOOM QR permanently removed
  }

  // Inject global style to hide the TAP HOLD -1 BZ trigger after completion
  const style = document.createElement('style');
  style.innerHTML = `
    body.has-seen-fp .next-stage-trigger {
      display: none !important;
      opacity: 0 !important;
      pointer-events: none !important;
      visibility: hidden !important;
    }
  `;
  document.head.appendChild(style);

  console.log('[BloomModal] Initialized with -1 BZ FP overlay. Run window.__showFPOverlay() to preview.');
})();
