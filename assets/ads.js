(() => {
  'use strict';
  const API_BASE = String(window.RMSS_CONFIG?.apiBaseUrl || '').replace(/\/+$/, '');
  const BANNER_KEY = '90461359d6979dc4291372ce39688f2f';
  const BANNER_SRC = 'https://www.highrevenueformat.com/90461359d6979dc4291372ce39688f2f/invoke.js';
  const NATIVE_SRC = 'https://pl31870580.profitableratecpmnetwork.com/9dfbb8f706917732aee76636799cab8d/invoke.js';
  const NATIVE_CONTAINER_ID = 'container-9dfbb8f706917732aee76636799cab8d';
  let observer = null;
  let resolved = false;
  let premium = false;
  const loadedSlots = new WeakSet();
  let bannerQueue = Promise.resolve();

  function setPremiumState(value) {
    premium = !!value;
    document.body.classList.toggle('rmss-premium', premium);
    document.querySelectorAll('.ad-slot').forEach(slot => {
      if (premium) {
        slot.hidden = true;
        slot.setAttribute('aria-hidden', 'true');
        slot.replaceChildren();
      } else {
        slot.hidden = false;
        slot.removeAttribute('aria-hidden');
        if (!resolved) slot.dataset.adStatus = 'waiting';
        if (loadedSlots.has(slot)) loadedSlots.delete(slot);
      }
    });
    if (premium && observer) observer.disconnect();
    if (!premium && resolved) startObserver();
    window.dispatchEvent(new CustomEvent('rmss:ads-state', { detail: { premium } }));
  }

  async function readPremiumFromAPI() {
    if (window.RMSS_USER_READY) {
      try { await window.RMSS_USER_READY; } catch {}
      return !!window.RMSS_CURRENT_USER?.is_premium;
    }
    try { if (window.RMSS_AUTH_READY) await window.RMSS_AUTH_READY; } catch {}
    let token = null;
    try { if (window.RMSSAuth?.getIdToken) token = await window.RMSSAuth.getIdToken(); } catch {}
    if (!token || !API_BASE) return false;
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` }, credentials: 'omit' });
      if (!response.ok) return response.status === 403 && /Account suspended/i.test((await response.clone().text().catch(()=>'') ));
      const data = await response.json();
      window.RMSS_CURRENT_USER = data.user || null;
      return Number(data.user?.is_premium || 0) === 1;
    } catch { return false; }
  }

  function loadBanner(slot) {
    if (premium || loadedSlots.has(slot)) return;
    loadedSlots.add(slot);
    slot.dataset.adStatus = 'queued';
    bannerQueue = bannerQueue.then(() => new Promise(resolve => {
      if (premium) { slot.hidden = true; slot.dataset.adStatus = 'premium-hidden'; resolve(); return; }
      slot.dataset.adStatus = 'loading';
      const mount = document.createElement('div');
      mount.className = 'ad-provider-mount';
      slot.replaceChildren(mount);
      // This provider reads a page-global atOptions object, so placements are serialized to prevent races.
      window.atOptions = { key: BANNER_KEY, format: 'iframe', height: 250, width: 300, params: {} };
      const script = document.createElement('script');
      script.async = true;
      script.dataset.rmssAdsterra = 'banner';
      script.src = BANNER_SRC;
      script.onload = () => { slot.dataset.adStatus = 'loaded'; resolve(); };
      script.onerror = () => { slot.dataset.adStatus = 'error'; slot.textContent = 'Anuncio no disponible'; resolve(); };
      mount.appendChild(script);
    })).catch(error => { console.error('Adsterra banner queue:', error); slot.dataset.adStatus = 'error'; });
  }

  function loadNative(slot) {
    if (premium || loadedSlots.has(slot)) return;
    loadedSlots.add(slot);
    slot.dataset.adStatus = 'loading';
    slot.replaceChildren();
    const target = document.createElement('div');
    target.id = NATIVE_CONTAINER_ID;
    target.className = 'ad-native-mount';
    slot.appendChild(target);
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.dataset.rmssAdsterra = 'native';
    script.src = NATIVE_SRC;
    script.onload = () => { slot.dataset.adStatus = 'loaded'; };
    script.onerror = () => { slot.dataset.adStatus = 'error'; slot.textContent = 'Anuncio no disponible'; };
    slot.appendChild(script);
  }

  function loadSlot(slot) {
    if (premium || loadedSlots.has(slot)) return;
    if (slot.dataset.adKind === 'native') loadNative(slot); else loadBanner(slot);
  }
  function startObserver() {
    if (premium || !resolved) return;
    if (observer) observer.disconnect();
    const slots = [...document.querySelectorAll('.ad-slot[data-ad-kind]')];
    if (!('IntersectionObserver' in window)) { slots.forEach(loadSlot); return; }
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { observer.unobserve(entry.target); loadSlot(entry.target); }
    }, { rootMargin: '180px 0px' });
    slots.forEach(slot => { if (!loadedSlots.has(slot)) observer.observe(slot); });
  }

  async function init() {
    if (!document.querySelector('.ad-slot[data-ad-kind]')) { resolved = true; return; }
    const isPremium = await readPremiumFromAPI();
    resolved = true;
    setPremiumState(isPremium);
    if (!isPremium) startObserver();
  }
  window.addEventListener('rmss:user-state', event => {
    const user = event.detail?.user || null;
    window.RMSS_CURRENT_USER = user;
    setPremiumState(Number(user?.is_premium || 0) === 1);
  });
  window.addEventListener('rmss:premium-updated', event => setPremiumState(!!event.detail?.is_premium));
  window.RMSSAds = { refresh: init, applyPremium: setPremiumState };
  init();
})();
