# BuildMaster Elite Tático v25.1 — APK Android

Esta versão está preparada para virar APK usando Capacitor.

## O que foi preparado

- Exportação estática do Next.js para a pasta `out/`.
- Configuração `capacitor.config.ts` com nome do app e ID Android.
- Scripts prontos para gerar projeto Android.
- Vercel ajustado para usar `npm install` no registro público do npm.
- Cache/PWA atualizado para v25.1.
- Middleware removido nesta versão porque o APK usa app local/exportado, sem servidor Next.

## Gerar APK no computador

Você precisa instalar:

1. Node.js 22 ou 24.
2. Android Studio.
3. Android SDK pelo próprio Android Studio.

Depois, dentro da pasta do projeto:

```bash
npm install --registry=https://registry.npmjs.org/
npm run apk:add-android
npm run apk:sync
npm run apk:open
```

No Android Studio:

1. Aguarde o Gradle sincronizar.
2. Vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. O APK debug costuma aparecer em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Gerar APK pelo terminal

Depois de instalar Android Studio/SDK:

```bash
npm run apk:debug
```

O arquivo gerado ficará em:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## APK para vender ou instalar em outros celulares

Para uma versão profissional/release, use no Android Studio:

```text
Build > Generate Signed Bundle / APK > APK
```

Crie uma chave `.jks`, guarde a senha e assine o APK. Sem assinatura release, o Android pode bloquear a instalação em alguns aparelhos.

## Observações importantes

- O app continua funcionando como site no Vercel.
- Para APK, use os scripts `apk:*`.
- O Leitor Elite por Print continua local, sem IA paga.
- A Central de Precisão Manual continua disponível.
- Se o OCR por print falhar em algum celular dentro do APK, use a Central Manual de Precisão como modo seguro.
