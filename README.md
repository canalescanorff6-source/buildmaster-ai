# BuildMaster Elite Tático v27 — Capacitor + TypeScript Fix

Versão corrigida para Vercel e preparada para APK Android.

## Correções principais

- Removida a propriedade `bundledWebRuntime` do `capacitor.config.ts`, pois ela não existe mais no tipo `CapacitorConfig` usado pelo Capacitor atual.
- Corrigidos erros de TypeScript em eventos `onChange` e logger do OCR.
- Mantida saída estática do Next.js em `out/`, compatível com Vercel e Capacitor.
- Mantidos os modos Leitor Elite por Print e Central de Precisão Manual.

## Deploy no Vercel

1. Extraia o ZIP.
2. Envie os arquivos extraídos para o GitHub, substituindo os antigos.
3. No Vercel, use **Redeploy** com **Clear Build Cache**.

## APK Android

Siga o arquivo `README_APK.md`.
