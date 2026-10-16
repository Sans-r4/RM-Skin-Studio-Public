# RM Skin Studio — frontend público

**Repositorio:** `Sans-r4/RM-Skin-Studio-Public`  
**Hosting:** Cloudflare Pages (usa el dominio gratis `pages.dev` al comenzar).  
**Backend:** Cloudflare Worker privado + D1 + R2.

## Qué incluye

- Skin Studio, Calendar Studio y GIF Studio.
- Catálogo público y Descargables; previews Rainmeter SVG aproximadas o capturas de respaldo; selector de variantes.
- Registro con Firebase email/password, verificación de email, recuperación de contraseña y botón **Continuar con Google**.
- Integración cliente con Cloudflare Turnstile; el Worker valida CAPTCHA y tokens Firebase.
- Perfil y créditos comerciales en D1; las cuentas nuevas reciben 25 créditos una sola vez al crear el perfil.
- Panel `admin.html` protegido por GitHub OAuth para la cuenta autorizada `Sans-r4`.
- Casillas preparadas para banners de Adsterra; no hay códigos publicitarios insertados por defecto.

## Separación de repositorios

No copies `functions/`, `migrations/` ni las plantillas del backend al repo público. La API y los archivos originales `.ini`/`.zip` deben permanecer en el repo privado `Sans-r4/RM-Skin-Studio-Backend-Private` y en R2 privado. GitHub solo guarda el código; Cloudflare Pages sirve el frontend.

## Configurar el frontend

En `assets/config.js`, configura estos valores de tu propio despliegue:

- `apiBaseUrl`: URL HTTPS real del Cloudflare Worker, sin `/` final.
- `turnstileSiteKey`: Site Key pública de Cloudflare Turnstile.
- `firebase.apiKey`, `authDomain`, `projectId`, `appId`, `messagingSenderId`: configuración web copiada desde Firebase Console.

`firebase.projectId` debe coincidir con `FIREBASE_PROJECT_ID` en las variables del Worker. Estas son claves de configuración web; no incluyas secretos de servidor aquí.

## Firebase Authentication Spark

1. Crea proyecto/app web en [Firebase Console](https://console.firebase.google.com/), mantén el plan Spark y no vincules facturación.
2. Activa Email/Password y Google en Authentication → Sign-in method.
3. Añade el hostname exacto de Pages (por ejemplo `mi-web.pages.dev`) en Authentication → Settings → Authorized domains.
4. Ajusta los datos de Firebase y la URL Worker en `assets/config.js`.
5. Ejecuta las migraciones `0001` a `0005` en orden en Cloudflare D1, y pon `FIREBASE_PROJECT_ID` en el Worker.
6. Prueba registro, verificación de email, login, recuperación, Google y CAPTCHA.

El código del Worker verifica criptográficamente los ID tokens Firebase, exige correo verificado y requiere un ticket de CAPTCHA de un solo uso para crear/vincular el perfil desde el flujo de inicio de sesión. No confía solo en datos que el navegador envíe como username/email.

## Créditos, catálogo y pagos

- Bono inicial: 25 créditos, una sola vez por perfil.
- Exportar: Skin 30, Calendar 35, GIF 40 créditos.
- Precio de catálogo controlado desde admin: 0–100000 créditos.
- Créditos: 100–2000 en saltos de 50. Empieza con PayPal Sandbox; los pagos reales tienen comisiones.

## Adsterra y privacidad

Inserta solo códigos de Banner o Native Banner aprobados y comprueba su comportamiento. Los espacios están vacíos por defecto; el sitio no añade pop-under ni redirecciones automáticas. Actualiza `privacy.html` para declarar Firebase, Cloudflare, PayPal, Adsterra y cualquier analítica que realmente actives.

## Previews Rainmeter

El frontend no recibe el INI comercial original a través de la ruta de preview. Para INI compatibles el backend genera un SVG estático; para skins complejos, sube una captura real. La preview es visual y puede capturarse; el original permanece privado hasta una descarga autorizada.

## Coste cero y publicación

Puedes publicar desde GitHub.com + Cloudflare Pages/Workers Builds sin instalar Git, Node.js o Wrangler en Windows. Usa planes gratuitos y `pages.dev`; revisa cuotas y no actives upgrades. Firebase Spark incluye funciones gratuitas de autenticación dentro de sus límites. [Límites de Firebase Auth](https://firebase.google.com/docs/auth/limits) y [plan Spark](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

## Antes del lanzamiento

- [ ] Backend privado y frontend público en repos separados.
- [ ] `APP_ORIGIN`, Firebase, Turnstile y bindings D1/R2 configurados.
- [ ] Migraciones `0001`–`0005` ejecutadas una sola vez.
- [ ] Login por email, verificación, reset de contraseña, Google y CAPTCHA probados.
- [ ] Bono de 25 créditos no se repite al iniciar sesión otra vez.
- [ ] Admin GitHub OAuth solo permite a `Sans-r4`.
- [ ] Descargas originales no accesibles sin autorización.
- [ ] PayPal Sandbox y backups probados.

## Estado

Estos archivos no se han subido a tus cuentas ni desplegado. Debes configurar las claves en los paneles y hacer pruebas completas antes de aceptar pagos reales.
