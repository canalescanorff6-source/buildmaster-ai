# BuildMaster AI Premium — Card Vision

Plataforma premium para analisar cartas do eFootball por imagem/print, com foco em rendimento real dentro de campo.

## O que esta versão entrega

- Next.js + TypeScript
- Login, cadastro e logout
- JWT com cookie HttpOnly
- PostgreSQL + Prisma
- Dashboard escuro com visual premium
- CRUD de jogadores e cartas
- Importação CSV/JSON
- Comparador Premium por PRI
- Build AI com treino recomendado
- **Card Vision AI**: envio de imagem/print da carta
- OCR local com `tesseract.js`
- Campo de revisão manual do OCR
- Conversão de posições para PT-BR: CF -> CA, SS -> SA, RWF -> PD etc.
- Leitura de atributos em PT-BR quando aparecem no print
- Recomendação de habilidades adicionais usando nomes em PT-BR
- Dicionário com as 41 habilidades adicionais das fotos enviadas
- Aliases para reconhecer nomes antigos/abreviados sem recomendar errado
- Dicionário editável de habilidades em `src/lib/skills-ptbr.ts`

## Tela principal do módulo novo

Acesse:

```txt
/dashboard/analisar-imagem
```

Fluxo:

1. Usuário envia print da carta.
2. O app tenta extrair texto da imagem.
3. Usuário revisa/corrige o texto.
4. O sistema identifica jogador, posição, estilo, overall, habilidades e atributos.
5. O motor calcula PRI, melhor posição real, treino, habilidades adicionais e dicas de gameplay.

## Rodar localmente

```bash
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run db:seed
npm run dev
```

Login de teste:

```txt
admin@buildmaster.ai
admin123456
```

## Habilidades adicionais em PT-BR

Esta versão já inclui as habilidades das fotos enviadas, como Toque duplo, Elástico, Chute ascendente, Finalização acrobática, Passe na medida, Curva para fora, Super substituto, Interceptação, Bloqueador, Superioridade aérea e outras.

O arquivo principal fica em:

```txt
src/lib/skills-ptbr.ts
```

Se você mandar depois as habilidades de goleiro ou alguma habilidade que faltou, basta completar esse arquivo. O motor de recomendação passa a usar esses nomes automaticamente.

## Posições PT-BR

Arquivo:

```txt
src/lib/positions.ts
```

Mapeamento inicial:

- CF -> CA
- SS -> SA
- RWF -> PD
- LWF -> PE
- AMF -> MAT
- CMF -> MC
- DMF -> VOL
- CB -> ZAG
- RB -> LD
- LB -> LE
- GK -> GOL

## Observação importante

Esta versão não distribui imagens oficiais de terceiros. O app apenas permite que o usuário envie uma imagem para análise. Isso deixa o produto mais seguro e mantém o diferencial no motor de análise: PRI, melhor build, melhor posição, habilidades e gameplay.

## Atualização — cartão preenchido pela imagem

A tela `/dashboard/analisar-imagem` agora mostra um cartão visual preenchido automaticamente com os dados extraídos do print da carta:

- nome do jogador;
- overall;
- posição em PT-BR;
- estilo de jogo;
- altura, peso, idade e nível;
- PRI e recomendação de gameplay.

Se o OCR errar alguma informação, o usuário pode corrigir o texto antes de clicar em **Analisar carta**.

## Online ou offline

O app não precisa estar online para você usar sozinho. Ele pode rodar localmente no computador em `localhost:3000`, com banco PostgreSQL via Docker.

Consulte:

```txt
docs/uso-online-offline.md
```

## Versão mobile/PWA

Esta edição inclui melhorias para uso no celular:

- manifest PWA;
- ícones do app;
- service worker básico;
- layout mobile premium;
- navegação inferior no celular;
- upload com câmera/galeria;
- documentação de uso no celular.

Leia:

```text
docs/uso-no-celular-pwa.md
docs/proximo-passo-app-nativo.md
```

Para acessar no celular pela mesma rede Wi-Fi:

```bash
npm run start:mobile-lan
```

Depois abra no navegador do celular:

```text
http://IP_DO_SEU_PC:3000
```

## Versão Cloud Ready

Esta edição também está preparada para publicar na nuvem e usar no celular sem depender do PC ligado.

Arquivos principais:

```text
vercel.json
render.yaml
.env.production.example
docs/deploy-vercel-neon.md
docs/checklist-lancamento.md
docs/producao-cuidados.md
src/app/api/health/route.ts
```

Caminho recomendado:

```text
Vercel + Neon PostgreSQL + PWA instalada no celular
```

Leia o passo a passo:

```text
docs/deploy-vercel-neon.md
```

Depois de publicar, teste:

```text
/api/health
```

Se retornar `ok: true`, o app e o banco estão conectados.
