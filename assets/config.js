/* Configuración pública de RM Skin Studio. No pongas secretos aquí. */
window.RMSS_CONFIG = Object.assign({
  apiBaseUrl: 'https://REPLACE-WITH-YOUR-WORKER.workers.dev',
  turnstileSiteKey: 'REPLACE-WITH-CLOUDFLARE-TURNSTILE-SITE-KEY',
  firebase: {
    apiKey: 'REPLACE-WITH-FIREBASE-API-KEY',
    authDomain: 'REPLACE-WITH-FIREBASE-PROJECT.firebaseapp.com',
    projectId: 'REPLACE-WITH-FIREBASE-PROJECT-ID',
    appId: 'REPLACE-WITH-FIREBASE-APP-ID',
    messagingSenderId: 'REPLACE-WITH-FIREBASE-SENDER-ID'
  }
}, window.RMSS_CONFIG || {});
