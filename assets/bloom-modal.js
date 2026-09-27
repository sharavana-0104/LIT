// Bloom QR Modal Controller
(function () {
  const TARGET_URL = 'https://www.bubbbly.com/bloom?u=https%3A%2F%2Fwww.typingmind.com%2F';
  let modalEl = null;

  function createModal() {
    if (modalEl) return modalEl;

    const backdrop = document.createElement('div');
    backdrop.className = 'bloom-modal-backdrop';
    backdrop.id = 'bloom-qr-modal';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Scan or Open TypingMind');

    backdrop.innerHTML = `
      <div class="bloom-modal-card">
        <div class="bloom-card-header">
          <div class="bloom-header-left">
            <img class="bloom-avatar" src="/assets/ui/sharavana_avatar.png" alt="Sharavana Chandramohan" />
            <span class="bloom-name">Sharavana Chandramohan</span>
          </div>
          <button class="bloom-close-btn" aria-label="Close" type="button">✕</button>
        </div>

        <a class="bloom-inner-card" href="${TARGET_URL}" target="_blank" rel="noopener noreferrer" title="Click to open link">
          <div class="bloom-qr-container">
            <img class="bloom-qr-code" src="/assets/ui/target_qr.svg" alt="Scan QR Code" />
            <div class="bloom-gpay-badge" aria-hidden="true">
              <img src="/assets/ui/gpay_logo.png" alt="Google Pay" />
            </div>
          </div>
          <div class="bloom-upi-id">UPI ID: chandramohansharavana@okicici</div>
        </a>

        <div class="bloom-card-footer">
          <p class="bloom-scan-hint">Scan to pay with any UPI app</p>
          <a class="bloom-open-btn" href="${TARGET_URL}" target="_blank" rel="noopener noreferrer">
            <span>Open Link in Browser</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>
    `;

    // Event listeners
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
    requestAnimationFrame(() => {
      el.classList.add('is-active');
    });
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove('is-active');
    window.__bloomQRModalActive = false;
  }

  window.__showBloomQRModal = showModal;
  window.__closeBloomQRModal = closeModal;
  window.__testBloomModal = showModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createModal);
  } else {
    createModal();
  }

  console.log('[BloomModal] Initialized. Run window.__testBloomModal() to preview.');
})();
