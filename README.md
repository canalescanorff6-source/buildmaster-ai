# BuildMaster AI Vision Pro — Premium Focus

Versão focada somente na análise por imagem da carta.

## O que esta versão faz

- Upload de print/galeria e opção separada para câmera no celular.
- OCR em modo rápido ou precisão máxima.
- Leitura por áreas da imagem: topo/posições, atributos e habilidades/ímpetos.
- Revisão manual do OCR antes de gerar a ficha.
- Melhor posição real em PT-BR: CA, SA, PE, PD, MAT, MC, VOL, ZAG, LE, LD, GOL.
- Ficha recomendada com custo real de pontos do eFootball.
- Habilidades adicionais recomendadas sem repetir as habilidades que a carta já possui.
- Ímpetos/boosters, atributos, overalls por posição e gameplay ideal.
- Layout premium compacto em abas.
- PWA para instalar no celular.

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra:

```text
http://localhost:3000
```

## Como publicar na Vercel

Suba os arquivos no GitHub e faça o deploy na Vercel. Esta versão não usa banco, Neon, Prisma, login ou dashboard antigo.

## Observação sobre precisão

OCR não garante 100% quando o print vem cortado, escuro ou com texto pequeno. Para máxima precisão, use print direto da tela e revise o texto no campo de revisão antes de gerar a ficha.


## Correção v3.1 — Pontos por nível

Esta versão corrige o caso em que o OCR lia falsamente `Pontos 2/2` em prints do eFHUB/eFootBase. Quando isso acontece, o app ignora o valor impossível e calcula os pontos pelo nível máximo da carta. Exemplo: nível 32 = 62 pontos; nível 33 = 64 pontos.

## Correção de pontos 2/2

Esta versão inclui uma proteção definitiva contra o erro de OCR que transformava a ficha em `2/2` pontos. O app descarta orçamentos abaixo de 20, calcula pelo nível máximo quando possível e usa 64 pontos como fallback seguro.


## Correção final pontos
Esta versão bloqueia leituras inválidas como 2/2 e força atualização do cache/PWA.
