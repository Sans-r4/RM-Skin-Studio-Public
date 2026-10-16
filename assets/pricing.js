(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const api = window.RMSS?.api;
  if (!api || document.body.dataset.page !== 'pricing') return;
  let currentUser = window.RMSS_CURRENT_USER || null;
  let config = null;
  let renderPromise = null;

  function show(message, kind = 'info') { const node = $('#premium-message'); if (node) { node.textContent = message; node.dataset.kind = kind; } }
  function loadScript(src) {
    const present = document.querySelector('script[data-rmss-premium-sdk="true"]');
    if (present) {
      if (present.dataset.loaded === 'true') return Promise.resolve();
      return new Promise((resolve, reject) => { present.addEventListener('load', resolve, { once: true }); present.addEventListener('error', () => reject(new Error('No se pudo cargar PayPal.')), { once: true }); });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.dataset.rmssPremiumSdk = 'true'; script.src = src; script.async = true;
      script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
      script.onerror = () => { script.remove(); reject(new Error('No se pudo cargar el SDK de suscripciones de PayPal.')); };
      document.head.appendChild(script);
    });
  }
  async function setup() {
    if (!config) config = await api('/api/config');
    const host = $('#premium-subscription-buttons'); if (!host) return;
    if (Number(currentUser?.is_premium || 0) === 1) { host.textContent = 'Tu cuenta ya tiene Premium activo.'; show('Premium está activo para tu cuenta.', 'success'); return; }
    if (!currentUser) { host.innerHTML = '<a class="button primary" href="/index.html?next=%2Fpricing.html">Inicia sesión para suscribirte</a>'; show('La suscripción necesita una cuenta verificada.', 'info'); return; }
    if (!config.premiumEnabled || !config.paypalPremiumPlanId || !config.paypalClientId) { host.textContent = 'Suscripción no disponible hasta configurar un plan mensual de PayPal de USD 7.00.'; show('Falta PAYPAL_PREMIUM_PLAN_ID o la configuración de PayPal en el Worker.', 'warning'); return; }
    if (renderPromise) return renderPromise;
    renderPromise = (async () => {
      const src = new URL('https://www.paypal.com/sdk/js');
      src.searchParams.set('client-id', config.paypalClientId); src.searchParams.set('vault', 'true'); src.searchParams.set('intent', 'subscription'); src.searchParams.set('components', 'buttons'); src.searchParams.set('currency', 'USD');
      await loadScript(src.toString());
      if (!window.paypal?.Buttons) throw new Error('El SDK de PayPal no expone Buttons.');
      host.replaceChildren();
      await window.paypal.Buttons({
        style: { layout: 'vertical', shape: 'rect', label: 'subscribe', height: 46 },
        createSubscription: (_data, actions) => actions.subscription.create({
          plan_id: config.paypalPremiumPlanId,
          custom_id: `rmss:${currentUser.id}`,
          application_context: { brand_name: 'RM Skin Studio', user_action: 'SUBSCRIBE_NOW' }
        }),
        onApprove: async data => {
          try {
            show('Pago aceptado. Verificando la suscripción…');
            const result = await api('/api/premium/activate', { method: 'POST', body: JSON.stringify({ subscriptionID: data.subscriptionID }) });
            currentUser = { ...currentUser, is_premium: 1, premium_expires_at: result.premium_expires_at || null };
            window.RMSS_CURRENT_USER = currentUser;
            window.dispatchEvent(new CustomEvent('rmss:user-state', { detail: { user: currentUser } }));
            window.dispatchEvent(new CustomEvent('rmss:premium-updated', { detail: { is_premium: true } }));
            host.textContent = 'Premium activado correctamente.';
            show('Premium está activo. Los espacios de anuncios se ocultarán en las páginas RM Skin Studio.', 'success');
            await window.RMSS?.refreshUser?.();
          } catch (error) { console.error('RMSS subscription activation:', error); show(error.message || 'PayPal aceptó la suscripción, pero no pudimos verificarla. Contacta con soporte antes de volver a suscribirte.', 'error'); }
        },
        onCancel: () => show('Suscripción cancelada. No se activó Premium.'),
        onError: error => { console.error('RMSS PayPal subscription:', error); show('No se pudo completar la suscripción. Revisa el plan y las credenciales de PayPal.', 'error'); }
      }).render(host);
    })();
    try { await renderPromise; } catch (error) { renderPromise = null; show(error.message, 'error'); }
  }
  window.addEventListener('rmss:pricing-user-ready', event => { currentUser = event.detail?.user || null; setup(); });
  window.addEventListener('rmss:user-state', event => { currentUser = event.detail?.user || null; setup(); });
  window.RMSS_USER_READY?.then(user => { currentUser = user || null; setup(); });
})();
