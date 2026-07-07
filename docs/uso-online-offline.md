# Uso online e offline — BuildMaster AI

O BuildMaster AI pode funcionar de duas formas.

## 1. Uso local/offline no computador

Você pode rodar o projeto no seu próprio PC, sem publicar na internet.

Nesse modo o app abre em:

```txt
http://localhost:3000
```

O banco fica local via Docker/PostgreSQL e ninguém acessa de fora.

Comandos:

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
npm run dev
```

Depois do primeiro `npm install`, o projeto pode rodar localmente. Para um uso totalmente offline, mantenha as dependências já instaladas e o banco Docker já baixado.

## 2. Uso online/publicado

Você só precisa colocar online se quiser que outras pessoas acessem pelo celular ou computador sem estar na sua máquina.

Exemplo:

```txt
https://buildmaster-ai.com
```

Para publicar, o caminho recomendado é:

- Vercel para o Next.js.
- Neon, Supabase ou Railway para PostgreSQL.
- domínio próprio opcional.

## OCR offline

O módulo Card Vision AI usa OCR no navegador com `tesseract.js`.

Em alguns ambientes, o OCR pode precisar baixar arquivos de idioma na primeira execução. Para deixar 100% offline, a próxima etapa é colocar os arquivos de idioma do Tesseract dentro de `public/tesseract` e configurar o worker/local language path.

Mesmo se o OCR falhar offline, o app ainda permite colar ou corrigir manualmente o texto extraído da carta e gerar a análise normalmente.

## Melhor opção para começo

Para testar e vender a ideia, use primeiro em modo local/offline no PC. Depois, quando estiver aprovado, publique online.
