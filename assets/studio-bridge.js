(() => {
  'use strict';
  const API_BASE = String(window.RMSS_CONFIG?.apiBaseUrl || '').replace(/\/+$/, '');
  let suspendedHandling = false;
  const api = async (path, options = {}) => {
    if (window.RMSS_AUTH_READY) { try { await window.RMSS_AUTH_READY; } catch {} }
    let token = null;
    try { if (window.RMSSAuth?.getIdToken) token = await window.RMSSAuth.getIdToken(); } catch {}
    const headers = { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) };
    const response = await fetch(`${API_BASE}${path}`, { credentials: 'omit', ...options, headers });
    const type = response.headers.get('content-type') || '';
    if (!response.ok) {
      let msg = `Request failed (${response.status})`;
      if (type.includes('application/json')) {
        const body = await response.json().catch(() => ({})); msg = body.error || msg;
        if (response.status === 403 && /^account suspended$/i.test(String(body.error||''))) {
          const details=[]; if(body.reason)details.push(`Motivo: ${body.reason}`); if(body.banned_until)details.push(`La suspensión termina: ${new Date(body.banned_until).toLocaleString()}`); else details.push('Duración: indefinida'); if(details.length)msg+=`: ${details.join(' · ')}`;
        }
      } else msg = await response.text().catch(() => msg) || msg;
      const error = new Error(msg); error.status = response.status;
      if (response.status === 403 && /account suspended/i.test(msg)) await handleSuspended(msg);
      throw error;
    }
    return type.includes('application/json') ? response.json() : response;
  };
  function notice(message) {
    let node = document.getElementById('rm-studio-notice');
    if (!node) { node = document.createElement('div'); node.id = 'rm-studio-notice'; node.className = 'rm-studio-notice'; node.setAttribute('role', 'status'); document.body.appendChild(node); }
    node.textContent = String(message || ''); node.classList.add('show'); clearTimeout(window.__rmStudioTimer); window.__rmStudioTimer = setTimeout(() => node.classList.remove('show'), 4500);
  }
  window.addEventListener('rmss:account-suspended', event => {
    const data = event.detail || {};
    const details = [];
    if (data.reason) details.push(`Motivo: ${data.reason}`);
    if (data.banned_until) details.push(`La suspensión termina: ${new Date(data.banned_until).toLocaleString()}`);
    else details.push('Duración: indefinida');
    handleSuspended(`Account suspended${details.length ? `: ${details.join(' · ')}` : ''}`);
  });

  async function handleSuspended(message) {
    if (suspendedHandling) return;
    suspendedHandling = true;
    try { await window.RMSSAuth?.signOut(); } catch {}
    try { sessionStorage.removeItem('rm_session_token'); sessionStorage.removeItem('rm_pending_studio_action'); } catch {}
    window.RMSS_CURRENT_USER = null;
    document.body.classList.remove('rmss-premium');
    document.querySelectorAll('.ad-slot').forEach(slot => { slot.hidden = true; slot.replaceChildren(); });
    const old=document.getElementById('rmss-suspension-dialog');old?.remove();
    const dialog=document.createElement('dialog');dialog.id='rmss-suspension-dialog';dialog.className='rmss-ban-dialog';
    const title=document.createElement('h2');title.textContent='Cuenta suspendida';
    const copy=document.createElement('p');copy.textContent=String(message||'Cuenta suspendida').replace(/^Account suspended:?\s*/i,'')||'La cuenta tiene una suspensión activa.';
    const button=document.createElement('button');button.type='button';button.className='primary';button.textContent='Entendido';dialog.append(title,copy,button);document.body.appendChild(dialog);
    await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;try{dialog.close()}catch{}dialog.remove();resolve()};button.addEventListener('click',finish);dialog.addEventListener('cancel',e=>{e.preventDefault();finish()});if(dialog.showModal)dialog.showModal();else{alert(`${title.textContent}\n\n${copy.textContent}`);finish()}});
    location.replace('/index.html?account=suspended');
  }
  async function me() {
    try {
      const result = await api('/api/auth/me');
      const user = result.user || null;
      window.RMSS_CURRENT_USER = user;
      window.dispatchEvent(new CustomEvent('rmss:user-state', { detail: { user } }));
      return user;
    } catch (error) { if (error.status === 403) throw error; return null; }
  }
  function ensureToolbar() {
    const header = document.querySelector('header');
    const bar = document.createElement('div');
    bar.className = 'rm-studio-toolbar';
    bar.innerHTML = '<a class="rm-studio-brand" href="/index.html" aria-label="RM Skin Studio, inicio">RM Skin Studio</a><a href="/studios/skin.html">Skin</a><a href="/studios/calendar.html">Calendar</a><a href="/studios/gif.html">GIF</a><button type="button" id="rm-save-project">Guardar proyecto</button><button type="button" class="rmss-profile-toggle rmss-studio-profile-toggle" aria-expanded="false">◉ <span id="rm-studio-username">Cuenta</span> · <b>◈ <span id="rm-studio-credits">—</span></b> ▾</button><div class="rmss-profile-menu rmss-studio-profile-menu" hidden><a href="/settings.html">Ajustes de cuenta</a><a href="/pricing.html">Precios y Premium</a><button type="button" class="rmss-lang-toggle">ES · Idioma</button><button type="button" id="rm-studio-logout">Cerrar sesión</button></div><a href="/index.html">Panel</a>';
    if (header) {
      const group = header.querySelector('div.flex.gap-2') || header.querySelector('.header-account') || header;
      // Skin and Calendar already render the canonical brand link in the left side of the header.
      // Keep the toolbar on the right focused on account controls, avoiding duplicate logos.
      bar.querySelector('.rm-studio-brand')?.remove();
      group.insertBefore(bar, group.firstChild);
      return;
    }
    bar.classList.add('rm-studio-toolbar-floating');
    document.body.insertBefore(bar, document.body.firstChild);
  }
  document.addEventListener('click', event => { const toggle=event.target.closest('.rmss-studio-profile-toggle'); const menu=document.querySelector('.rmss-studio-profile-menu'); if(toggle && menu){const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));} else if(!event.target.closest('.rmss-studio-profile-menu') && menu){menu.hidden=true;document.querySelectorAll('.rmss-studio-profile-toggle').forEach(b=>b.setAttribute('aria-expanded','false'));} });
  function currentPayload() {
    if (typeof window.__RM_GET_STATE !== 'function') throw new Error('Este estudio no ha preparado los datos del proyecto.');
    return window.__RM_GET_STATE();
  }
  async function updateCredits() {
    try {
      const user = await me();
      const credit = document.getElementById('rm-studio-credits'); if (credit) credit.textContent = user ? Number(user.credits || 0).toLocaleString() : 'Inicia sesión';
      const username = document.getElementById('rm-studio-username'); if (username) username.textContent = user ? user.username : 'Invitado';
      document.body.classList.toggle('rmss-premium', Number(user?.is_premium || 0) === 1);
    } catch (error) { if (error.status === 403) throw error; }
  }
  function savePending(payload, action) { try { sessionStorage.setItem('rm_pending_studio_action', JSON.stringify({ action, payload, path: location.pathname })); } catch { notice('Inicia sesión antes de continuar; no se pudo guardar el estado temporal.'); } }
  async function savePayload(payload, existingId = null) {
    const user = await me();
    if (!user) { savePending(payload, 'save'); location.href = `/index.html?next=${encodeURIComponent(location.pathname + location.search)}`; return; }
    const id = existingId || new URL(location.href).searchParams.get('project');
    const result = await api(id ? `/api/projects/${encodeURIComponent(id)}` : '/api/projects', { method: id ? 'PUT' : 'POST', body: JSON.stringify({ studio: payload.studio, name: payload.name, projectData: payload.config }) });
    const url = new URL(location.href); url.searchParams.set('project', result.id); history.replaceState({}, '', url.toString()); window.__RM_CURRENT_PROJECT_ID = result.id; notice('Proyecto guardado de forma privada en tu cuenta.');
  }
  async function exportPayload(payload) {
    const user = await me();
    if (!user) { savePending(payload, 'export'); location.href = `/index.html?next=${encodeURIComponent(location.pathname + location.search)}`; return; }
    const button = document.querySelector('header button[onclick*="exportSkin"],header button[onclick*="exportWidget"],button[onclick*="exportProject"],#export-btn');
    if (button) { button.disabled = true; button.dataset.originalText = button.textContent; button.textContent = 'Generando ZIP…'; }
    try {
      const response = await api('/api/export', { method: 'POST', body: JSON.stringify(payload) });
      const blob = await response.blob(); const header = response.headers.get('Content-Disposition') || ''; const match = header.match(/filename="?([^";]+)"?/i); const filename = match?.[1] || `${payload.name || 'RMSS-Export'}.zip`;
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
      const balance = response.headers.get('X-RM-Credits-Remaining'); const node = document.getElementById('rm-studio-credits'); if (balance !== null && node) node.textContent = balance;
      notice(`ZIP generado. Coste: 200 créditos (USD 2.00 de equivalencia). Saldo: ${balance ?? 'actualizado'}.`);
      await updateCredits();
    } catch (error) {
      notice(error.message || 'No se pudo exportar el proyecto.');
      if (error.status === 401) { savePending(payload, 'export'); location.href = `/index.html?next=${encodeURIComponent(location.pathname + location.search)}`; }
    } finally { if (button) { button.disabled = false; button.textContent = button.dataset.originalText || 'Exportar ZIP (200 créditos)'; } }
  }
  async function loadProjectFromQuery() {
    const id = new URL(location.href).searchParams.get('project'); if (!id) return;
    try { const result = await api(`/api/projects/${encodeURIComponent(id)}`); if (typeof window.__RM_LOAD_STATE === 'function') { await window.__RM_LOAD_STATE(result); notice(`Proyecto «${result.name}» abierto.`); } else notice('Este estudio no admite restauración de proyectos todavía.'); }
    catch (error) { if (error.status === 401) { location.replace(`/index.html?next=${encodeURIComponent(location.pathname + location.search)}`); return; } notice(error.message); }
  }
  async function resumePending() {
    let pending; try { pending = JSON.parse(sessionStorage.getItem('rm_pending_studio_action') || 'null'); } catch {}
    if (!pending || pending.path !== location.pathname) return;
    sessionStorage.removeItem('rm_pending_studio_action'); const user = await me();
    if (!user) { savePending(pending.payload, pending.action); location.replace(`/index.html?next=${encodeURIComponent(location.pathname + location.search)}`); return; }
    if (pending.action === 'export') await exportPayload(pending.payload); else if (pending.action === 'save') await savePayload(pending.payload);
  }
  window.RMStudioBridge = { api, notice, export: exportPayload, save: savePayload, getPayload: currentPayload, updateCredits };
  ensureToolbar();
  document.getElementById('rm-save-project')?.addEventListener('click', async () => { try { await savePayload(await currentPayload()); } catch (error) { notice(error.message); } });
  document.getElementById('rm-studio-logout')?.addEventListener('click', async () => { try { await window.RMSSAuth?.signOut(); } catch {} location.href = '/index.html'; });
  updateCredits().then(() => loadProjectFromQuery()).then(() => resumePending()).catch(error => { if (error.status !== 403) notice(error.message); });
})();
