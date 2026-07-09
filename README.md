# BuildMaster Elite Studio v22 — Scanner Elite + Console Pro

Versão corrigida para manter **as duas entradas premium**:

- **Scanner Elite por Print**: você envia o print completo da carta, o app faz leitura local com OCR/Tesseract, aplica calibração por zonas e abre a Auditoria Elite antes do plano final.
- **Console Pro Manual**: você preenche os dados manualmente quando quiser máxima precisão e zero risco de leitura errada.

Tudo continua local, sem IA paga e sem API externa para interpretar carta.

## O que mudou na v22

1. A opção de colocar print foi restaurada.
2. O fluxo de print ganhou nome premium: **Scanner Elite por Print**.
3. O modo manual ganhou nome premium: **Console Pro Manual**.
4. O app agora permite escolher entre print e manual na mesma tela.
5. O calibrador visual de áreas voltou para o painel.
6. O detector de qualidade do print aparece após importar imagem.
7. A leitura por print ainda passa pela **Auditoria Elite** antes de gerar ficha final.
8. Textos e cards foram ajustados para reduzir cortes, sobreposição e textos visíveis apenas no hover.
9. O aprendizado local continua ativo para lembrar correções anteriores.
10. Cache/PWA atualizado para v22.

## Validação

Comandos usados para validar:

```bash
npm run typecheck
npm run test:all
npm run build
```

## Deploy no Vercel

Substitua os arquivos antigos do repositório por esta versão extraída e faça redeploy com cache limpo.
