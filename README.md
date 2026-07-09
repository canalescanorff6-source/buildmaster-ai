# BuildMaster Elite Studio v21 — Manual Premium

Versão ajustada para ficar com aparência e fluxo mais premium, sem depender de OCR. O app agora trabalha com **Console Elite Manual**, onde você informa posição, estilo, pontos e atributos, revisa tudo na auditoria e só então gera o plano final.

## O que mudou

1. **Modo manual único** — a tela não mostra mais fluxo de leitura por print/OCR.
2. **Novo nome premium** — BuildMaster Elite Studio v21.
3. **Console Elite Manual** — substitui o nome comum “modo manual preciso sem OCR”.
4. **Textos e botões renomeados** — termos mais profissionais: Perfil de performance, Sistema tático, Modelo de jogo, Função alvo, Plano Elite.
5. **Layout corrigido** — campos, selects, botões, cards e tabelas foram ajustados para evitar texto cortado, bagunçado ou visível apenas ao passar o mouse.
6. **Entrada manual controlada** — o programa não troca posição/estilo por leitura errada, porque não usa OCR nesse fluxo.
7. **Auditoria Elite** — os dados principais precisam ser revisados antes do plano final.
8. **Plano seguro, competitivo e alternativo** — mantém os três perfis de ficha.
9. **Comparação com plano-base** — mostra diferença entre plano-base e recomendado quando houver dados.
10. **Cache/PWA atualizado para v21** — limpar cache ou reinstalar PWA após subir no Vercel.

## Validação

Comandos usados para validar:

```bash
npm run typecheck
npm run test:all
npm run build
```

## Deploy no Vercel

Substitua os arquivos antigos do repositório por esta versão extraída e faça redeploy com cache limpo.
