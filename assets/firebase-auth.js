/* Firebase Authentication bridge for RM Skin Studio. Loads via Firebase compat CDN. */
(() => {
  'use strict';
  const config = window.RMSS_CONFIG || {};
  const fb = config.firebase || {};
  const apiBase = String(config.apiBaseUrl || '').replace(/\/+$/, '');
  const required = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missing = required.some(k => !fb[k] || String(fb[k]).startsWith('REPLACE-'));
  let resolveReady;
  const readyPromise = new Promise(resolve => { resolveReady = resolve; });
  window.RMSS_AUTH_READY = readyPromise;
  window.RMSSAuth = null;
  window.RMSSAuthSetupError = '';

  if (!window.firebase || missing || !apiBase || apiBase.includes('REPLACE-WITH')) {
    window.RMSSAuthSetupError = 'Falta configurar Firebase en assets/config.js y la URL real del Worker. Sigue la guía Firebase de RM Skin Studio.';
    resolveReady(null);
    return;
  }

  let auth;
  try {
    const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(fb);
    auth = app.auth();
    auth.languageCode = 'es';
  } catch (err) {
    window.RMSSAuthSetupError = 'No se pudo iniciar Firebase. Comprueba los valores de assets/config.js.';
    console.error(err);
    resolveReady(null);
    return;
  }

  const profileTasks = new Map();
  let persistenceReady = auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(err => {
    console.warn('No se pudo activar persistencia local de Firebase; se usará la disponibilidad del navegador.', err);
  });

  async function responseJson(response) {
    const type = response.headers.get('content-type') || '';
    const data = type.includes('application/json') ? await response.json().catch(() => ({})) : { error: await response.text().catch(() => '') };
    if (!response.ok) {
      const e = new Error(data.error || `Error HTTP ${response.status}`);
      e.status = response.status;
      throw e;
    }
    return data;
  }

  async function post(path, body, idToken = '') {
    const headers = { 'Content-Type': 'application/json' };
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
    return responseJson(await fetch(`${apiBase}${path}`, {
      method: 'POST', credentials: 'omit', headers, body: JSON.stringify(body || {})
    }));
  }

  function friendlyError(error) {
    const code = String(error?.code || '');
    const known = {
      'auth/email-already-in-use': 'Ese correo ya tiene cuenta. Inicia sesión en lugar de registrarte.',
      'auth/invalid-email': 'El correo no tiene un formato válido.',
      'auth/invalid-credential': 'Correo o contraseña incorrectos.',
      'auth/wrong-password': 'Correo o contraseña incorrectos.',
      'auth/user-not-found': 'No existe una cuenta con ese correo.',
      'auth/weak-password': 'La contraseña es demasiado débil. Usa al menos 10 caracteres.',
      'auth/too-many-requests': 'Firebase bloqueó temporalmente los intentos. Espera un poco y prueba de nuevo.',
      'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
      'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Permite ventanas emergentes y vuelve a intentarlo.',
      'auth/unauthorized-domain': `Este dominio no está autorizado en Firebase. Añade ${location.hostname} en Authentication → Settings → Authorized domains.`,
      'auth/operation-not-allowed': 'Activa el proveedor correspondiente en Firebase Authentication → Sign-in method.',
      'auth/network-request-failed': 'No se pudo conectar con Firebase. Comprueba tu conexión e inténtalo de nuevo.'
    };
    if (known[code]) return new Error(known[code]);
    return error instanceof Error ? error : new Error('No se pudo completar la autenticación.');
  }

  function sanitizeUsername(raw, fallback = 'RM_Creator') {
    let s = String(raw || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9_-]/g, '_').replace(/_+/g, '_').replace(/^[_-]+|[_-]+$/g, '').slice(0, 24);
    if (s.length < 3) s = fallback;
    return s;
  }

  async function verifyCaptcha(action, token) {
    await persistenceReady;
    if (!token) throw new Error('Completa primero el CAPTCHA de Cloudflare.');
    const result = await post('/api/auth/preflight', { action, turnstileToken: token });
    if (!result.ok || !result.preflightTicket) throw new Error('Cloudflare no pudo validar el CAPTCHA.');
    return result.preflightTicket;
  }

  async function ensureBackendProfile(user, requestedUsername = '', options = {}) {
    if (!user) throw new Error('No hay una sesión de Firebase activa.');
    if (profileTasks.has(user.uid)) return profileTasks.get(user.uid);
    const task = (async () => {
      await user.reload();
      if (!user.emailVerified) throw new Error('Debes verificar tu correo antes de usar RM Skin Studio.');
      const stored = (() => { try { return localStorage.getItem('rm_pending_username') || ''; } catch { return ''; } })();
      const username = sanitizeUsername(requestedUsername || stored || user.displayName || (user.email || '').split('@')[0]);
      const token = await user.getIdToken(true);
      const data = await post('/api/auth/bootstrap', { username, preflightTicket: options.preflightTicket || '' }, token);
      try { localStorage.removeItem('rm_pending_username'); } catch {}
      return data.user;
    })();
    profileTasks.set(user.uid, task);
    try { return await task; } finally { profileTasks.delete(user.uid); }
  }

  const client = {
    auth,
    async getIdToken(forceRefresh = false) {
      await readyPromise;
      const user = auth.currentUser;
      if (!user || !user.emailVerified) return null;
      try { return await user.getIdToken(forceRefresh); } catch { return null; }
    },
    verifyCaptcha,
    async register({ email, password, username, turnstileToken }) {
      await verifyCaptcha('register', turnstileToken);
      await persistenceReady;
      const safeUsername = sanitizeUsername(username);
      try {
        const credential = await auth.createUserWithEmailAndPassword(String(email || '').trim().toLowerCase(), password);
        try { await credential.user.updateProfile({ displayName: safeUsername }); } catch {}
        try { localStorage.setItem('rm_pending_username', safeUsername); } catch {}
        const actionCodeSettings = { url: `${location.origin}/index.html?verified=1`, handleCodeInApp: false };
        try { await credential.user.sendEmailVerification(actionCodeSettings); }
        catch (mailError) { await auth.signOut(); throw new Error('Firebase creó la cuenta, pero no pudo enviar el correo de verificación. Revisa Authentication → Templates y vuelve a intentar el inicio de sesión para reenviar el enlace.'); }
        await auth.signOut();
        return { ok: true, message: 'Cuenta creada. Firebase te ha enviado un correo de verificación. Abre el enlace y luego inicia sesión.' };
      } catch (err) {
        throw friendlyError(err);
      }
    },
    async login({ email, password, turnstileToken }) {
      const preflightTicket = await verifyCaptcha('login', turnstileToken);
      await persistenceReady;
      let credential;
      try { credential = await auth.signInWithEmailAndPassword(String(email || '').trim().toLowerCase(), password); }
      catch (err) { throw friendlyError(err); }
      const user = credential.user;
      try { await user.reload(); } catch {}
      if (!user.emailVerified) {
        let resent = false;
        try { await user.sendEmailVerification({ url: `${location.origin}/index.html?verified=1`, handleCodeInApp: false }); resent = true; } catch (err) { console.warn('No se pudo reenviar la verificación ahora.', err); }
        await auth.signOut();
        throw new Error(resent
          ? 'Tu correo aún no está verificado. Te reenviamos el enlace; revisa también Spam y vuelve a iniciar sesión cuando lo confirmes.'
          : 'Tu correo aún no está verificado. Abre el enlace de Firebase en tu correo y vuelve a iniciar sesión.');
      }
      try { await ensureBackendProfile(user, '', { preflightTicket }); } catch (err) { throw friendlyError(err); }
      return { ok: true, user };
    },
    async continueWithGoogle({ turnstileAction, turnstileToken }) {
      const preflightTicket = await verifyCaptcha(turnstileAction, turnstileToken);
      await persistenceReady;
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        await user.reload();
        if (!user.emailVerified) throw new Error('Google no devolvió un correo verificado para esta cuenta.');
        const username = sanitizeUsername(user.displayName || (user.email || '').split('@')[0]);
        await ensureBackendProfile(user, username, { preflightTicket });
        return { ok: true, user };
      } catch (err) { throw friendlyError(err); }
    },
    async resetPassword({ email, turnstileToken }) {
      await verifyCaptcha('password-reset', turnstileToken);
      await persistenceReady;
      try {
        await auth.sendPasswordResetEmail(String(email || '').trim().toLowerCase(), { url: `${location.origin}/index.html`, handleCodeInApp: false });
        return { ok: true, message: 'Si el correo está registrado, Firebase enviará las instrucciones para restablecer la contraseña.' };
      } catch (err) { throw friendlyError(err); }
    },
    hasPasswordProvider() {
      return !!auth.currentUser?.providerData?.some(provider => provider.providerId === 'password');
    },
    async changePassword({ currentPassword, newPassword }) {
      await persistenceReady;
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Inicia sesión otra vez para cambiar tu contraseña.');
      if (!this.hasPasswordProvider()) throw new Error('Esta cuenta no utiliza el acceso por correo y contraseña.');
      if (typeof newPassword !== 'string' || newPassword.length < 10 || newPassword.length > 128) throw new Error('La nueva contraseña debe tener entre 10 y 128 caracteres.');
      try {
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, String(currentPassword || ''));
        await user.reauthenticateWithCredential(credential);
        await user.updatePassword(newPassword);
        await user.getIdToken(true);
        return { ok: true };
      } catch (err) { throw friendlyError(err); }
    },
    async signOut() { await auth.signOut(); try { localStorage.removeItem('rm_pending_username'); } catch {} }
  };

  window.RMSSAuth = client;
  let initialStateResolved = false;
  // Do not create D1 profiles merely because Firebase restored a browser session.
  // Profile creation must flow through login/Google after server-verified Turnstile preflight.
  auth.onAuthStateChanged(() => {
    if (!initialStateResolved) {
      initialStateResolved = true;
      resolveReady(client);
      window.dispatchEvent(new CustomEvent('rmss-auth-ready'));
    }
  }, err => {
    window.RMSSAuthLastError = err?.message || 'No se pudo restaurar la sesión Firebase.';
    if (!initialStateResolved) { initialStateResolved = true; resolveReady(client); }
  });
})();
