(() => {
  'use strict';
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const API_BASE=String(window.RMSS_CONFIG?.apiBaseUrl||'').replace(/\/+$/,'');
  async function api(path,options={}) {
    const isForm=options.body instanceof FormData;
    const token=sessionStorage.getItem('rm_admin_token');
    const res=await fetch(`${API_BASE}${path}`,{credentials:API_BASE?'omit':'same-origin',...options,headers:{...(!isForm&&options.body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`} : {}),...(options.headers||{})}});
    const type=res.headers.get('content-type')||'';
    if(!res.ok){let msg=`Error ${res.status}`;if(type.includes('application/json')){const o=await res.json().catch(()=>({}));msg=o.error||msg;}else msg=await res.text().catch(()=>msg)||msg;const e=new Error(msg);e.status=res.status;throw e;}
    return type.includes('application/json')?res.json():res;
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function notice(msg){const el=$('#toast');if(!el){alert(msg);return;}el.textContent=msg;el.classList.remove('hidden');clearTimeout(window.__adminToast);window.__adminToast=setTimeout(()=>el.classList.add('hidden'),4500);}
  async function downloadResponse(response,fallback){const b=await response.blob();const cd=response.headers.get('Content-Disposition')||'';const name=cd.match(/filename="?([^";]+)"?/i)?.[1]||`${fallback}.zip`;const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
  function switchTab(name){$$('[data-admin-tab]').forEach(b=>b.classList.toggle('active',b.dataset.adminTab===name));$$('.admin-section').forEach(s=>s.classList.toggle('hidden',s.id!==`admin-${name}`));}
  $$('[data-admin-tab]').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.adminTab)));
  async function loadUsers(){
    const out=$('#admin-user-table');out.innerHTML='<div class="empty-state">Cargando usuarios…</div>';
    try{const {users}=await api('/api/admin/users');$('#users-total').textContent=`${users.length} usuarios`;
      out.innerHTML=users.length?`<table><thead><tr><th>Usuario</th><th>Correo</th><th>Créditos</th><th>Proyectos</th><th>Alta</th><th>Ajuste manual</th></tr></thead><tbody>${users.map(u=>`<tr><td><strong>${esc(u.username)}</strong><div class="muted" style="font-size:10px">${esc(u.id)}</div></td><td>${esc(u.email)}</td><td><strong>${u.credits}</strong></td><td>${u.project_count} proyectos<br>${u.export_count} exportaciones</td><td>${esc(new Date(u.created_at).toLocaleDateString())}</td><td><div class="credit-editor"><input type="number" min="-10000" max="10000" value="0" aria-label="Ajuste de créditos" data-credit-delta="${u.id}"><button class="small" data-adjust-user="${u.id}">Aplicar</button></div><input type="text" value="Ajuste admin" maxlength="200" data-credit-note="${u.id}" style="font-size:11px;margin-top:6px;padding:7px"></td></tr>`).join('')}</tbody></table>`:'<div class="empty-state">Todavía no hay usuarios.</div>';
      $$('[data-adjust-user]').forEach(btn=>btn.addEventListener('click',async()=>{const id=btn.dataset.adjustUser;const delta=Number($(`[data-credit-delta="${id}"]`).value);const note=$(`[data-credit-note="${id}"]`).value; if(!Number.isInteger(delta)||delta===0){notice('Introduce un ajuste entero distinto de cero.');return;} if(!confirm(`¿Aplicar ${delta>0?'+':''}${delta} créditos a este usuario?`))return;btn.disabled=true;try{const res=await api(`/api/admin/users/${encodeURIComponent(id)}/credits`,{method:'POST',body:JSON.stringify({delta,note})});notice(`Saldo actualizado: ${res.credits} créditos.`);await loadUsers();}catch(e){notice(e.message);}finally{btn.disabled=false;}}));
    }catch(e){out.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`;}
  }
  async function loadProjects(){
    const out=$('#admin-project-table');out.innerHTML='<div class="empty-state">Cargando proyectos…</div>';
    try{const {projects}=await api('/api/admin/projects');$('#projects-total').textContent=`${projects.length} proyectos`;
      out.innerHTML=projects.length?`<table><thead><tr><th>Proyecto</th><th>Propietario</th><th>Estudio</th><th>Estado de backup</th><th>Acción</th></tr></thead><tbody>${projects.map(p=>`<tr><td><strong>${esc(p.name)}</strong><div class="muted" style="font-size:10px">${esc(p.id)}</div></td><td>${esc(p.username)}<br><span class="muted">${esc(p.user_id)}</span></td><td>${esc(p.studio)}</td><td>${esc(new Date(p.updated_at).toLocaleString())}</td><td><button class="small" data-view-project="${p.id}">Ver configuración</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty-state">No hay proyectos guardados.</div>';
      $$('[data-view-project]').forEach(btn=>btn.addEventListener('click',async()=>{btn.disabled=true;try{const data=await api(`/api/admin/projects/${encodeURIComponent(btn.dataset.viewProject)}`);$('#project-detail').classList.remove('hidden');$('#project-json').textContent=JSON.stringify(data,null,2);$('#project-detail').scrollIntoView({behavior:'smooth',block:'start'});}catch(e){notice(e.message);}finally{btn.disabled=false;}}));
    }catch(e){out.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`;}
  }
  async function loadCatalog(){
    const out=$('#admin-catalog-list');out.innerHTML='<div class="empty-state">Cargando catálogo…</div>';
    try{const {items}=await api('/api/admin/catalog');out.innerHTML=items.length?items.map(i=>`<div class="project-row"><div><h4>${esc(i.name)} <span class="status">${i.price_credits===0?'Gratis':`${i.price_credits} créditos`}</span></h4><p>${esc(i.description)} · paquete privado: ${esc(i.filename)} · ${i.variant_count||0} variantes · ${i.has_preview_svg?'preview SVG':'sin preview SVG'} · ${i.published?'Publicado':'Borrador'}</p><p>Actualizado: ${esc(new Date(i.updated_at).toLocaleString())}</p></div><div style="display:flex;gap:7px;flex-wrap:wrap"><button class="small" data-edit-item="${i.id}">Editar</button><button class="small danger" data-delete-item="${i.id}">Eliminar</button></div></div>`).join(''):'<div class="empty-state">Aún no has subido archivos. Usa el formulario para publicar tus ZIP o INI terminados.</div>';
      $$('[data-edit-item]').forEach(btn=>btn.addEventListener('click',()=>{const item=items.find(x=>x.id===btn.dataset.editItem);if(!item)return;$('#catalog-id').value=item.id;$('#catalog-name').value=item.name;$('#catalog-description').value=item.description||'';$('#catalog-preview').value=item.preview_text||'';$('#catalog-price').value=item.price_credits;$('#catalog-published').value=item.published?'true':'false';$('#catalog-file').required=false;$('#catalog-file').value='';$('#catalog-variant-files').value='';$('#catalog-preview-image').value='';$('#catalog-message').textContent='Edición activa: puedes reemplazar el paquete, subir variantes INI adicionales o actualizar la captura de respaldo.';$('#catalog-form').scrollIntoView({behavior:'smooth',block:'start'}); }));
      $$('[data-delete-item]').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('¿Eliminar este elemento del catálogo?'))return;try{await api(`/api/admin/catalog/${encodeURIComponent(btn.dataset.deleteItem)}`,{method:'DELETE'});notice('Elemento eliminado.');await loadCatalog();}catch(e){notice(e.message);}}));
    }catch(e){out.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`;}
  }
  async function loadBackups(){
    const out=$('#backup-list');out.innerHTML='<div class="empty-state">Buscando copias…</div>';
    try{const {backups}=await api('/api/admin/backups');out.innerHTML=backups.length?backups.map(b=>`<div class="project-row"><div><h4>${esc(b.id)}</h4><p>Info ${b.size} bytes · copia cifrada en R2</p></div><button class="small" data-download-backup="${esc(b.id)}">Descargar ZIP cifrado</button></div>`).join(''):'<div class="empty-state">No hay copias todavía. Pulsa “Crear copia ahora” o despliega el Worker programado.</div>';
      $$('[data-download-backup]').forEach(btn=>btn.addEventListener('click',async()=>{btn.disabled=true;try{const response=await api(`/api/admin/backup?id=${encodeURIComponent(btn.dataset.downloadBackup)}`);await downloadResponse(response,`RMSS-Backup-${btn.dataset.downloadBackup}`);}catch(e){notice(e.message);}finally{btn.disabled=false;}}));
    }catch(e){out.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`;}
  }
  async function refreshAll(){await Promise.all([loadUsers(),loadProjects(),loadCatalog(),loadBackups()]);}
  $('#admin-refresh')?.addEventListener('click',refreshAll);
  $('#close-project-detail')?.addEventListener('click',()=>$('#project-detail').classList.add('hidden'));
  $('#catalog-reset')?.addEventListener('click',()=>{$('#catalog-form').reset();$('#catalog-id').value='';$('#catalog-file').required=true;$('#catalog-preview').value='';$('#catalog-preview-image').value='';$('#catalog-variant-files').value='';$('#catalog-message').textContent='';});
  $('#catalog-form')?.addEventListener('submit',async e=>{e.preventDefault();const msg=$('#catalog-message');msg.textContent='Guardando archivo y metadatos…';const form=new FormData(e.currentTarget);if(!$('#catalog-id').value)form.delete('id');try{const result=await api('/api/admin/catalog',{method:'POST',body:form});msg.textContent=`Guardado: ${result.name} (${result.price_credits} créditos).`;$('#catalog-form').reset();$('#catalog-id').value='';$('#catalog-file').required=true;$('#catalog-preview').value='';$('#catalog-preview-image').value='';$('#catalog-variant-files').value='';await loadCatalog();}catch(err){msg.textContent=err.message;}});
  $('#create-backup')?.addEventListener('click',async()=>{const btn=$('#create-backup');btn.disabled=true;$('#backup-message').textContent='Creando copia cifrada de los datos y archivos…';try{const result=await api('/api/admin/backup',{method:'POST',body:'{}'});$('#backup-message').textContent=`Copia creada: ${result.backup.id}; ${result.backup.objects} objetos copiados.`;await loadBackups();}catch(e){$('#backup-message').textContent=e.message;}finally{btn.disabled=false;}});
  $('#admin-logout')?.addEventListener('click',async()=>{try{await api('/api/admin/logout',{method:'POST',body:'{}'});}catch{}sessionStorage.removeItem('rm_admin_token');location.href='/admin.html';});
  async function init(){
    const login=$('#github-admin-login');if(login)login.href=`${API_BASE}/api/admin/login`;
    const params=new URLSearchParams(location.hash.replace(/^#/,''));const code=params.get('admin_code');
    if(code){try{const exchanged=await api('/api/admin/exchange',{method:'POST',body:JSON.stringify({code})});if(exchanged.sessionToken)sessionStorage.setItem('rm_admin_token',exchanged.sessionToken);history.replaceState({},document.title,location.pathname);}catch(e){notice(`No se pudo completar el acceso GitHub: ${e.message}`);history.replaceState({},document.title,location.pathname);}}
    try{const {admin}=await api('/api/admin/me');$('#admin-login-name').textContent=`GitHub: ${admin.github_login}`;$('#admin-gate').classList.add('hidden');$('#admin-app').classList.remove('hidden');$('#admin-logout').classList.remove('hidden');await refreshAll();}
    catch(e){$('#admin-gate').classList.remove('hidden');$('#admin-app').classList.add('hidden');if(e.status!==401){const p=$('#admin-gate p');if(p)p.textContent=`No se pudo validar el panel: ${e.message}. Revisa las variables y bindings de Cloudflare.`;}}
  }
  init();
})();
