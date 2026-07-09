# BuildMaster Elite Tático v24.1

Versão premium local, sem IA paga, com foco em ficha de desempenho real dentro do jogo.

## Modos principais

- **Leitor Elite de Carta**: envio de print completo, leitura local, calibração por zonas e Auditoria Elite antes do plano final.
- **Central de Precisão Manual**: preenchimento manual para máxima confiança quando o print não estiver ideal.
- **Guia Tático Premium**: variações de formação, estilo de técnico recomendado, orientação de como jogar e função de cada setor.

## Novidades v24

1. Textos revisados para português e nomes mais premium.
2. Adicionadas variações de formações: 4-2-2-2, 4-3-3, 4-1-2-3, 4-2-1-3, 4-2-3-1, 4-3-1-2, 4-1-3-2, 4-4-2, 4-1-4-1, 3-2-4-1, 3-4-3, 3-5-2, 5-3-2 e 5-2-3.
3. Estilos de técnico ajustados para: Posse de bola, Contra-ataque, Contra-ataque rápido, Por fora e Passe longo.
4. Cada formação mostra o melhor estilo sugerido, como jogar e o papel dos jogadores.
5. Motor tático atualizado para considerar formação e estilo na recomendação da melhor função em campo.
6. Layout reforçado para evitar texto cortado, escondido ou dependente de passar o mouse.
7. Cache/PWA atualizado para v24.

## Validação

```bash
npm run typecheck
npm run test:all
npm run build
```

Tudo continua local, privado e sem chamada para IA paga.


## Correção Vercel v24.1

Esta versão fixa o ambiente de build no Vercel: Node.js travado em 24.x, `.nvmrc`, `.node-version` e `installCommand` com `npm ci` usando o registro público do npm.
