(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const api = window.RMSS?.api;
  if (!api || document.body.dataset.page !== 'settings') return;

  const text = (selector, value) => { const node = $(selector); if (node) node.textContent = value == null ? '—' : String(value); };
  const message = (selector, value, isError = false) => { const node = $(selector); if (node) { node.textContent = value || ''; node.dataset.kind = isError ? 'error' : 'success'; } };
  let currentUser = null;

  async function loadSettings(user) {
    if (!user) return;
    currentUser = user;
    const firebaseUser = window.RMSSAuth?.auth?.currentUser;
    text('#settings-email', user.email || firebaseUser?.email || '—');
    text('#settings-email-verified', firebaseUser?.emailVerified ? 'Sí' : 'No');
    text('#settings-credits', `${Number(user.credits || 0).toLocaleString()} créditos`);
    text('#settings-created', user.created_at ? new Date(user.created_at).toLocaleString() : '—');
    text('#settings-username', '');
    const username = $('#settings-username'); if (username) username.value = user.username || '';
    const premium = Number(user.is_premium || 0) === 1;
    const status = $('#settings-premium-status'); if (status) { status.textContent = premium ? 'Premium' : 'Estándar'; status.classList.toggle('good', premium); }
    text('#settings-plan-copy', premium ? `Premium está activo${user.premium_expires_at ? ` hasta ${new Date(user.premium_expires_at).toLocaleString()}` : ''}. Los espacios publicitarios se ocultan.` : 'Tu cuenta es estándar. Puedes adquirir Premium por $7.00 USD al mes.');
    const passwordForm = $('#password-form');
    const passwordAvailable = !!window.RMSSAuth?.hasPasswordProvider?.();
    if (passwordForm) passwordForm.classList.toggle('hidden', !passwordAvailable);
    $('#password-unavailable')?.classList.toggle('hidden', passwordAvailable);
    if (window.RMSSLanguage?.get) window.RMSSLanguage.set(window.RMSSLanguage.get());
  }

  $('#username-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const btn = $('#username-form button[type="submit"]');
    const value = ($('#settings-username')?.value || '').trim();
    message('#username-message', 'Guardando nombre de usuario…');
    if (!/^[A-Za-z0-9_-]{3,24}$/.test(value)) { message('#username-message', 'Usa entre 3 y 24 letras, números, guiones o guiones bajos.', true); return; }
    if (btn) btn.disabled = true;
    try {
      const result = await api('/api/account/username', { method: 'POST', body: JSON.stringify({ username: value }) });
      if (window.RMSSAuth?.auth?.currentUser) {
        try { await window.RMSSAuth.auth.currentUser.updateProfile({ displayName: result.username || value }); } catch (e) { console.warn('El nombre se guardó en el perfil de RMSS, pero Firebase displayName no pudo actualizarse.', e); }
      }
      if (currentUser) currentUser = { ...currentUser, username: result.username || value };
      window.RMSS_CURRENT_USER = currentUser;
      const header = $('#header-username'); if (header) header.textContent = result.username || value;
      message('#username-message', 'Los cambios se guardaron correctamente.');
    } catch (error) { message('#username-message', error.message || 'No se pudo guardar el nombre de usuario.', true); }
    finally { if (btn) btn.disabled = false; }
  });

  $('#password-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = $('#password-form'); const btn = form.querySelector('button[type="submit"]');
    const currentPassword = $('#current-password')?.value || '';
    const next = $('#new-password')?.value || ''; const repeated = $('#repeat-password')?.value || '';
    if (next.length < 10 || next.length > 128) { message('#password-message', 'La nueva contraseña debe tener entre 10 y 128 caracteres.', true); return; }
    if (next !== repeated) { message('#password-message', 'Las contraseñas nuevas no coinciden.', true); return; }
    if (currentPassword === next) { message('#password-message', 'La nueva contraseña debe ser diferente de la actual.', true); return; }
    if (btn) btn.disabled = true;
    message('#password-message', 'Verificando identidad y cambiando contraseña…');
    try {
      await window.RMSSAuth.changePassword({ currentPassword, newPassword: next });
      form.reset(); message('#password-message', 'Contraseña actualizada correctamente.');
    } catch (error) { message('#password-message', error.message || 'No se pudo cambiar la contraseña.', true); }
    finally { if (btn) btn.disabled = false; }
  });

  window.addEventListener('rmss:settings-user-ready', event => loadSettings(event.detail?.user));
  window.addEventListener('rmss:user-state', event => { if (event.detail?.user) loadSettings(event.detail.user); });
  window.RMSS_USER_READY?.then(user => { if (user) loadSettings(user); });
})();
