# Frontend RM Skin Studio — versión compatible con actualización 0008

Esta carpeta contiene la aplicación pública completa en HTML, CSS y JavaScript vanilla. Para una actualización completa, usa el contenido íntegro de esta carpeta y despliega mediante Cloudflare Pages.

El menú de moderación y Premium se alimenta de la API del Worker privado. Publica primero la migración D1 0008 y el Worker compatible, y después despliega Pages.

No cambies las claves de `assets/config.js`, las claves Firebase/Turnstile ni las URL/clave de Adsterra. El panel consulta el saldo real del usuario desde D1 a través del Worker; no mantiene un saldo administrativo independiente.

Consulta `README-0008-UPGRADE-ES.md` en el backend o `DOCUMENTACION/README-0008-UPGRADE-ES.md` en el bundle completo antes del despliegue.
