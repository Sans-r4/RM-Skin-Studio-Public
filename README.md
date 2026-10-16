# RM Skin Studio — frontend público

Frontend estático de RM Skin Studio. Está construido con HTML, CSS y JavaScript vanilla, y se publica desde GitHub a Cloudflare Pages. No usa React, Vue ni un servidor Node en tiempo de ejecución.

## Archivos importantes

- `index.html`: autenticación Firebase, panel de usuario, créditos y pagos.
- `catalog.html` / `downloads.html`: tienda pública y descargas compradas.
- `settings.html`: nombre de usuario, idioma y cambio seguro de contraseña.
- `pricing.html`: plan Premium de USD 7 al mes.
- `admin.html`: panel de administración autenticado por GitHub OAuth; el backend privado autoriza las operaciones.
- `studios/`: Skin Studio, Calendar Studio y GIF Studio.
- `assets/config.js`: configuración pública del frontend. Conserva las claves/nombres existentes; no pegues aquí secretos de servidor.
- `assets/firebase-auth.js`: integración Firebase Auth.
- `assets/i18n.js`: idioma ES/EN/FR/PT/ZH/JA/RU; preferencia en `localStorage` con la clave `rmss_lang`.
- `assets/payments.js` / `assets/pricing.js`: flujos PayPal y Google Pay/subscription.
- `assets/ads.js`: anuncios Adsterra. Preserva la clave de banner `90461359d6979dc4291372ce39688f2f`; no añadas Popunder ni redirecciones automáticas.

## Economía

- Las exportaciones de los tres estudios cuestan exactamente **200 créditos** cada una.
- La equivalencia visual del sistema es **100 créditos = USD 1.00**, por lo tanto 200 créditos equivalen a USD 2.00.
- Compras de crédito: entre 100 y 10.000 créditos, en saltos de 100; máximo equivalente USD 100 por orden. El servidor vuelve a validar toda cantidad y precio.
- El precio de cada elemento del catálogo sigue siendo personalizable desde el admin (0–100.000 créditos); el panel muestra su equivalencia USD según la relación de 100 créditos por dólar.
- Premium cuesta USD 7.00/mes y debe activarse solo tras validar la suscripción PayPal en el backend. Los usuarios Premium no ven los contenedores `.ad-slot` cuando se ha actualizado el estado de cuenta.
- La bonificación inicial continúa siendo 25 créditos y se gestiona una sola vez desde el backend.

## Instalación/despliegue

1. Sube el contenido de esta carpeta a la raíz de `Sans-r4/RM-Skin-Studio-Public`.
2. Conecta el repositorio a Cloudflare Pages. Usa la raíz `/`, sin comando de build (sitio HTML estático), y asigna el dominio `pages.dev`.
3. Conserva `assets/config.js` y confirma que `apiBaseUrl` apunta al Worker y `turnstileSiteKey` sea la clave pública de tu widget Turnstile.
4. Añade el host `pages.dev` en Firebase Authentication → Authorized domains.
5. Comprueba que la API, Firebase, Turnstile y PayPal estén configurados antes de abrir el sitio al público.
6. Revisa los archivos del backend y ejecuta migraciones en orden; instrucciones completas en `README-UPDATE-ES.md` del paquete integrado y en el README privado del backend.

## Pruebas previas al lanzamiento

- Registro por correo, verificación, restablecimiento, Google Sign-In y cierre de sesión.
- CAPTCHA validado desde el Worker, no solo por la interfaz.
- Saldo y bono inicial sin duplicados.
- Orden PayPal de prueba, capture idempotente y comprobación de saldo.
- Exportación cobra 200 créditos en Skin/Calendar/GIF.
- Carga R2 y URL externa desde admin; precio y preview correctos.
- Ban/unban, registro de actividad y ocultación de anuncios Premium.
- Comportamiento del header fijo y selector de los siete idiomas en móvil y escritorio.

No pongas secretos OAuth, PayPal, Turnstile Secret ni claves de cifrado en el repositorio público. La clave web Firebase y la Site Key Turnstile sí son de configuración cliente; su seguridad depende de la validación del backend y del origen autorizado.
