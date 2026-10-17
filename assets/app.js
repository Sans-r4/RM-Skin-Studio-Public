(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const page = document.body.dataset.page || '';
  document.addEventListener('click', event => { const toggle=event.target.closest('.rmss-profile-toggle'); const menus=[...document.querySelectorAll('.rmss-profile-menu')]; if(toggle){const menu=toggle.parentElement.querySelector('.rmss-profile-menu');const open=menu?.hidden;menus.forEach(m=>m.hidden=true);document.querySelectorAll('.rmss-profile-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));if(menu){menu.hidden=!open;toggle.setAttribute('aria-expanded',String(!!open));}}else if(!event.target.closest('.rmss-profile-menu')){menus.forEach(m=>m.hidden=true);document.querySelectorAll('.rmss-profile-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));}});
  window.addEventListener('rmss:user-state', event => { const u=event.detail?.user; const name=u?.username||'Cuenta'; document.querySelectorAll('#header-username,#rmss-menu-username').forEach(n=>n.textContent=name); });

  const API_BASE = String(window.RMSS_CONFIG?.apiBaseUrl || '').replace(/\/+$/, '');
  const apiUrl = path => `${API_BASE}${path}`;
  let suspendHandling = false;
  let resolveUserReady;
  window.RMSS_USER_READY = new Promise(resolve => { resolveUserReady = resolve; });

  function showToast(message, ms = 4200) {
    const node = $('#toast');
    if (!node) { console.log(message); return; }
    node.textContent = String(message || '');
    node.classList.remove('hidden');
    clearTimeout(window.__rmToastTimer);
    window.__rmToastTimer = setTimeout(() => node.classList.add('hidden'), ms);
  }

  function showSuspensionDialog(message) {
    return new Promise(resolve => {
      const old = document.getElementById('rmss-suspension-dialog'); old?.remove();
      const dialog = document.createElement('dialog'); dialog.id = 'rmss-suspension-dialog'; dialog.className = 'rmss-ban-dialog';
      const heading = document.createElement('h2'); heading.textContent = 'Cuenta suspendida';
      const copy = document.createElement('p'); copy.textContent = String(message || 'Esta cuenta no puede utilizar RM Skin Studio mientras la suspensión esté activa.').replace(/^Account suspended:?\s*/i, '') || 'Esta cuenta no puede utilizar RM Skin Studio mientras la suspensión esté activa.';
      const button = document.createElement('button'); button.type = 'button'; button.className = 'primary'; button.textContent = 'Entendido';
      dialog.append(heading, copy, button); document.body.appendChild(dialog);
      let done = false; const finish = () => { if (done) return; done = true; try { dialog.close(); } catch {} dialog.remove(); resolve(); };
      button.addEventListener('click', finish); dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
      if (typeof dialog.showModal === 'function') dialog.showModal(); else { alert(`${heading.textContent}\n\n${copy.textContent}`); finish(); }
    });
  }
  window.addEventListener('rmss:account-suspended', event => {
    const data = event.detail || {};
    const details = [];
    if (data.reason) details.push(`Motivo: ${data.reason}`);
    if (data.banned_until) details.push(`La suspensión termina: ${new Date(data.banned_until).toLocaleString()}`);
    else details.push('Duración: indefinida');
    handleSuspended(`Account suspended${details.length ? `: ${details.join(' · ')}` : ''}`);
  });

  async function handleSuspended(message = 'Account suspended') {
    if (suspendHandling) return;
    suspendHandling = true;
    try { await window.RMSSAuth?.signOut(); } catch {}
    try { sessionStorage.removeItem('rm_session_token'); sessionStorage.removeItem('rm_pending_studio_action'); } catch {}
    window.RMSS_CURRENT_USER = null;
    document.body.classList.remove('rmss-premium');
    $$('.ad-slot').forEach(slot => { slot.hidden = true; slot.replaceChildren(); });
    window.dispatchEvent(new CustomEvent('rmss:user-state', { detail: { user: null, suspended: true } }));
    await showSuspensionDialog(message);
    if (page === 'home') {
      $('#app-screen')?.classList.add('hidden');
      $('#auth-screen')?.classList.remove('hidden');
      document.documentElement.classList.remove('rmss-auth-pending');
    } else location.replace('/index.html?account=suspended');
    suspendHandling = false;
  }

  async function api(path, options = {}) {
    if (window.RMSS_AUTH_READY) { try { await window.RMSS_AUTH_READY; } catch {} }
    let token = null;
    try { if (window.RMSSAuth?.getIdToken) token = await window.RMSSAuth.getIdToken(); } catch {}
    const headers = {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };
    const response = await fetch(apiUrl(path), { credentials: API_BASE ? 'omit' : 'same-origin', ...options, headers });
    const type = response.headers.get('content-type') || '';
    if (!response.ok) {
      let msg = `Request failed (${response.status})`;
      if (type.includes('application/json')) {
        const obj = await response.json().catch(() => ({})); msg = obj.error || msg;
        if (response.status === 403 && /^account suspended$/i.test(String(obj.error||''))) {
          const details=[];
          if (obj.reason) details.push(`Motivo: ${obj.reason}`);
          if (obj.banned_until) details.push(`La suspensión termina: ${new Date(obj.banned_until).toLocaleString()}`);
          else details.push('Duración: indefinida');
          if (details.length) msg += `: ${details.join(' · ')}`;
        }
      } else msg = await response.text().catch(() => msg) || msg;
      const error = new Error(msg); error.status = response.status;
      if (response.status === 403 && /account suspended/i.test(msg)) await handleSuspended(msg);
      throw error;
    }
    return type.includes('application/json') ? response.json() : response;
  }

  window.RMSS = { api, refreshUser: () => loadUser(true), showToast, handleSuspended };

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
  function labelStudio(studio) { return ({ skin:'Skin Studio', calendar:'Calendar Studio', gif:'GIF Studio' })[studio] || studio; }
  function studioPath(studio, id) { const slug = studio === 'calendar' ? 'calendar' : studio === 'gif' ? 'gif' : 'skin'; return `/studios/${slug}.html?project=${encodeURIComponent(id)}`; }

  function setUser(user) {
    window.RMSS_CURRENT_USER = user || null;
    const isSignedIn = !!user;
    $('#header-credit-pill')?.classList.toggle('hidden', !isSignedIn);
    $('#header-credit-count') && ($('#header-credit-count').textContent = isSignedIn ? String(user.credits ?? 0) : '—');
    $('#header-username') && ($('#header-username').textContent = isSignedIn ? user.username : '');
    $('#logout-btn')?.classList.toggle('hidden', !isSignedIn);
    $('#welcome-username') && ($('#welcome-username').textContent = user?.username || 'creador');
    $('#stat-credits') && ($('#stat-credits').textContent = isSignedIn ? String(user.credits ?? 0) : '0');
    $('#wallet-current') && ($('#wallet-current').textContent = isSignedIn ? String(user.credits ?? 0) : '0');
    const badge = $('#header-premium-badge');
    if (user?.is_premium) {
      if (badge) badge.classList.remove('hidden');
      else if ($('.header-account')) { const b = document.createElement('span'); b.id = 'header-premium-badge'; b.className = 'rmss-premium-label'; b.textContent = 'Premium'; $('.header-account').insertBefore(b, $('#logout-btn')); }
    } else badge?.remove();
    document.body.classList.toggle('rmss-premium', Number(user?.is_premium || 0) === 1);
    window.dispatchEvent(new CustomEvent('rmss:user-state', { detail: { user: user || null } }));
    window.dispatchEvent(new CustomEvent('rmss:premium-updated', { detail: { is_premium: Number(user?.is_premium || 0) === 1 } }));
  }

  function redirectAfterLogin() {
    const url = new URL(location.href); const next = url.searchParams.get('next');
    if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/api/')) location.href = next;
    else location.href = '/index.html';
  }

  function switchAuthMode(mode) {
    $('#login-form')?.classList.toggle('hidden', mode !== 'login');
    $('#register-form')?.classList.toggle('hidden', mode !== 'register');
    $('#reset-panel')?.classList.add('hidden');
    $$('[data-target]').forEach(button => button.classList.toggle('active', button.dataset.target === `${mode}-form`));
    setTimeout(renderTurnstile, 100);
  }

  async function loadHomeStats() {
    try {
      const [projects, downloads] = await Promise.all([api('/api/projects'), api('/api/downloads')]);
      $('#stat-projects') && ($('#stat-projects').textContent = projects.projects.length);
      $('#stat-exports') && ($('#stat-exports').textContent = downloads.exports.length);
    } catch (error) { if (error.status !== 401 && error.status !== 403) console.warn(error); }
  }

  async function loadProjects() {
    const holder = $('#projects-list'); if (!holder) return;
    try {
      const { projects } = await api('/api/projects');
      if (!projects.length) { holder.innerHTML = '<div class="empty-state">Todavía no tienes proyectos guardados. Abre uno de los estudios y pulsa <strong>Guardar proyecto</strong>.</div>'; return; }
      holder.innerHTML = projects.map(project => `<div class="project-row"><div><h4>${escapeHtml(project.name)}</h4><p>${escapeHtml(labelStudio(project.studio))} · Actualizado ${escapeHtml(new Date(project.updated_at).toLocaleString())}</p></div><div class="row-actions"><a class="button small" href="${studioPath(project.studio, project.id)}">Abrir proyecto</a><button class="small danger" data-delete-project="${escapeHtml(project.id)}">Eliminar</button></div></div>`).join('');
      $$('[data-delete-project]').forEach(button => button.addEventListener('click', async () => {
        if (!confirm('¿Eliminar definitivamente este proyecto guardado?')) return;
        try { await api(`/api/projects/${encodeURIComponent(button.dataset.deleteProject)}`, { method:'DELETE' }); showToast('Proyecto eliminado.'); await loadProjects(); await loadHomeStats(); }
        catch (error) { showToast(error.message); }
      }));
    } catch (error) { holder.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
  }

  async function loadCatalog() {
    const holder = $('#catalog-list'); if (!holder) return;
    try {
      const { items = [] } = await api('/api/catalog');
      if (!items.length) { holder.innerHTML = '<div class="empty-state">El catálogo aún está vacío. Cuando publiques un producto desde el panel administrativo, aparecerá aquí.</div>'; return; }
      holder.innerHTML = items.map(item => {
        const previewUrl = item.has_preview_image ? `${API_BASE}/api/catalog/${encodeURIComponent(item.id)}/preview-image` : item.has_preview_svg ? `${API_BASE}/api/catalog/${encodeURIComponent(item.id)}/preview.svg` : '';
        const previewMarkup = previewUrl ? `<img src="${previewUrl}" alt="Vista previa visual de ${escapeHtml(item.name)}" loading="lazy" class="catalog-preview-image" data-preview-image="${escapeHtml(item.id)}">` : '<div class="muted preview-empty">Preview pendiente: sube un INI compatible o una captura de respaldo desde el admin.</div>';
        const variants = Array.isArray(item.variants) ? item.variants : [];
        const selector = variants.length ? `<label class="variant-select-label">Variante visual <select data-variant-item="${escapeHtml(item.id)}" class="variant-select">${variants.map((variant, index) => `<option value="${escapeHtml(variant.id)}" ${index===0?'selected':''}>${escapeHtml(variant.label)}</option>`).join('')}</select></label>` : '';
        const credits = Number(item.price_credits || 0); const dollars = Number(item.usd_equivalent ?? credits / 100).toFixed(2);
        return `<article class="card catalog-item"><div><div class="section-label">${item.kind === 'zip' ? 'Paquete Rainmeter' : 'Rainmeter skin'}</div><h3 class="catalog-title">${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description || 'Descarga lista para Rainmeter.')}</p><div class="rainmeter-preview">${previewMarkup}</div>${selector}${item.variant_count>1?`<p class="muted small-text">${Number(item.variant_count)} variantes incluidas en el producto</p>`:''}<span class="status">${credits===0?'Gratis':`${credits} créditos · $${dollars} USD`}</span></div><button class="primary" data-buy-item="${escapeHtml(item.id)}">${credits===0?'Descargar gratis':'Obtener descarga'}</button></article>`;
      }).join('');
      $$('[data-variant-item]').forEach(select => select.addEventListener('change', () => {
        const img = holder.querySelector(`[data-preview-image="${CSS.escape(select.dataset.variantItem)}"]`);
        if (img) img.src = `${API_BASE}/api/catalog/${encodeURIComponent(select.dataset.variantItem)}/variants/${encodeURIComponent(select.value)}/preview.svg`;
      }));
      $$('[data-buy-item]').forEach(button => button.addEventListener('click', async () => {
        button.disabled = true;
        const pendingTab = window.open('about:blank', '_blank');
        if (pendingTab) try { pendingTab.opener = null; } catch {}
        try {
          const result = await api(`/api/catalog/${encodeURIComponent(button.dataset.buyItem)}/download`, { method:'POST', body:'{}' });
          if (result?.externalUrl) {
            if (pendingTab) pendingTab.location.href = result.externalUrl;
            else window.location.href = result.externalUrl;
            showToast('Abriendo el enlace de descarga externo.');
          } else {
            pendingTab?.close();
            await downloadResponse(result, 'RMSS-Download');
            const balance = result.headers?.get('X-RM-Credits-Remaining');
            if (balance !== null && balance !== undefined) syncCreditDisplay(Number(balance));
            else if (result.creditsRemaining !== undefined) syncCreditDisplay(Number(result.creditsRemaining));
            showToast('Descarga preparada.');
          }
          if (window.RMSS_CURRENT_USER) await loadUser(true);
        } catch (error) {
          pendingTab?.close(); showToast(error.message);
          if (error.status === 402) location.href = '/index.html#credits';
          else if (error.status === 401) location.href = `/index.html?next=${encodeURIComponent(location.pathname+location.search)}`;
        } finally { button.disabled = false; }
      }));
    } catch (error) { holder.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; }
  }

  async function loadDownloads() {
    const holder = $('#downloads-list');
    try {
      const data = await api('/api/downloads');
      const down = $('#my-downloads-list') || holder;
      const ex = $('#my-exports-list');
      if (down) down.innerHTML = data.downloads.length ? data.downloads.map(d => `<div class="project-row"><div><h4>${escapeHtml(d.item_name)}</h4><p>Descargado ${escapeHtml(new Date(d.created_at).toLocaleString())} · ${d.credits_charged} créditos ($${(Number(d.credits_charged||0)/100).toFixed(2)} USD)</p></div><button class="small" data-redownload-item="${escapeHtml(d.id)}">Descargar de nuevo</button></div>`).join('') : '<div class="empty-state">Aquí aparecerán los productos que obtengas desde el catálogo.</div>';
      if (ex) ex.innerHTML = data.exports.length ? data.exports.map(item => `<div class="project-row"><div><h4>${escapeHtml(item.project_name)}</h4><p>${escapeHtml(labelStudio(item.studio))} · ${escapeHtml(new Date(item.created_at).toLocaleString())} · ${item.credits_charged} créditos ($${(Number(item.credits_charged||0)/100).toFixed(2)} USD)</p></div><button class="small" data-redownload="${escapeHtml(item.id)}">Descargar ZIP de nuevo</button></div>`).join('') : '<div class="empty-state">Todavía no has exportado ningún proyecto.</div>';
      $$('[data-redownload], [data-redownload-item]').forEach(button => button.addEventListener('click', async () => {
        const isItem = button.hasAttribute('data-redownload-item'); const id = isItem ? button.dataset.redownloadItem : button.dataset.redownload;
        const pendingTab = isItem ? window.open('about:blank', '_blank') : null; if (pendingTab) try { pendingTab.opener = null; } catch {}
        button.disabled = true;
        try {
          const result = await api(isItem ? `/api/downloads/${encodeURIComponent(id)}/download` : `/api/exports/${encodeURIComponent(id)}/download`);
          if (result?.externalUrl) { if (pendingTab) pendingTab.location.href = result.externalUrl; else window.location.href = result.externalUrl; }
          else { pendingTab?.close(); await downloadResponse(result, isItem ? 'RMSS-Download' : 'RMSS-Export'); }
          showToast('Descarga preparada.');
        } catch (error) { pendingTab?.close(); showToast(error.message); }
        finally { button.disabled = false; }
      }));
    } catch (error) { if (holder) holder.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; if (error.status !== 401 && error.status !== 403) showToast(error.message); }
  }

  function syncCreditDisplay(balance) {
    for (const id of ['header-credit-count','stat-credits','wallet-current']) { const el = $(`#${id}`); if (el) el.textContent = balance; }
    if (window.RMSS_CURRENT_USER) window.RMSS_CURRENT_USER.credits = Number(balance);
  }
  async function downloadResponse(response, fallback) {
    if (response && response.externalUrl) { window.location.href = response.externalUrl; return; }
    if (!response || typeof response.blob !== 'function') throw new Error('Respuesta de descarga no válida.');
    const blob = await response.blob();
    const disp = response.headers.get('Content-Disposition') || '';
    const match = disp.match(/filename="?([^";]+)"?/i);
    const file = match?.[1] || `${fallback}.zip`;
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = file; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function authClient() {
    if (!window.RMSSAuth) throw new Error(window.RMSSAuthSetupError || 'Firebase Auth todavía no está configurado.');
    return window.RMSSAuth;
  }
  function switchAuthModeFromTab(event) {
    const target = event.currentTarget?.dataset?.target;
    if (target === 'login-form') switchAuthMode('login');
    else if (target === 'register-form') switchAuthMode('register');
  }
  $$('[data-target="login-form"], [data-target="register-form"]').forEach(button => button.addEventListener('click', switchAuthModeFromTab));
  $('#show-reset-password')?.addEventListener('click', () => { $('#reset-panel')?.classList.toggle('hidden'); $('#login-form')?.classList.add('hidden'); $('#register-form')?.classList.add('hidden'); setTimeout(renderTurnstile, 100); });

  function renderTurnstile() {
    const key = window.RMSS_CONFIG?.turnstileSiteKey;
    if (!key || key.startsWith('REPLACE-') || !window.turnstile) return;
    document.querySelectorAll('.turnstile-slot').forEach(slot => {
      if (slot.dataset.turnstileWidget || slot.closest('form.hidden') || slot.closest('#reset-panel.hidden')) return;
      try { const id = window.turnstile.render(slot, { sitekey:key, action:slot.dataset.turnstileAction, theme:'dark', callback:()=>{}, 'expired-callback':()=>{} }); slot.dataset.turnstileWidget = String(id); }
      catch (error) { console.warn('No se pudo crear el widget Turnstile:', error); }
    });
  }
  function turnstileToken(action) {
    const slot = $(`[data-turnstile-action="${action}"]`);
    if (!window.RMSS_CONFIG?.turnstileSiteKey || window.RMSS_CONFIG.turnstileSiteKey.startsWith('REPLACE-')) throw new Error('El administrador debe configurar la Site Key de Cloudflare Turnstile.');
    const id = slot?.dataset.turnstileWidget; const token = id && window.turnstile ? window.turnstile.getResponse(id) : '';
    if (!token) throw new Error('Completa la verificación CAPTCHA de Cloudflare antes de continuar.');
    return token;
  }
  if (window.RMSS_CONFIG?.turnstileSiteKey && !window.RMSS_CONFIG.turnstileSiteKey.startsWith('REPLACE-')) {
    const script = document.createElement('script'); script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; script.async = true; script.defer = true; script.onload = renderTurnstile; document.head.appendChild(script);
  }
  document.querySelectorAll('details').forEach(node => node.addEventListener('toggle', () => setTimeout(renderTurnstile, 100)));

  async function runGoogleLogin(mode) {
    const action = mode === 'register' ? 'register' : 'login';
    const message = $(mode === 'register' ? '#register-message' : '#login-message');
    const button = $(mode === 'register' ? '#google-register-btn' : '#google-login-btn');
    if (button) button.disabled = true; if (message) message.textContent = 'Conectando con Google…';
    try {
      const token = turnstileToken(action);
      await authClient().continueWithGoogle({ turnstileAction:action, turnstileToken:token });
      if (message) message.textContent = 'Sesión iniciada con Google.';
      redirectAfterLogin();
    } catch (error) { if (message) message.textContent = error.message; }
    finally { if (button) button.disabled = false; const slot = $(`[data-turnstile-action="${action}"]`); if (slot?.dataset.turnstileWidget && window.turnstile) window.turnstile.reset(slot.dataset.turnstileWidget); }
  }
  $('#login-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const message = $('#login-message'); message.textContent = 'Validando cuenta…'; const button = $('#login-form button[type="submit"]'); if (button) button.disabled = true;
    try { const turnstile = turnstileToken('login'); await authClient().login({ email:$('#login-identity').value, password:$('#login-password').value, turnstileToken:turnstile }); message.textContent = 'Sesión iniciada.'; redirectAfterLogin(); }
    catch (error) { message.textContent = error.message; }
    finally { if (button) button.disabled = false; const slot = $('[data-turnstile-action="login"]'); if (slot?.dataset.turnstileWidget && window.turnstile) window.turnstile.reset(slot.dataset.turnstileWidget); }
  });
  $('#register-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const message = $('#register-message'); message.textContent = 'Creando cuenta…'; const button = $('#register-form button[type="submit"]'); if (button) button.disabled = true;
    try {
      if ($('#register-password').value !== $('#register-password-confirm').value) throw new Error('Las contraseñas no coinciden.');
      if ($('#register-password').value.length < 10) throw new Error('La contraseña debe tener al menos 10 caracteres.');
      const turnstile = turnstileToken('register');
      const result = await authClient().register({ username:$('#register-username').value, email:$('#register-email').value, password:$('#register-password').value, turnstileToken:turnstile });
      message.textContent = result.message || 'Cuenta creada. Revisa tu correo y verifica la dirección antes de iniciar sesión.';
      $('#register-password').value = ''; $('#register-password-confirm').value = ''; $('#register-email').value = '';
    } catch (error) { message.textContent = error.message; }
    finally { if (button) button.disabled = false; const slot = $('[data-turnstile-action="register"]'); if (slot?.dataset.turnstileWidget && window.turnstile) window.turnstile.reset(slot.dataset.turnstileWidget); }
  });
  $('#google-login-btn')?.addEventListener('click', () => runGoogleLogin('login'));
  $('#google-register-btn')?.addEventListener('click', () => runGoogleLogin('register'));
  $('#reset-password-btn')?.addEventListener('click', async () => {
    const out = $('#reset-message'); const button = $('#reset-password-btn'); out.textContent = 'Enviando instrucciones…'; button.disabled = true;
    try { const result = await authClient().resetPassword({ email:$('#reset-email').value, turnstileToken:turnstileToken('password-reset') }); out.textContent = result.message; }
    catch (error) { out.textContent = error.message; }
    finally { button.disabled = false; const slot = $('[data-turnstile-action="password-reset"]'); if (slot?.dataset.turnstileWidget && window.turnstile) window.turnstile.reset(slot.dataset.turnstileWidget); }
  });
  $('#logout-btn')?.addEventListener('click', async () => {
    try { await api('/api/auth/logout', { method:'POST', body:'{}' }); } catch {}
    try { await window.RMSSAuth?.signOut(); } catch {}
    try { sessionStorage.removeItem('rm_session_token'); } catch {}
    location.href = '/index.html';
  });

  async function loadUser(quiet = false) {
    let user = null;
    try {
      const result = await api('/api/auth/me'); user = result.user || null;
      setUser(user);
      if (user) {
        $('#auth-screen')?.classList.add('hidden'); $('#app-screen')?.classList.remove('hidden');
        if (page === 'home') { await Promise.all([loadProjects(), loadHomeStats()]); }
        if (page === 'catalog') await loadCatalog();
        if (page === 'downloads') await loadDownloads();
        if (page === 'settings') window.dispatchEvent(new CustomEvent('rmss:settings-user-ready', { detail:{ user } }));
        if (page === 'pricing') window.dispatchEvent(new CustomEvent('rmss:pricing-user-ready', { detail:{ user } }));
      } else {
        $('#header-credit-pill')?.classList.add('hidden'); $('#header-credit-count') && ($('#header-credit-count').textContent = '—'); $('#header-username') && ($('#header-username').textContent = ''); $('#logout-btn')?.classList.add('hidden');
        if (page === 'home') { $('#auth-screen')?.classList.remove('hidden'); $('#app-screen')?.classList.add('hidden'); }
        else if (page === 'catalog' || page === 'pricing') { if (page === 'catalog') await loadCatalog(); }
        else if (page === 'downloads' || page === 'settings') { location.replace(`/index.html?next=${encodeURIComponent(location.pathname + location.search)}`); }
      }
    } catch (error) {
      if (error.status !== 403 && !quiet) showToast(error.message);
      if (page === 'home' && !suspendHandling) { $('#auth-screen')?.classList.remove('hidden'); $('#app-screen')?.classList.add('hidden'); }
    } finally {
      document.documentElement.classList.remove('rmss-auth-pending');
      resolveUserReady(user);
      window.dispatchEvent(new CustomEvent('rmss:user-state', { detail:{ user } }));
    }
    return user;
  }

  $('#year') && ($('#year').textContent = new Date().getFullYear());
  if (page === 'home') {
    const url = new URL(location.href); if (url.searchParams.has('register')) switchAuthMode('register');
    if (url.searchParams.get('account') === 'suspended') { $('#login-message') && ($('#login-message').textContent = 'Esta cuenta está suspendida. Contacta con el administrador.'); }
  }
  loadUser(false);
})();
