# Deploy do BuildMaster AI na nuvem

Este pacote já está preparado para publicar o app e usar pelo celular sem depender do PC ligado.

## Arquitetura recomendada

```txt
Celular / PWA
   ↓
Vercel ou Render
   ↓
Neon PostgreSQL
```

O app continua sendo PWA: você abre o link no Chrome do celular e instala na tela inicial.

## Arquivos adicionados para deploy

```txt
vercel.json
render.yaml
.env.production.example
src/app/api/health/route.ts
docs/deploy-vercel-neon.md
```

## Opção principal: Vercel + Neon

### 1. Criar banco no Neon

1. Crie um projeto no Neon.
2. Copie a string de conexão PostgreSQL.
3. Ela será usada como `DATABASE_URL`.

Use uma string no estilo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
```

### 2. Subir o projeto para o GitHub

Na pasta do projeto:

```bash
git init
git add .
git commit -m "BuildMaster AI cloud ready"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

### 3. Criar projeto na Vercel

1. Entre na Vercel.
2. Clique em **Add New Project**.
3. Escolha o repositório do BuildMaster AI.
4. A Vercel vai detectar Next.js.
5. O arquivo `vercel.json` já define o build correto:

```bash
npm run vercel-build
```

Esse comando faz:

```bash
prisma generate
prisma db push
prisma db seed
next build
```

Ou seja: ele gera o Prisma, cria as tabelas no banco, popula habilidades/admin iniciais e faz o build do app.

### 4. Variáveis de ambiente na Vercel

Cadastre estas variáveis:

```env
DATABASE_URL="sua_string_do_neon"
JWT_SECRET="uma_chave_longa_e_segura"
NEXT_PUBLIC_APP_NAME="BuildMaster AI"
CRON_SECRET="um_token_longo"
AUTHORIZED_CARDS_FEED_URL=""
AUTHORIZED_CARDS_FEED_TOKEN=""
SYNC_SOURCE_NAME="Minha Fonte Autorizada"
```

Para gerar `JWT_SECRET`, você pode usar no terminal:

```bash
openssl rand -base64 48
```

Também pode criar uma frase muito longa, com letras, números e símbolos.

### 5. Deploy

Clique em **Deploy**.

Depois do deploy, teste:

```txt
https://SEU-PROJETO.vercel.app/api/health
```

Se estiver tudo certo, deve retornar algo parecido com:

```json
{
  "ok": true,
  "app": "BuildMaster AI",
  "database": "connected"
}
```

### 6. Login inicial

```txt
admin@buildmaster.ai
admin123456
```

Depois de entrar, troque essa senha futuramente em uma tela de perfil/admin ou altere o seed antes de publicar para outras pessoas.

### 7. Instalar no celular

No Android:

1. Abra o link do app no Chrome.
2. Toque nos três pontinhos.
3. Toque em **Adicionar à tela inicial** ou **Instalar app**.

O app vai aparecer como aplicativo no celular.

## Opção alternativa: Render

O projeto também inclui `render.yaml`.

Fluxo:

1. Crie um Web Service no Render.
2. Conecte ao GitHub.
3. Use o build command:

```bash
npm install && npm run render-build
```

4. Use o start command:

```bash
npm run start
```

5. Configure as mesmas variáveis de ambiente usadas na Vercel.

Para Next.js, eu recomendo Vercel como caminho principal. Render funciona, mas geralmente é mais usado quando você quer controlar um servidor Node próprio.

## Observações importantes

- O app não distribui imagens oficiais de terceiros.
- O usuário envia a imagem/print para análise.
- O OCR roda no navegador com `tesseract.js`.
- O banco salva usuários, cartas cadastradas, habilidades, builds e logs.
- A análise por imagem pode funcionar mesmo sem a carta estar cadastrada, usando os dados extraídos do print.
- Para transformar em app nativo Android no futuro, use Capacitor ou Expo.
