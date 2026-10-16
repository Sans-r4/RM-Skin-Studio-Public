# Despliegue frontend en español

1. Sube esta carpeta a la raíz del repo GitHub `Sans-r4/RM-Skin-Studio-Public`.
2. Conecta el repositorio con Cloudflare Pages y usa el root `/` sin build command.
3. Conserva `assets/config.js`: los IDs y claves públicas actuales se dejaron intactos.
4. Revisa `APP_ORIGIN` del Worker y los dominios autorizados de Firebase.
5. Consulta `README-MASTER-UPGRADE-ES.md` del paquete completo para configuración del backend, migración D1, PayPal, Firebase, Turnstile, Admin y regresión.
