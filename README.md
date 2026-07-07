# BuildMaster AI Vision Only

Versão enxuta e premium do BuildMaster AI, focada somente em análise por imagem da carta do eFootball.

## O que esta versão faz

- Envia print/foto da carta.
- Roda OCR local no navegador com Tesseract.js.
- Permite revisar e corrigir o texto lido.
- Gera ficha/build recomendada.
- Calcula PRI por setor.
- Mostra melhor posição real em PT-BR.
- Recomenda habilidades adicionais com nomes em PT-BR.
- Mostra como usar o jogador em campo.
- Funciona como PWA instalável no celular.
- Não depende de banco PostgreSQL, Prisma, login, CRUD, dashboard antigo ou servidor pesado.

## Importante sobre precisão

Nenhum OCR consegue garantir 100% de acerto em foto tremida, cortada, escura ou com texto pequeno. Por isso esta versão usa o fluxo mais seguro:

1. Ler a imagem automaticamente.
2. Mostrar o texto extraído.
3. Permitir correção manual.
4. Gerar a ficha depois da confirmação.

Com print nítido e revisão manual, a recomendação fica muito mais confiável.

## Rodar local

```bash
npm install
npm run dev
```

Abra:

```text
http://localhost:3000
```

## Deploy na Vercel

Não precisa configurar Neon nem DATABASE_URL.

1. Suba os arquivos para o GitHub.
2. Importe na Vercel.
3. Framework: Next.js.
4. Build command: `npm run vercel-build`.
5. Deploy.

## Instalar no celular

Depois de publicar:

1. Abra o link no Chrome do Android.
2. Toque em `⋮`.
3. Escolha `Adicionar à tela inicial` ou `Instalar app`.

## Arquivos principais

```text
src/components/CardVisionApp.tsx
src/lib/analyzer.ts
src/app/page.tsx
src/app/globals.css
public/manifest.webmanifest
```
