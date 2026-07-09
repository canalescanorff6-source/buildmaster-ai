# Gerar APK Android — BuildMaster Elite Tático v27

Pré-requisitos:

- Node.js 22 ou 24
- Android Studio instalado
- Android SDK configurado

Comandos:

```bash
npm install --registry=https://registry.npmjs.org/
npm run apk:add-android
npm run apk:sync
npm run apk:open
```

No Android Studio:

```text
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

APK debug esperado:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```
