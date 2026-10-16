(() => {
  'use strict';
  const $=s=>document.querySelector(s);
  const api=window.RMSS?.api;
  if(!api || !$('#credit-slider')) return;
  let cfg=null; let paypalLoaded=false;
  const slider=$('#credit-slider');
  const money=credits=>(Math.round(199+(Number(credits)-100)*1.4)/100).toLocaleString('en-US',{style:'currency',currency:'USD'});
  function updatePrice(){ const c=Number(slider.value);$('#credit-count-choice').textContent=c.toLocaleString();$('#credit-price').textContent=`${money(c)} USD`; }
  slider.addEventListener('input',updatePrice); updatePrice();
  function paymentMessage(text){const el=$('#payment-message');if(el)el.textContent=text;}
  async function createOrder(){ const result=await api('/api/payments/create-order',{method:'POST',body:JSON.stringify({credits:Number(slider.value)})});return result; }
  async function captureOrder(orderID){const result=await api(`/api/payments/${encodeURIComponent(orderID)}/capture`,{method:'POST',body:'{}'});if(result.credits!==undefined){window.RMSS?.refreshUser();paymentMessage(`Pago verificado. Tu saldo ahora es de ${result.credits} créditos.`);}return result;}
  function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=resolve;s.onerror=()=>reject(new Error('No se pudo cargar el SDK del proveedor de pagos.'));document.head.appendChild(s);});}
  async function setupPayPal(){
    if(paypalLoaded||!cfg?.paypalEnabled||!cfg?.paypalClientId)return;
    paypalLoaded=true;
    try {
      const src=`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(cfg.paypalClientId)}&currency=USD&intent=capture&components=buttons,googlepay&enable-funding=card`;
      await loadScript(src);
      const host=$('#paypal-buttons');host.innerHTML='<div id="paypal-wallet-button"></div><div id="paypal-card-button" style="margin-top:10px"></div>';
      if(window.paypal?.Buttons){
        const common={createOrder:async()=>{const o=await createOrder();paymentMessage(`Orden creada por ${o.amount} USD. Esperando confirmación de PayPal…`);return o.id;},onApprove:async data=>{try{await captureOrder(data.orderID);paymentMessage('Pago completado correctamente.');}catch(e){paymentMessage(e.message);}},onCancel:()=>paymentMessage('Pago cancelado; no se añadieron créditos.'),onError:e=>{console.error(e);paymentMessage('No se pudo completar el pago. Intenta de nuevo o revisa la configuración de PayPal.');}};
        await window.paypal.Buttons({...common,fundingSource:window.paypal.FUNDING.PAYPAL,style:{layout:'vertical',label:'paypal',shape:'rect',height:42}}).render('#paypal-wallet-button');
        try { await window.paypal.Buttons({...common,fundingSource:window.paypal.FUNDING.CARD,style:{layout:'vertical',label:'pay',shape:'rect',height:42}}).render('#paypal-card-button'); } catch(e) { console.info('Card funding is not eligible on this account/context.',e); $('#paypal-card-button').innerHTML='<p class="muted" style="font-size:11px">El pago con tarjeta aún no es elegible en esta cuenta o región.</p>'; }
      }
      setupGooglePay().catch(e=>{console.info('Google Pay no disponible todavía',e);$('#googlepay-button-container').innerHTML='<p class="muted" style="font-size:12px">Google Pay no está habilitado para esta cuenta o dispositivo. PayPal y tarjeta siguen siendo opciones si aparecen disponibles.</p>';});
      paymentMessage(cfg.paypalMode==='live'?'PayPal está en modo LIVE. Antes de vender, realiza una compra real de prueba de bajo importe y revisa las políticas de reembolso.':'PayPal está en modo SANDBOX. Prueba solo con cuentas y tarjetas de prueba del entorno de desarrollador.');
    } catch(e){paypalLoaded=false;paymentMessage(e.message);}
  }
  async function setupGooglePay(){
    if(!window.paypal?.Googlepay) return;
    await loadScript('https://pay.google.com/gp/p/js/pay.js');
    const googlePay=window.paypal.Googlepay(); const googleCfg=await googlePay.config();
    if(!googleCfg?.allowedPaymentMethods?.length) throw new Error('Google Pay no es elegible en la cuenta.');
    let activeOrder=null;
    const paymentsClient=new google.payments.api.PaymentsClient({environment:cfg.paypalMode==='live'?'PRODUCTION':'TEST',paymentDataCallbacks:{onPaymentAuthorized:async paymentData=>{
      try {
        if(!activeOrder) throw new Error('No se encontró la orden de pago.');
        let status=await googlePay.confirmOrder({orderId:activeOrder.id,paymentMethodData:paymentData.paymentMethodData});
        if(status.status==='PAYER_ACTION_REQUIRED') { await googlePay.initiatePayerAction({orderId:activeOrder.id}); status={status:'APPROVED'}; }
        if(status.status!=='APPROVED') throw new Error('Google Pay no autorizó la orden.');
        const captured=await captureOrder(activeOrder.id);activeOrder=null;
        return {transactionState:'SUCCESS'};
      } catch(e) { console.error(e);paymentMessage(e.message||'Error procesando Google Pay.');return {transactionState:'ERROR',error:{intent:'PAYMENT_AUTHORIZATION',message:e.message||'Transaction failed'}}; }
    }}});
    const ready=await paymentsClient.isReadyToPay({apiVersion:2,apiVersionMinor:0,allowedPaymentMethods:googleCfg.allowedPaymentMethods});
    if(!ready.result) throw new Error('Este navegador/dispositivo no puede usar Google Pay.');
    const btn=paymentsClient.createButton({buttonType:'buy',buttonColor:'black',allowedPaymentMethods:googleCfg.allowedPaymentMethods,onClick:async()=>{
      try {
        activeOrder=await createOrder();
        const dataRequest={apiVersion:2,apiVersionMinor:0,allowedPaymentMethods:googleCfg.allowedPaymentMethods,merchantInfo:googleCfg.merchantInfo,transactionInfo:{currencyCode:'USD',totalPriceStatus:'FINAL',totalPrice:activeOrder.amount},callbackIntents:['PAYMENT_AUTHORIZATION']};
        await paymentsClient.loadPaymentData(dataRequest);
      } catch(e) { activeOrder=null;if(e.status!==undefined)paymentMessage(e.message);else if(e.statusCode!=='CANCELED')paymentMessage(e.message||'Google Pay cancelado o no disponible.'); }
    }});
    const slot=$('#googlepay-button-container');slot.innerHTML='';slot.appendChild(btn);
  }
  api('/api/config').then(async result=>{cfg=result;if(cfg.paypalEnabled){await setupPayPal();}else paymentMessage('Checkout desactivado: configura el Client ID y el Client Secret de PayPal como secretos/variables en Cloudflare.');}).catch(e=>paymentMessage(e.message));
})();
