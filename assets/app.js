(() => {
  'use strict';
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const page = document.body.dataset.page || '';
  const API_BASE = String(window.RMSS_CONFIG?.apiBaseUrl || '').replace(/\/+$/, '');
  const apiUrl = path => `${API_BASE}${path}`;
  const api = async (path, options={}) => {
    if (window.RMSS_AUTH_READY) { try { await window.RMSS_AUTH_READY; } catch {} }
    let token = null;
    try { if (window.RMSSAuth?.getIdToken) token = await window.RMSSAuth.getIdToken(); } catch {}
    const headers = { ...(options.body && !(options.body instanceof FormData) ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers||{}) };
    const response = await fetch(apiUrl(path), {credentials: API_BASE ? 'omit' : 'same-origin', ...options, headers});
    const type = response.headers.get('content-type') || '';
    if (!response.ok) {
      let msg = `Request failed (${response.status})`;
      if (type.includes('application/json')) { const obj=await response.json().catch(()=>({})); msg=obj.error||msg; }
      else msg=await response.text().catch(()=>msg) || msg;
      const err = new Error(msg); err.status=response.status; throw err;
    }
    return type.includes('application/json') ? response.json() : response;
  };
  window.RMSS = {api, refreshUser:()=>loadUser(true), showToast};
  function showToast(message, ms=4000) {
    const node=$('#toast'); if(!node) { console.log(message); return; }
    node.textContent=message; node.classList.remove('hidden'); clearTimeout(window.__rmToastTimer); window.__rmToastTimer=setTimeout(()=>node.classList.add('hidden'),ms);
  }
  function switchAuthMode(mode) {
    $('#login-form')?.classList.toggle('hidden',mode!=='login'); $('#register-form')?.classList.toggle('hidden',mode!=='register'); setTimeout(renderTurnstile,100);
    $('#show-login')?.classList.toggle('primary',mode==='login'); $('#show-register')?.classList.toggle('primary',mode==='register');
  }
  function redirectAfterLogin() {
    const url=new URL(location.href); const next=url.searchParams.get('next');
    if(next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/api/')) location.href=next;
    else location.href='/index.html';
  }
  async function loadUser(quiet=false) {
    let result;
    try { result=await api('/api/auth/me'); } catch (e) { if(!quiet) showToast(e.message); return null; }
    const user=result.user;
    if(user) {
      $('#auth-screen')?.classList.add('hidden'); $('#app-screen')?.classList.remove('hidden');
      $('#header-credits')?.classList.remove('hidden'); $('#header-credit-count') && ($('#header-credit-count').textContent=user.credits);
      $('#header-username') && ($('#header-username').textContent=user.username);
      $('#welcome-username') && ($('#welcome-username').textContent=user.username);
      $('#stat-credits') && ($('#stat-credits').textContent=user.credits);
      $('#wallet-current') && ($('#wallet-current').textContent=user.credits);
      $('#logout-btn')?.classList.remove('hidden');
      if(page==='home') { await Promise.all([loadProjects(),loadHomeStats()]); }
      if(page==='catalog') await loadCatalog();
      if(page==='downloads') await loadDownloads();
      return user;
    }
    $('#header-credit-count') && ($('#header-credit-count').textContent='—');
    $('#header-username') && ($('#header-username').textContent='');
    $('#logout-btn')?.classList.add('hidden');
    if(page==='home') { $('#auth-screen')?.classList.remove('hidden'); $('#app-screen')?.classList.add('hidden'); }
    else if(page==='catalog') { await loadCatalog(); }
    else { location.replace(`/index.html?next=${encodeURIComponent(location.pathname+location.search)}`); }
    return null;
  }
  async function loadHomeStats() {
    try {
      const [projects, downloads]=await Promise.all([api('/api/projects'),api('/api/downloads')]);
      $('#stat-projects') && ($('#stat-projects').textContent=projects.projects.length);
      $('#stat-exports') && ($('#stat-exports').textContent=downloads.exports.length);
    } catch(e) { if(e.status===401) return; console.warn(e); }
  }
  function studioPath(studio,id) { const slug=studio==='calendar'?'calendar':studio==='gif'?'gif':'skin'; return `/studios/${slug}.html?project=${encodeURIComponent(id)}`; }
  async function loadProjects() {
    const holder=$('#projects-list'); if(!holder) return;
    try {
      const {projects}=await api('/api/projects');
      if(!projects.length) { holder.innerHTML='<div class="empty-state">Todavía no tienes proyectos guardados. Abre uno de los estudios y pulsa <strong>Guardar proyecto</strong>.</div>'; return; }
      holder.innerHTML=projects.map(p=>`<div class="project-row"><div><h4>${escapeHtml(p.name)}</h4><p>${escapeHtml(labelStudio(p.studio))} · Actualizado ${escapeHtml(new Date(p.updated_at).toLocaleString())}</p></div><div style="display:flex;gap:7px;flex-wrap:wrap"><a class="button small" href="${studioPath(p.studio,p.id)}">Abrir proyecto</a><button class="small danger" data-delete-project="${p.id}">Eliminar</button></div></div>`).join('');
      $$('[data-delete-project]').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('¿Eliminar definitivamente este proyecto guardado?'))return;try{await api(`/api/projects/${encodeURIComponent(btn.dataset.deleteProject)}`,{method:'DELETE'});showToast('Proyecto eliminado.');await loadProjects();await loadHomeStats();}catch(e){showToast(e.message);}}));
    } catch(e) { holder.innerHTML=`<div class="empty-state">${escapeHtml(e.message)}</div>`; }
  }
  function labelStudio(studio) { return ({skin:'Skin Studio',calendar:'Calendar Studio',gif:'GIF Studio'})[studio]||studio; }
  function escapeHtml(value) { return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  async function loadCatalog() {
    const holder=$('#catalog-list'); if(!holder)return;
    try {
      const {items}=await api('/api/catalog');
      if(!items.length) { holder.innerHTML='<div class="empty-state">El catálogo aún está vacío. Cuando publiques un producto desde el panel administrativo, aparecerá aquí.</div>'; return; }
      holder.innerHTML=items.map(item=>`<article class="card catalog-item"><div><div class="section-label">${item.kind==='zip'?'Paquete Rainmeter':'Rainmeter skin'}</div><h3 style="margin:7px 0">${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description||'Descarga lista para Rainmeter.')}</p><div class="rainmeter-preview" style="margin:14px 0;background:#080d16;border:1px solid #27364a;border-radius:12px;padding:10px;min-height:160px;display:grid;place-items:center;overflow:hidden">${item.has_preview_image?`<img src="${API_BASE}/api/catalog/${encodeURIComponent(item.id)}/preview-image" alt="Captura de ${escapeHtml(item.name)} en Rainmeter" loading="lazy" style="width:100%;max-height:330px;object-fit:contain" data-preview-image="${item.id}">`:item.has_preview_svg?`<img src="${API_BASE}/api/catalog/${encodeURIComponent(item.id)}/preview.svg" alt="Preview visual aproximada de ${escapeHtml(item.name)}" loading="lazy" style="width:100%;max-height:330px;object-fit:contain" data-preview-image="${item.id}">`:'<div class="muted" style="padding:24px;text-align:center">Preview pendiente: sube un INI compatible o una captura de respaldo desde el admin.</div>'}</div>${item.variants&&item.variants.length>1?`<label class="muted" style="display:block;font-size:12px;margin:8px 0">Variante visual <select data-variant-item="${item.id}" style="margin-left:8px;max-width:220px;background:#0a111d;color:#fff;border:1px solid #34445d;padding:7px;border-radius:8px">${item.variants.map((v,i)=>`<option value="${v.id}" ${i===0?'selected':''}>${escapeHtml(v.label)}</option>`).join('')}</select></label>`:''}${item.has_preview_image&&item.has_preview_svg?`<details style="margin:8px 0"><summary style="cursor:pointer;color:var(--accent)">Ver captura original</summary><img src="${API_BASE}/api/catalog/${encodeURIComponent(item.id)}/preview-image" alt="Captura de respaldo" loading="lazy" style="width:100%;max-height:330px;object-fit:contain;margin-top:10px"></details>`:''}${item.variant_count>1?`<p class="muted" style="font-size:12px">${item.variant_count} variantes incluidas en el producto</p>`:''}<span class="status">${item.price_credits===0?'Gratis':`${item.price_credits} créditos`}</span></div><button class="primary" data-buy-item="${item.id}">${item.price_credits===0?'Descargar gratis':'Obtener descarga'}</button></article>`).join('');
      $$('[data-variant-item]').forEach(select=>select.addEventListener('change',()=>{const img=holder.querySelector(`[data-preview-image="${select.dataset.variantItem}"]`);if(img)img.src=`${API_BASE}/api/catalog/${encodeURIComponent(select.dataset.variantItem)}/variants/${encodeURIComponent(select.value)}/preview.svg`;}));
      $$('[data-buy-item]').forEach(btn=>btn.addEventListener('click',async()=>{btn.disabled=true;try{const response=await api(`/api/catalog/${encodeURIComponent(btn.dataset.buyItem)}/download`,{method:'POST',body:'{}'});await downloadResponse(response,`RMSS-Download`);const balance=response.headers.get('X-RM-Credits-Remaining');if(balance)syncCreditDisplay(Number(balance));showToast('Descarga preparada.');}catch(e){showToast(e.message);if(e.status===402) location.href='/index.html#credits';else if(e.status===401) location.href='/index.html';}finally{btn.disabled=false;}}));
    } catch(e) { holder.innerHTML=`<div class="empty-state">${escapeHtml(e.message)}</div>`; }
  }
  async function loadDownloads() {
    try {
      const data=await api('/api/downloads'); const down=$('#my-downloads-list'), ex=$('#my-exports-list');
      if(down) down.innerHTML=data.downloads.length?data.downloads.map(d=>`<div class="project-row"><div><h4>${escapeHtml(d.item_name)}</h4><p>Descargado ${escapeHtml(new Date(d.created_at).toLocaleString())} · ${d.credits_charged} créditos</p></div><button class="small" data-redownload-item="${d.id}">Descargar de nuevo</button></div>`).join(''):'<div class="empty-state">Aquí aparecerán los productos que obtengas desde el catálogo.</div>';
      if(ex) ex.innerHTML=data.exports.length?data.exports.map(e=>`<div class="project-row"><div><h4>${escapeHtml(e.project_name)}</h4><p>${escapeHtml(labelStudio(e.studio))} · ${escapeHtml(new Date(e.created_at).toLocaleString())} · ${e.credits_charged} créditos</p></div><button class="small" data-redownload="${e.id}">Descargar ZIP de nuevo</button></div>`).join(''):'<div class="empty-state">Todavía no has exportado ningún proyecto.</div>';
      $$('[data-redownload]').forEach(btn=>btn.addEventListener('click',async()=>{btn.disabled=true;try{const response=await api(`/api/exports/${encodeURIComponent(btn.dataset.redownload)}/download`);await downloadResponse(response,'RMSS-Export');showToast('ZIP descargado.');}catch(e){showToast(e.message);}finally{btn.disabled=false;}}));
      $$('[data-redownload-item]').forEach(btn=>btn.addEventListener('click',async()=>{btn.disabled=true;try{const response=await api(`/api/downloads/${encodeURIComponent(btn.dataset.redownloadItem)}/download`);await downloadResponse(response,'RMSS-Download');showToast('Descargable recuperado.');}catch(e){showToast(e.message);}finally{btn.disabled=false;}}));
    } catch(e) { if(e.status!==401) showToast(e.message); }
  }
  function syncCreditDisplay(balance) {
    for(const id of ['header-credit-count','stat-credits','wallet-current']) { const el=$(`#${id}`); if(el) el.textContent=balance; }
  }
  async function downloadResponse(response,fallback) {
    const blob=await response.blob(); const disp=response.headers.get('Content-Disposition')||''; const match=disp.match(/filename="?([^";]+)"?/i); const file=match?.[1]||`${fallback}.zip`;
    const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=file;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  function captchaToken(action) { const slot=$(`[data-turnstile-action="${action}"]`); if(!window.RMSS_CONFIG?.turnstileSiteKey || window.RMSS_CONFIG.turnstileSiteKey.startsWith('REPLACE-')) throw new Error('El administrador todavía no configuró la clave pública de Cloudflare Turnstile.'); const id=slot?.dataset.turnstileWidget; const token=id && window.turnstile ? window.turnstile.getResponse(id) : ''; if(!token) throw new Error('Completa el CAPTCHA de Cloudflare antes de continuar.'); return token; }
  function renderTurnstile() { const key=window.RMSS_CONFIG?.turnstileSiteKey; if(!key || key.startsWith('REPLACE-')) return; document.querySelectorAll('.turnstile-slot').forEach(slot=>{ if(slot.dataset.turnstileWidget || !window.turnstile || (slot.closest('form')?.classList.contains('hidden')) || slot.closest('details:not([open])')) return; const id=window.turnstile.render(slot,{sitekey:key,action:slot.dataset.turnstileAction,theme:'dark',callback:()=>{},'expired-callback':()=>{}}); slot.dataset.turnstileWidget=String(id); }); }
  if(window.RMSS_CONFIG?.turnstileSiteKey && !window.RMSS_CONFIG.turnstileSiteKey.startsWith('REPLACE-')) { const script=document.createElement('script'); script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async=true; script.defer=true; script.onload=renderTurnstile; document.head.appendChild(script); }
  document.querySelectorAll('details').forEach(el=>el.addEventListener('toggle',()=>setTimeout(renderTurnstile,100)));
  $('#show-login')?.addEventListener('click',()=>switchAuthMode('login'));
  $('#show-register')?.addEventListener('click',()=>switchAuthMode('register'));
  function authClient() {
    if (!window.RMSSAuth) throw new Error(window.RMSSAuthSetupError || 'Firebase Auth todavía no está configurado.');
    return window.RMSSAuth;
  }
  async function turnstileValue(action) {
    await (window.RMSS_AUTH_READY || Promise.resolve());
    const slot = $(`[data-turnstile-action="${action}"]`);
    if (!window.RMSS_CONFIG?.turnstileSiteKey || window.RMSS_CONFIG.turnstileSiteKey.startsWith('REPLACE-')) throw new Error('El administrador debe configurar la Site Key de Cloudflare Turnstile.');
    const id=slot?.dataset.turnstileWidget; const token=id&&window.turnstile?window.turnstile.getResponse(id):'';
    if(!token) throw new Error('Completa el CAPTCHA de Cloudflare antes de continuar.');
    return token;
  }
  async function runGoogleLogin(mode) {
    const action = mode === 'register' ? 'register' : 'login';
    const message = $(mode === 'register' ? '#register-message' : '#login-message');
    const button = $(mode === 'register' ? '#google-register-btn' : '#google-login-btn');
    button.disabled = true; if(message) message.textContent='Conectando con Google…';
    try {
      const token = await turnstileValue(action);
      await authClient().continueWithGoogle({turnstileAction:action, turnstileToken:token});
      if(message) message.textContent='Sesión iniciada con Google.';
      redirectAfterLogin();
    } catch(e) { if(message) message.textContent=e.message; }
    finally { button.disabled=false; const slot=$(`[data-turnstile-action="${action}"]`); if(slot?.dataset.turnstileWidget&&window.turnstile)window.turnstile.reset(slot.dataset.turnstileWidget); }
  }
  $('#login-form')?.addEventListener('submit',async(e)=>{
    e.preventDefault();const message=$('#login-message');message.textContent='Validando cuenta…';const button=$('#login-form button[type="submit"]');if(button)button.disabled=true;
    try { const turnstileToken=await turnstileValue('login'); await authClient().login({email:$('#login-identity').value,password:$('#login-password').value,turnstileToken}); message.textContent='Sesión iniciada.'; redirectAfterLogin(); }
    catch(err){message.textContent=err.message;}
    finally {if(button)button.disabled=false;const slot=$('[data-turnstile-action="login"]');if(slot?.dataset.turnstileWidget&&window.turnstile)window.turnstile.reset(slot.dataset.turnstileWidget);}
  });
  $('#register-form')?.addEventListener('submit',async(e)=>{
    e.preventDefault();const message=$('#register-message');message.textContent='Creando cuenta…';const button=$('#register-form button[type="submit"]');if(button)button.disabled=true;
    try { if($('#register-password').value!==$('#register-password-confirm').value) throw new Error('Las contraseñas no coinciden.'); if($('#register-password').value.length<10)throw new Error('La contraseña debe tener al menos 10 caracteres.'); const turnstileToken=await turnstileValue('register'); const result=await authClient().register({username:$('#register-username').value,email:$('#register-email').value,password:$('#register-password').value,turnstileToken}); message.textContent=result.message||'Cuenta creada. Revisa tu correo y verifica la dirección antes de iniciar sesión.'; $('#register-password').value='';$('#register-password-confirm').value=''; $('#register-email').value=''; }
    catch(err){message.textContent=err.message;}
    finally {if(button)button.disabled=false;const slot=$('[data-turnstile-action="register"]');if(slot?.dataset.turnstileWidget&&window.turnstile)window.turnstile.reset(slot.dataset.turnstileWidget);}
  });
  $('#google-login-btn')?.addEventListener('click',()=>runGoogleLogin('login'));
  $('#google-register-btn')?.addEventListener('click',()=>runGoogleLogin('register'));
  $('#reset-password-btn')?.addEventListener('click',async()=>{const out=$('#reset-message');const button=$('#reset-password-btn');out.textContent='Enviando instrucciones…';button.disabled=true;try{const token=await turnstileValue('password-reset');const result=await authClient().resetPassword({email:$('#reset-email').value,turnstileToken:token});out.textContent=result.message;}catch(e){out.textContent=e.message;}finally{button.disabled=false;const slot=$('[data-turnstile-action="password-reset"]');if(slot?.dataset.turnstileWidget&&window.turnstile)window.turnstile.reset(slot.dataset.turnstileWidget);}});
  $('#logout-btn')?.addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST',body:'{}'});}catch{}try{if(window.RMSSAuth)await window.RMSSAuth.signOut();}catch{}sessionStorage.removeItem('rm_session_token');location.href='/index.html';});
  document.querySelectorAll('a[href="#credits"]').forEach(a=>a.addEventListener('click',()=>$('#credit-slider')?.focus()));
  $('#year') && ($('#year').textContent=new Date().getFullYear());
  if(page==='home') {
    const url=new URL(location.href); if(url.searchParams.has('register')) switchAuthMode('register');
  }
  loadUser(false);
})();
