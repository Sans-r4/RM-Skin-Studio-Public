(() => {
  'use strict';
  const API_BASE=String(window.RMSS_CONFIG?.apiBaseUrl||'').replace(/\/+$/,'');
  const api=async(path,options={})=>{
    if(window.RMSS_AUTH_READY){try{await window.RMSS_AUTH_READY;}catch{}}
    let token=null;try{if(window.RMSSAuth?.getIdToken)token=await window.RMSSAuth.getIdToken();}catch{}
    if(!token)token=sessionStorage.getItem('rm_session_token');
    const headers={...(options.body&&!(options.body instanceof FormData)?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`} : {}),...(options.headers||{})};
    const res=await fetch(`${API_BASE}${path}`,{credentials:API_BASE?'omit':'same-origin',...options,headers});
    const type=res.headers.get('content-type')||'';
    if(!res.ok){let msg=`Request failed (${res.status})`;if(type.includes('application/json')){const o=await res.json().catch(()=>({}));msg=o.error||msg;}else msg=(await res.text().catch(()=>''))||msg;const e=new Error(msg);e.status=res.status;throw e;}
    return type.includes('application/json')?res.json():res;
  };
  function notice(msg){let n=document.getElementById('rm-studio-notice');if(!n){n=document.createElement('div');n.id='rm-studio-notice';n.className='rm-studio-notice';n.setAttribute('role','status');document.body.appendChild(n);}n.textContent=msg;n.classList.add('show');clearTimeout(window.__rmStudioTimer);window.__rmStudioTimer=setTimeout(()=>n.classList.remove('show'),4500);}
  async function me(){try{return (await api('/api/auth/me')).user;}catch{return null;}}
  function ensureToolbar(){
    const header=document.querySelector('header');
    const bar=document.createElement('div');bar.className='rm-studio-toolbar';bar.innerHTML='<span class="rm-studio-credits">◈ <b id="rm-studio-credits">—</b></span><a href="/studios/skin.html">Skin</a><a href="/studios/calendar.html">Calendar</a><a href="/studios/gif.html">GIF</a><button type="button" id="rm-save-project">Guardar proyecto</button><a href="/index.html">Panel</a>';
    if(header){const group=header.querySelector('div.flex.gap-2');if(group){group.insertBefore(bar,group.firstChild);return;}}
    bar.classList.add('rm-studio-toolbar-floating');document.body.appendChild(bar);
  }
  function currentPayload(){if(typeof window.__RM_GET_STATE!=='function')throw new Error('Este estudio no ha preparado los datos del proyecto.');return window.__RM_GET_STATE();}
  async function updateCredits(){try{const u=await me();const n=document.getElementById('rm-studio-credits');if(n)n.textContent=u?u.credits:'Inicia sesión';}catch{}}
  async function savePayload(payload, existingId=null){
    const user=await me();if(!user){savePending(payload,'save');location.href=`/index.html?next=${encodeURIComponent(location.pathname+location.search)}`;return;}
    const id=existingId||new URL(location.href).searchParams.get('project');
    const result=await api(id?`/api/projects/${encodeURIComponent(id)}`:'/api/projects',{method:id?'PUT':'POST',body:JSON.stringify({studio:payload.studio,name:payload.name,projectData:payload.config})});
    const url=new URL(location.href);url.searchParams.set('project',result.id);history.replaceState({},'',url.toString());window.__RM_CURRENT_PROJECT_ID=result.id;notice('Proyecto guardado de forma privada en tu cuenta.');
  }
  function savePending(payload,action){try{sessionStorage.setItem('rm_pending_studio_action',JSON.stringify({action,payload,path:location.pathname}));}catch{notice('Inicia sesión antes de continuar; el navegador no pudo guardar temporalmente tu estado.');}}
  async function exportPayload(payload){
    const user=await me();if(!user){savePending(payload,'export');location.href=`/index.html?next=${encodeURIComponent(location.pathname+location.search)}`;return;}
    const button=document.querySelector('header button[onclick*="exportSkin"],header button[onclick*="exportWidget"]');if(button){button.disabled=true;button.dataset.originalText=button.textContent;button.textContent='Generando ZIP en servidor…';}
    try{
      const response=await api('/api/export',{method:'POST',body:JSON.stringify(payload)});
      const blob=await response.blob();const header=response.headers.get('Content-Disposition')||'';const match=header.match(/filename="?([^";]+)"?/i);const filename=match?.[1]||`${payload.name||'RMSS-Export'}.zip`;
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
      const balance=response.headers.get('X-RM-Credits-Remaining');if(balance!==null)document.getElementById('rm-studio-credits').textContent=balance;
      notice(`ZIP generado. Se descontaron los créditos de exportación. Saldo: ${balance??'actualizado'}.`);
    }catch(e){notice(e.status===402?e.message:e.message);if(e.status===401){savePending(payload,'export');location.href=`/index.html?next=${encodeURIComponent(location.pathname+location.search)}`;}}
    finally{if(button){button.disabled=false;button.textContent=button.dataset.originalText||'Exportar ZIP Maestro';}}
  }
  async function loadProjectFromQuery(){
    const id=new URL(location.href).searchParams.get('project');if(!id)return;
    try {const result=await api(`/api/projects/${encodeURIComponent(id)}`);if(typeof window.__RM_LOAD_STATE==='function'){await window.__RM_LOAD_STATE(result);notice(`Proyecto «${result.name}» abierto.`);}else notice('Este estudio no admite restauración de proyectos todavía.');}
    catch(e){if(e.status===401){location.replace(`/index.html?next=${encodeURIComponent(location.pathname+location.search)}`);return;}notice(e.message);}
  }
  async function resumePending(){
    let pending;try{pending=JSON.parse(sessionStorage.getItem('rm_pending_studio_action')||'null');}catch{}
    if(!pending||pending.path!==location.pathname)return;
    sessionStorage.removeItem('rm_pending_studio_action');
    const u=await me();if(!u){savePending(pending.payload,pending.action);location.replace(`/index.html?next=${encodeURIComponent(location.pathname+location.search)}`);return;}
    if(pending.action==='export') await exportPayload(pending.payload);else if(pending.action==='save') await savePayload(pending.payload);
  }
  window.RMStudioBridge={api,notice,export:exportPayload,save:savePayload,getPayload:currentPayload,updateCredits};
  ensureToolbar();
  document.getElementById('rm-save-project')?.addEventListener('click',async()=>{try{await savePayload(await currentPayload());}catch(e){notice(e.message);}});
  updateCredits().then(()=>loadProjectFromQuery()).then(()=>resumePending());
})();
