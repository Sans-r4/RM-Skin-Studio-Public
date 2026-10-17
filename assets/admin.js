(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const API_BASE = String(window.RMSS_CONFIG?.apiBaseUrl || '').replace(/\/+$/, '');

  async function api(path, options = {}) {
    const isForm = options.body instanceof FormData;
    const token = sessionStorage.getItem('rm_admin_token');
    const response = await fetch(`${API_BASE}${path}`, { credentials: 'omit', ...options, headers: { ...(!isForm && options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) } });
    const type = response.headers.get('content-type') || '';
    if (!response.ok) {
      let msg = `Error ${response.status}`;
      if (type.includes('application/json')) { const body = await response.json().catch(() => ({})); msg = body.error || msg; }
      else msg = await response.text().catch(() => msg) || msg;
      const error = new Error(msg); error.status = response.status; throw error;
    }
    return type.includes('application/json') ? response.json() : response;
  }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
  function notice(message) { const node = $('#toast'); if (!node) { alert(message); return; } node.textContent = message; node.classList.remove('hidden'); clearTimeout(window.__adminToast); window.__adminToast = setTimeout(() => node.classList.add('hidden'), 4500); }
  async function downloadResponse(response, fallback) { const blob = await response.blob(); const cd = response.headers.get('Content-Disposition') || ''; const filename = cd.match(/filename="?([^";]+)"?/i)?.[1] || `${fallback}.zip`; const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 30000); }
  function switchTab(name) { $$('[data-admin-tab]').forEach(button => button.classList.toggle('active', button.dataset.adminTab === name)); $$('.admin-section').forEach(section => section.classList.toggle('hidden', section.id !== `admin-${name}`)); }
  $$('[data-admin-tab]').forEach(button => button.addEventListener('click', () => { const tab=button.dataset.adminTab; switchTab(tab); if(tab==='gifts') loadGiftCodes(); }));

  function catalogSourceChanged() {
    const external = $('#catalog-source-type')?.value === 'external';
    $('#catalog-external-url-wrap')?.classList.toggle('hidden', !external);
    $('#catalog-file-wrap')?.classList.toggle('hidden', external);
    $('#catalog-variants-wrap')?.classList.toggle('hidden', external);
    const file = $('#catalog-file');
    if (file) file.required = !external && !$('#catalog-id').value;
    const url = $('#catalog-external-url'); if (url) url.required = external;
  }
  function updateUsdEquivalent() {
    const value = Number($('#catalog-price')?.value || 0);
    const usd = Number.isFinite(value) ? (Math.max(0, Math.floor(value)) / 100).toFixed(2) : '0.00';
    const output = $('#catalog-usd-equivalent');
    if (output) output.textContent = `Equivale a $${usd} USD (${Math.max(0, Math.floor(value)).toLocaleString('en-US')} créditos)`;
  }

  async function showActivity(user) {
    const modal = $('#user-activity-modal'); if (!modal) return;
    $('#user-activity-title').textContent = `Actividad: ${user.username || user.id}`;
    $('#user-activity-subtitle').textContent = `${user.email || ''} · últimos 100 eventos`;
    const content = $('#user-activity-content'); content.innerHTML = '<div class="empty-state">Cargando actividad…</div>';
    modal.hidden = false;
    try {
      const data = await api(`/api/admin/users/${encodeURIComponent(user.id)}/activity`);
      const list = data.activity || [];
      content.innerHTML = list.length ? list.map(row => `<article class="project-row"><div><h4>${esc(row.event_type)}</h4><p>${esc(new Date(row.created_at).toLocaleString())}</p><pre>${esc(JSON.stringify(row.details || {}, null, 2))}</pre></div></article>`).join('') : '<div class="empty-state">Este usuario aún no tiene eventos registrados.</div>';
    } catch (error) { content.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`; }
  }
  $('#close-user-activity')?.addEventListener('click', () => { $('#user-activity-modal').hidden = true; });
  $('#user-activity-modal')?.addEventListener('click', event => { if (event.target.id === 'user-activity-modal') event.currentTarget.hidden = true; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('#user-activity-modal') && !$('#user-activity-modal').hidden) $('#user-activity-modal').hidden = true; });

  function formatBanState(user) {
    if (Number(user.is_banned) !== 1) return '<span class="status good">Activa</span>';
    const raw = user.banned_until ? Date.parse(user.banned_until) : NaN;
    if (!Number.isFinite(raw)) return '<span class="status bad">Suspensión permanente</span>';
    const remain = raw - Date.now();
    if (remain <= 0) return `<span class="status bad">Suspensión vencida; se levantará en la siguiente solicitud</span><p class="muted">Venció: ${esc(new Date(raw).toLocaleString())}</p>`;
    const days = Math.floor(remain / 86400000);
    const hours = Math.floor((remain % 86400000) / 3600000);
    const mins = Math.floor((remain % 3600000) / 60000);
    const left = days ? `${days} d ${hours} h` : hours ? `${hours} h ${mins} min` : `${Math.max(1, mins)} min`;
    return `<span class="status bad">Suspendida · ${esc(left)}</span><p class="muted">Hasta: ${esc(new Date(raw).toLocaleString())}</p>`;
  }
  function premiumIsActive(user) {
    return Number(user.is_premium) === 1 && (!user.premium_expires_at || Date.parse(user.premium_expires_at) > Date.now());
  }
  function closeSuspensionModal() { const modal=$('#suspension-modal'); if(modal) modal.hidden=true; }
  function openSuspensionModal(user) {
    $('#suspension-user-id').value=user.id;
    $('#suspension-user-label').textContent=`${user.username || user.id} · ${user.email || ''}`;
    $('#suspension-reason').value='';
    $('#suspension-duration').value='24h';
    $('#suspension-custom-date').value='';
    $('#suspension-message').textContent='';
    $('#suspension-custom-wrap').classList.add('hidden');
    $('#suspension-modal').hidden=false;
  }
  $('#close-suspension-modal')?.addEventListener('click',closeSuspensionModal);
  $('#cancel-suspension-modal')?.addEventListener('click',closeSuspensionModal);
  $('#suspension-modal')?.addEventListener('click',event=>{if(event.target.id==='suspension-modal')closeSuspensionModal();});
  $('#suspension-duration')?.addEventListener('change',()=>$('#suspension-custom-wrap')?.classList.toggle('hidden',$('#suspension-duration').value!=='custom'));
  $('#suspension-form')?.addEventListener('submit',async event=>{
    event.preventDefault();
    const id=$('#suspension-user-id').value;
    const duration=$('#suspension-duration').value;
    const reason=$('#suspension-reason').value.trim();
    let banned_until=null;
    if(duration==='custom'){
      const raw=$('#suspension-custom-date').value;
      if(!raw){$('#suspension-message').textContent='Selecciona una fecha y hora futura.';return;}
      const date=new Date(raw);
      if(!Number.isFinite(date.getTime())||date.getTime()<=Date.now()){$('#suspension-message').textContent='La fecha debe estar en el futuro.';return;}
      banned_until=date.toISOString();
    }
    if(!confirm(`¿Suspender a ${$('#suspension-user-label').textContent}?`))return;
    const submit=$('#suspension-form button[type="submit"]'); submit.disabled=true; $('#suspension-message').textContent='Guardando suspensión…';
    try{
      const result=await api(`/api/admin/users/${encodeURIComponent(id)}/ban`,{method:'POST',body:JSON.stringify({banned:true,duration,banned_until,reason})});
      closeSuspensionModal();
      notice(result.banned_until?`Cuenta suspendida hasta ${new Date(result.banned_until).toLocaleString()}.`:'Cuenta suspendida indefinidamente.');
      await loadUsers();
    }catch(error){$('#suspension-message').textContent=error.message;}
    finally{submit.disabled=false;}
  });
  async function loadUsers() {
    const output = $('#admin-user-table'); output.innerHTML = '<div class="empty-state">Cargando usuarios…</div>';
    try {
      const { users = [] } = await api('/api/admin/users'); $('#users-total').textContent = `${users.length} usuarios`;
      output.innerHTML = users.length ? `<table><thead><tr><th>Usuario</th><th>Correo</th><th>Cuenta</th><th>Actividad</th><th>Saldo</th><th>Proyectos</th><th>Ajuste de créditos</th><th>Moderación</th></tr></thead><tbody>${users.map(user => {
        const isBanned=Number(user.is_banned)===1;
        const premium=premiumIsActive(user);
        return `<tr><td><strong>${esc(user.username)}</strong><div class="muted" style="font-size:10px">${esc(user.id)}<br>Firebase UID: ${esc(user.firebase_uid || 'sin vincular')}</div></td><td>${esc(user.email)}</td><td>${premium ? '<span class="status good">Premium</span>' : (Number(user.is_premium)===1?'<span class="status">Premium vencido</span>':'<span class="status">Estándar</span>')}<br>${formatBanState(user)}${user.ban_reason ? `<p class="muted">Motivo: ${esc(user.ban_reason)}</p>` : ''}${user.premium_expires_at && premium ? `<p class="muted">Premium hasta ${esc(new Date(user.premium_expires_at).toLocaleString())}</p>` : ''}</td><td>${esc(user.last_active_at ? new Date(user.last_active_at).toLocaleString() : 'Sin actividad')}</td><td><strong>${Number(user.credits || 0)}</strong></td><td>${Number(user.project_count || 0)} proyectos<br>${Number(user.export_count || 0)} exportaciones</td><td><div class="credit-editor"><input type="number" min="-10000" max="10000" value="0" aria-label="Ajuste de créditos" data-credit-delta="${esc(user.id)}"><button class="small" data-adjust-user="${esc(user.id)}">Aplicar</button></div><input type="text" value="Ajuste admin" maxlength="200" data-credit-note="${esc(user.id)}" style="font-size:11px;margin-top:6px;padding:7px"></td><td><div class="admin-action-row"><button class="small" data-activity-user="${esc(user.id)}">Actividad</button><button class="small ${isBanned ? '' : 'danger'}" data-ban-user="${esc(user.id)}" data-banned="${isBanned ? '1' : '0'}">${isBanned ? 'Desbanear' : 'Suspender'}</button>${premium?`<button class="small danger" data-revoke-premium="${esc(user.id)}">Quitar Premium</button>`:''}</div></td></tr>`;
      }).join('')}</tbody></table>` : '<div class="empty-state">Todavía no hay usuarios.</div>';
      $$('[data-adjust-user]').forEach(button => button.addEventListener('click', async () => {
        const id = button.dataset.adjustUser; const delta = Number($(`[data-credit-delta="${CSS.escape(id)}"]`)?.value); const note = $(`[data-credit-note="${CSS.escape(id)}"]`)?.value || 'Ajuste manual';
        if (!Number.isInteger(delta) || delta === 0) { notice('Introduce un ajuste entero distinto de cero.'); return; }
        if (!confirm(`¿Aplicar ${delta > 0 ? '+' : ''}${delta} créditos a este usuario?`)) return;
        button.disabled = true;
        try { const result = await api(`/api/admin/users/${encodeURIComponent(id)}/credits`, { method: 'POST', body: JSON.stringify({ delta, note }) }); notice(`Saldo actualizado: ${result.credits} créditos.`); await loadUsers(); }
        catch (error) { notice(error.message); } finally { button.disabled = false; }
      }));
      $$('[data-activity-user]').forEach(button => button.addEventListener('click', () => { const user = users.find(item => item.id === button.dataset.activityUser); if (user) showActivity(user); }));
      $$('[data-ban-user]').forEach(button => button.addEventListener('click', async () => {
        const id=button.dataset.banUser; const isBanned=button.dataset.banned==='1';
        if(!isBanned){const user=users.find(item=>item.id===id);if(user)openSuspensionModal(user);return;}
        const user=users.find(item=>item.id===id);
        if(!confirm(`¿Reactivar la cuenta de ${user?.username||id} inmediatamente?`))return;
        button.disabled=true;
        try{await api(`/api/admin/users/${encodeURIComponent(id)}/ban`,{method:'POST',body:JSON.stringify({banned:false})});notice('Cuenta reactivada.');await loadUsers();}
        catch(error){notice(error.message);}finally{button.disabled=false;}
      }));
      $$('[data-revoke-premium]').forEach(button => button.addEventListener('click',async()=>{
        const id=button.dataset.revokePremium;const user=users.find(item=>item.id===id);
        if(!confirm(`¿Quitar Premium a ${user?.username||id}? Se intentará cancelar también su suscripción PayPal activa.`))return;
        button.disabled=true;
        try{const result=await api(`/api/admin/users/${encodeURIComponent(id)}/revoke-premium`,{method:'POST',body:JSON.stringify({})});notice(result.warning||`Premium revocado para ${user?.username||id}.`);await loadUsers();}
        catch(error){notice(error.message);}finally{button.disabled=false;}
      }));
    } catch (error) { output.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`; }
  }

  async function loadProjects() {
    const output = $('#admin-project-table'); output.innerHTML = '<div class="empty-state">Cargando proyectos…</div>';
    try {
      const { projects } = await api('/api/admin/projects'); $('#projects-total').textContent = `${projects.length} proyectos`;
      output.innerHTML = projects.length ? `<table><thead><tr><th>Proyecto</th><th>Propietario</th><th>Estudio</th><th>Actualizado</th><th>Acción</th></tr></thead><tbody>${projects.map(project => `<tr><td><strong>${esc(project.name)}</strong><div class="muted" style="font-size:10px">${esc(project.id)}</div></td><td>${esc(project.username)}<br><span class="muted">${esc(project.user_id)}</span></td><td>${esc(project.studio)}</td><td>${esc(new Date(project.updated_at).toLocaleString())}</td><td><button class="small" data-view-project="${esc(project.id)}">Ver configuración</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty-state">No hay proyectos.</div>';
      $$('[data-view-project]').forEach(button => button.addEventListener('click', async () => { button.disabled = true; try { const data = await api(`/api/admin/projects/${encodeURIComponent(button.dataset.viewProject)}`); $('#project-detail').classList.remove('hidden'); $('#project-json').textContent = JSON.stringify(data, null, 2); $('#project-detail').scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (error) { notice(error.message); } finally { button.disabled = false; } }));
    } catch (error) { output.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`; }
  }

  async function loadCatalog() {
    const output = $('#admin-catalog-list'); output.innerHTML = '<div class="empty-state">Cargando catálogo…</div>';
    try {
      const { items } = await api('/api/admin/catalog');
      output.innerHTML = items.length ? items.map(item => `<div class="project-row"><div><h4>${esc(item.name)} <span class="status">${Number(item.price_credits) === 0 ? 'Gratis' : `${Number(item.price_credits).toLocaleString()} créditos ($${Number(item.usd_equivalent || 0).toFixed(2)} USD)`}</span></h4><p>${esc(item.description)} · origen: ${item.source_type === 'external' ? 'URL externa' : 'R2 privado'} · ${esc(item.filename)} · ${item.variant_count || 0} variantes · ${item.has_preview_image ? 'captura disponible' : item.has_preview_svg ? 'preview SVG' : 'sin preview'} · ${item.published ? 'Publicado' : 'Borrador'}</p><p>Actualizado: ${esc(new Date(item.updated_at).toLocaleString())}</p></div><div class="admin-action-row"><button class="small" data-edit-item="${esc(item.id)}">Editar</button><button class="small danger" data-delete-item="${esc(item.id)}">Eliminar</button></div></div>`).join('') : '<div class="empty-state">Aún no has subido archivos. Usa el formulario para publicar INI, ZIP, RMSKIN o una URL externa.</div>';
      $$('[data-edit-item]').forEach(button => button.addEventListener('click', () => {
        const item = items.find(candidate => candidate.id === button.dataset.editItem); if (!item) return;
        $('#catalog-id').value = item.id; $('#catalog-name').value = item.name; $('#catalog-description').value = item.description || ''; $('#catalog-preview').value = item.preview_text || ''; $('#catalog-price').value = item.price_credits; $('#catalog-published').value = item.published ? 'true' : 'false'; $('#catalog-source-type').value = item.source_type || 'r2'; $('#catalog-external-url').value = item.external_url || '';
        $('#catalog-file').required = false; $('#catalog-file').value = ''; $('#catalog-variant-files').value = ''; $('#catalog-preview-image').value = ''; $('#catalog-message').textContent = 'Edición activa. Deja los archivos vacíos para conservarlos, o selecciona reemplazos.'; catalogSourceChanged(); updateUsdEquivalent(); $('#catalog-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
      $$('[data-delete-item]').forEach(button => button.addEventListener('click', async () => { if (!confirm('¿Eliminar este elemento del catálogo?')) return; try { await api(`/api/admin/catalog/${encodeURIComponent(button.dataset.deleteItem)}`, { method: 'DELETE' }); notice('Elemento eliminado.'); await loadCatalog(); } catch (error) { notice(error.message); } }));
    } catch (error) { output.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`; }
  }
  async function loadBackups() {
    const output = $('#backup-list'); output.innerHTML = '<div class="empty-state">Buscando copias…</div>';
    try {
      const { backups } = await api('/api/admin/backups');
      output.innerHTML = backups.length ? backups.map(backup => `<div class="project-row"><div><h4>${esc(backup.id)}</h4><p>Info ${Number(backup.size)} bytes · copia cifrada en R2</p></div><button class="small" data-download-backup="${esc(backup.id)}">Descargar ZIP cifrado</button></div>`).join('') : '<div class="empty-state">No hay copias todavía. Pulsa “Crear copia ahora” o despliega el Worker programado.</div>';
      $$('[data-download-backup]').forEach(button => button.addEventListener('click', async () => { button.disabled = true; try { const response = await api(`/api/admin/backup?id=${encodeURIComponent(button.dataset.downloadBackup)}`); await downloadResponse(response, `RMSS-Backup-${button.dataset.downloadBackup}`); } catch (error) { notice(error.message); } finally { button.disabled = false; } }));
    } catch (error) { output.innerHTML = `<div class="empty-state">${esc(error.message)}</div>`; }
  }
  async function refreshAll() { await Promise.all([loadUsers(), loadProjects(), loadCatalog(), loadBackups()]); }
  $('#admin-refresh')?.addEventListener('click', refreshAll);
  $('#close-project-detail')?.addEventListener('click', () => $('#project-detail').classList.add('hidden'));
  $('#catalog-price')?.addEventListener('input', updateUsdEquivalent);
  $('#catalog-source-type')?.addEventListener('change', catalogSourceChanged);
  $('#catalog-reset')?.addEventListener('click', () => { $('#catalog-form').reset(); $('#catalog-id').value = ''; $('#catalog-file').required = true; $('#catalog-preview').value = ''; $('#catalog-preview-image').value = ''; $('#catalog-variant-files').value = ''; $('#catalog-message').textContent = ''; catalogSourceChanged(); updateUsdEquivalent(); });
  $('#catalog-form')?.addEventListener('submit', async event => {
    event.preventDefault(); const message = $('#catalog-message'); const submit = $('#catalog-form button[type="submit"]');
    const form = new FormData(event.currentTarget); if (!$('#catalog-id').value) form.delete('id');
    if ($('#catalog-source-type').value === 'external') { form.delete('file'); form.delete('variant_files'); }
    message.textContent = 'Validando datos y guardando el producto…'; if (submit) submit.disabled = true;
    try {
      const result = await api('/api/admin/catalog', { method: 'POST', body: form });
      message.textContent = `Guardado: ${result.name} · ${Number(result.price_credits).toLocaleString()} créditos · $${Number(result.usd_equivalent).toFixed(2)} USD.`;
      $('#catalog-form').reset(); $('#catalog-id').value = ''; $('#catalog-file').required = true; $('#catalog-preview').value = ''; $('#catalog-preview-image').value = ''; $('#catalog-variant-files').value = ''; catalogSourceChanged(); updateUsdEquivalent(); await loadCatalog();
    } catch (error) { message.textContent = error.message; }
    finally { if (submit) submit.disabled = false; }
  });
  $('#create-backup')?.addEventListener('click', async () => { const button = $('#create-backup'); button.disabled = true; $('#backup-message').textContent = 'Creando copia cifrada de los datos y archivos…'; try { const result = await api('/api/admin/backup', { method: 'POST', body: '{}' }); $('#backup-message').textContent = `Copia creada: ${result.backup.id}; ${result.backup.objects} objetos copiados.`; await loadBackups(); } catch (error) { $('#backup-message').textContent = error.message; } finally { button.disabled = false; } });
  $('#admin-logout')?.addEventListener('click', async () => { try { await api('/api/admin/logout', { method: 'POST', body: '{}' }); } catch {} sessionStorage.removeItem('rm_admin_token'); location.href = '/admin.html'; });

  async function init() {
    const login = $('#github-admin-login'); if (login) login.href = `${API_BASE}/api/admin/login`;
    const params = new URLSearchParams(location.hash.replace(/^#/, '')); const code = params.get('admin_code');
    if (code) { try { const exchanged = await api('/api/admin/exchange', { method: 'POST', body: JSON.stringify({ code }) }); if (exchanged.sessionToken) sessionStorage.setItem('rm_admin_token', exchanged.sessionToken); history.replaceState({}, document.title, location.pathname); } catch (error) { notice(`No se pudo completar el acceso GitHub: ${error.message}`); history.replaceState({}, document.title, location.pathname); } }
    try { const { admin } = await api('/api/admin/me'); $('#admin-login-name').textContent = `GitHub: ${admin.github_login}`; $('#admin-gate').classList.add('hidden'); $('#admin-app').classList.remove('hidden'); $('#admin-logout').classList.remove('hidden'); await refreshAll(); }
    catch (error) { $('#admin-gate').classList.remove('hidden'); $('#admin-app').classList.add('hidden'); if (error.status !== 401) { const paragraph = $('#admin-gate p'); if (paragraph) paragraph.textContent = `No se pudo validar el panel: ${error.message}. Revisa las variables y bindings de Cloudflare.`; } }
  }
  catalogSourceChanged(); updateUsdEquivalent(); init();

  const giftForm = $('#gift-code-form');
  function giftTypeChanged(){const premium=$('#gift-benefit-type')?.value==='premium';$('#gift-credits-wrap')?.classList.toggle('hidden',premium);$('#gift-premium-wrap')?.classList.toggle('hidden',!premium);giftDurationChanged();}
  function giftDurationChanged(){const custom=$('#gift-premium-duration')?.value==='custom';$('#gift-custom-days-wrap')?.classList.toggle('hidden',!custom);}
  async function loadGiftCodes(){const target=$('#gift-code-list');if(!target)return;try{const data=await api('/api/admin/gift-codes');const codes=data.codes||[];target.innerHTML=codes.length?codes.map(c=>`<div class="project-row"><div><h4>${esc(c.benefit_type==='credits'?`${Number(c.credits_amount).toLocaleString()} créditos`:`Premium · ${esc(c.premium_duration)}`)} <span class="status ${c.status==='active'?'good':'bad'}">${esc(c.status)}</span></h4><p>Creado ${esc(new Date(c.created_at).toLocaleString())}${c.expires_at?` · vence ${esc(new Date(c.expires_at).toLocaleString())}`:''}${c.redeemed_at?` · canjeado ${esc(new Date(c.redeemed_at).toLocaleString())}`:''}</p><p>ID: ${esc(c.id)} · la llave no se vuelve a mostrar por seguridad</p></div><div>${c.status==='active'?`<button class="small danger" data-disable-gift="${esc(c.id)}">Desactivar</button>`:''}</div></div>`).join(''):'<div class="empty-state">Todavía no has creado códigos.</div>';}catch(e){target.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`;}}
  $('#gift-benefit-type')?.addEventListener('change',giftTypeChanged);$('#gift-premium-duration')?.addEventListener('change',giftDurationChanged);$('#gift-refresh')?.addEventListener('click',loadGiftCodes);giftTypeChanged();
  giftForm?.addEventListener('submit',async e=>{e.preventDefault();const msg=$('#gift-code-message');msg.textContent='Creando…';const type=$('#gift-benefit-type').value;const payload={benefit_type:type,credits_amount:Number($('#gift-credits-amount').value),premium_duration:$('#gift-premium-duration').value,premium_days:Number($('#gift-premium-days').value),expires_at:$('#gift-expires').value?new Date($('#gift-expires').value).toISOString():null};try{const result=await api('/api/admin/gift-codes',{method:'POST',body:JSON.stringify(payload)});const box=$('#gift-code-created');box.classList.remove('hidden');box.innerHTML=`<strong>Código creado. Cópialo ahora; no volverá a mostrarse:</strong><p style="font-size:22px;letter-spacing:.12em;font-weight:900">${esc(result.code)}</p><button type="button" id="gift-copy-code" class="small">Copiar llave</button><p>Beneficio: ${type==='credits'?`${result.credits_amount} créditos`:`Premium · ${esc(result.premium_duration)}`}</p>`;$('#gift-copy-code')?.addEventListener('click',()=>navigator.clipboard.writeText(result.code).then(()=>notice('Código copiado.')).catch(()=>notice('Selecciona y copia la llave manualmente.')));msg.textContent='Código creado.';await loadGiftCodes();}catch(err){msg.textContent=err.message;}});
  document.addEventListener('click',async e=>{const b=e.target.closest('[data-disable-gift]');if(!b)return;if(!confirm('¿Desactivar este código?'))return;try{await api(`/api/admin/gift-codes/${encodeURIComponent(b.dataset.disableGift)}/disable`,{method:'POST',body:JSON.stringify({})});await loadGiftCodes();notice('Código desactivado.');}catch(err){notice(err.message);}});
})();
