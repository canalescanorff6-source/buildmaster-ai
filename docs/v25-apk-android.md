# v25 — Preparação para APK Android

Mudanças desta versão:

- Adicionado Capacitor para empacotar o BuildMaster como app Android.
- Adicionado `capacitor.config.ts`.
- Next.js configurado com `output: 'export'` para gerar arquivos estáticos em `out/`.
- Scripts adicionados:
  - `apk:web`
  - `apk:add-android`
  - `apk:sync`
  - `apk:open`
  - `apk:debug`
- Middleware removido da versão APK/exportada.
- Manifest e Service Worker atualizados para v25.
- Vercel configurado com `npm install` para evitar erro de lock antigo.
