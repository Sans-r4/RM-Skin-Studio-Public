(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const api = window.RMSS?.api;
  const slider = $('#credit-slider');
  if (!api || !slider) return;

  let config = null;
  let paypalSetupPromise = null;
  let googlePaySetupPromise = null;
  let payPalScriptPromise = null;
  let googlePayScriptPromise = null;
  const money = credits => (Number(credits) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  function showMessage(message, kind = 'info') {
    const node = $('#payment-message');
    if (!node) return;
    node.textContent = message;
    node.dataset.kind = kind;
  }

  function updatePrice() {
    const credits = Math.min(10000, Math.max(100, Number(slider.value) || 100));
    const output = $('#credit-count-choice');
    const price = $('#credit-price');
    if (output) output.textContent = credits.toLocaleString('en-US');
    if (price) price.textContent = `${money(credits)} USD`;
  }

  function loadScript(src, id) {
    if (id && document.getElementById(id)) {
      const existing = document.getElementById(id);
      if (existing.dataset.loaded === 'true') return Promise.resolve();
      if (existing.dataset.failed === 'true') existing.remove();
      else return new Promise((resolve, reject) => {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('No se pudo cargar el SDK del proveedor de pagos.')), { once: true });
      });
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      if (id) script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => { script.dataset.loaded = 'true'; resolve(); };
      script.onerror = () => { script.dataset.failed = 'true'; script.remove(); reject(new Error('No se pudo cargar el SDK del proveedor de pagos.')); };
      document.head.appendChild(script);
    });
  }

  async function apiRequest(path, body) {
    return api(path, { method: 'POST', body: JSON.stringify(body || {}) });
  }

  async function createOrder() {
    const credits = Number(slider.value);
    if (!Number.isInteger(credits) || credits < 100 || credits > 10000 || credits % 100 !== 0) {
      throw new Error('Elige entre 100 y 10.000 créditos, en incrementos de 100.');
    }
    return apiRequest('/api/payments/create-order', { credits });
  }

  async function captureOrder(orderId) {
    if (!orderId) throw new Error('PayPal no devolvió un identificador de orden válido.');
    const result = await apiRequest(`/api/payments/${encodeURIComponent(orderId)}/capture`, {});
    if (Number.isFinite(Number(result.credits))) {
      await window.RMSS?.refreshUser?.();
      showMessage(`Pago verificado. Tu saldo ahora es de ${Number(result.credits).toLocaleString('en-US')} créditos.`, 'success');
    }
    return result;
  }

  async function loadPayPalSDK() {
    if (payPalScriptPromise) return payPalScriptPromise;
    const source = new URL('https://www.paypal.com/sdk/js');
    source.searchParams.set('client-id', config.paypalClientId);
    source.searchParams.set('currency', 'USD');
    source.searchParams.set('intent', 'capture');
    source.searchParams.set('components', 'buttons,googlepay');
    source.searchParams.set('enable-funding', 'card');
    payPalScriptPromise = loadScript(source.toString(), 'rmss-paypal-sdk');
    return payPalScriptPromise;
  }

  async function setupPayPal() {
    if (paypalSetupPromise) return paypalSetupPromise;
    paypalSetupPromise = (async () => {
      if (!config?.paypalEnabled || !config?.paypalClientId) {
        showMessage('Checkout desactivado: configura PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en Cloudflare.', 'warning');
        return;
      }
      await loadPayPalSDK();
      if (!window.paypal?.Buttons) throw new Error('PayPal SDK cargó sin el componente Buttons.');
      const host = $('#paypal-buttons');
      if (!host) return;
      host.replaceChildren();
      const wallet = document.createElement('div'); wallet.id = 'paypal-wallet-button'; host.appendChild(wallet);
      const card = document.createElement('div'); card.id = 'paypal-card-button'; card.style.marginTop = '10px'; host.appendChild(card);
      const callbacks = {
        createOrder: async () => {
          const order = await createOrder();
          if (!order?.id || !/^[A-Z0-9-]{5,}$/i.test(order.id)) throw new Error('La API no devolvió una orden de PayPal válida.');
          showMessage(`Orden creada por ${money(order.credits)}. Esperando confirmación de PayPal…`);
          return order.id;
        },
        onApprove: async data => {
          try { await captureOrder(data.orderID); }
          catch (error) { console.error('RMSS PayPal capture:', error); showMessage(error.message || 'No se pudo verificar el pago. No recargues ni repitas la orden hasta revisar tu saldo.', 'error'); }
        },
        onCancel: () => showMessage('Pago cancelado; no se añadieron créditos.'),
        onError: error => { console.error('RMSS PayPal:', error); showMessage('No se pudo completar el pago. Intenta otra vez o revisa la configuración de PayPal.', 'error'); }
      };
      await window.paypal.Buttons({ ...callbacks, fundingSource: window.paypal.FUNDING.PAYPAL, style: { layout: 'vertical', label: 'paypal', shape: 'rect', height: 42 } }).render(wallet);
      try {
        await window.paypal.Buttons({ ...callbacks, fundingSource: window.paypal.FUNDING.CARD, style: { layout: 'vertical', label: 'pay', shape: 'rect', height: 42 } }).render(card);
      } catch (error) {
        console.info('El pago con tarjeta no está habilitado para esta cuenta o país.', error);
        card.textContent = 'El pago con tarjeta no está disponible en esta cuenta o región.';
        card.className = 'muted';
      }
      setupGooglePay().catch(error => {
        console.info('Google Pay no está disponible para esta cuenta/dispositivo:', error);
        const slot = $('#googlepay-button-container');
        if (slot) slot.textContent = 'Google Pay no está disponible en este entorno. Usa PayPal o tarjeta si aparece como opción.';
      });
      showMessage(config.paypalMode === 'live'
        ? 'PayPal está en modo LIVE. Comprueba precios, reembolsos y notificaciones antes de vender.'
        : 'PayPal está en modo SANDBOX. Utiliza cuentas y métodos de pago de prueba.', 'info');
    })();
    try { await paypalSetupPromise; } catch (error) { paypalSetupPromise = null; showMessage(error.message || 'No se pudo iniciar PayPal.', 'error'); }
  }

  async function setupGooglePay() {
    if (googlePaySetupPromise) return googlePaySetupPromise;
    googlePaySetupPromise = (async () => {
      if (!window.paypal?.Googlepay) throw new Error('El SDK de PayPal no expone Google Pay.');
      if (!googlePayScriptPromise) googlePayScriptPromise = loadScript('https://pay.google.com/gp/p/js/pay.js', 'rmss-google-pay-sdk');
      await googlePayScriptPromise;
      if (!window.google?.payments?.api?.PaymentsClient) throw new Error('Google Pay JavaScript API no está disponible.');
      const googlePay = window.paypal.Googlepay();
      const googleConfig = await googlePay.config();
      if (!Array.isArray(googleConfig?.allowedPaymentMethods) || !googleConfig.allowedPaymentMethods.length) throw new Error('La cuenta PayPal no es elegible para Google Pay.');
      let activeOrder = null;
      const paymentsClient = new window.google.payments.api.PaymentsClient({
        environment: config.paypalMode === 'live' ? 'PRODUCTION' : 'TEST',
        paymentDataCallbacks: {
          onPaymentAuthorized: async paymentData => {
            try {
              if (!activeOrder?.id) throw new Error('No se encontró la orden de pago.');
              let status = await googlePay.confirmOrder({ orderId: activeOrder.id, paymentMethodData: paymentData.paymentMethodData });
              if (status.status === 'PAYER_ACTION_REQUIRED') {
                await googlePay.initiatePayerAction({ orderId: activeOrder.id });
                status = { status: 'APPROVED' };
              }
              if (status.status !== 'APPROVED') throw new Error('Google Pay no autorizó la orden.');
              await captureOrder(activeOrder.id);
              activeOrder = null;
              return { transactionState: 'SUCCESS' };
            } catch (error) {
              console.error('RMSS Google Pay:', error);
              showMessage(error.message || 'Error procesando Google Pay.', 'error');
              return { transactionState: 'ERROR', error: { intent: 'PAYMENT_AUTHORIZATION', message: error.message || 'Transaction failed' } };
            }
          }
        }
      });
      const ready = await paymentsClient.isReadyToPay({ apiVersion: 2, apiVersionMinor: 0, allowedPaymentMethods: googleConfig.allowedPaymentMethods });
      if (!ready.result) throw new Error('Este navegador o dispositivo no puede usar Google Pay.');
      const slot = $('#googlepay-button-container');
      if (!slot) return;
      slot.replaceChildren(paymentsClient.createButton({
        buttonType: 'buy', buttonColor: 'black', allowedPaymentMethods: googleConfig.allowedPaymentMethods,
        onClick: async () => {
          try {
            activeOrder = await createOrder();
            const paymentDataRequest = {
              apiVersion: 2, apiVersionMinor: 0, allowedPaymentMethods: googleConfig.allowedPaymentMethods,
              merchantInfo: googleConfig.merchantInfo,
              transactionInfo: { currencyCode: 'USD', totalPriceStatus: 'FINAL', totalPrice: String(activeOrder.amount) },
              callbackIntents: ['PAYMENT_AUTHORIZATION']
            };
            await paymentsClient.loadPaymentData(paymentDataRequest);
          } catch (error) {
            activeOrder = null;
            if (error.statusCode !== 'CANCELED' && error.status !== 'CANCELED') showMessage(error.message || 'Google Pay cancelado o no disponible.', 'error');
          }
        }
      }));
    })();
    try { await googlePaySetupPromise; } catch (error) { googlePaySetupPromise = null; throw error; }
  }

  slider.min = '100'; slider.max = '10000'; slider.step = '100';
  slider.addEventListener('input', updatePrice); updatePrice();
  api('/api/config').then(async result => { config = result; await setupPayPal(); }).catch(error => showMessage(error.message || 'No se pudo consultar la configuración de pagos.', 'error'));
})();
