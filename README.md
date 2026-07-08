<<<<<<< HEAD
# BuildMaster Local Pro v12

App Next.js/PWA com login local para analisar prints de cartas do eFootball/eFHUB/eFootBase e gerar ficha Elite focada em gameplay real.
=======
# BuildMaster Local Pro v9

Versão baseada na **v7 que estava funcionando**, com as modificações visuais e de experiência da **v8 premium** aplicadas em cima do projeto Next.js.
>>>>>>> ed5acd963172e3290ecb0b2e7777a13d8f1b4a55

## Login

- Usuário: `thiago0126`
- Senha: `iu1fsaa67a`

<<<<<<< HEAD
## Principais recursos

- OCR local, sem API paga.
- Visual premium dark.
- Conversão automática de posições para PT-BR.
- Motor de posição por gameplay real, não por overall.
- Motor de estilos de jogo por grupo de função.
- Motor de ímpetos recomendados por posição + estilo + objetivo.
- Ficha Elite usando custo real de pontos.
- Habilidades adicionais sem repetir as nativas.

## Vercel

Use:

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run vercel-build`

Depois do redeploy, limpe o cache/dados do site no celular.
## v13 — Prints reais e Gameplay Real reforçado

Esta versão adiciona regras baseadas nos prints reais enviados: Ronaldinho AMF Armador criativo, Tchouaméni DMF Primeiro volante, Gattuso DMF O destruidor, Lamine Yamal RWF Lateral móvel, Diouf CF Artilheiro, Drogba CF Homem de área e Edgar Davids DMF O destruidor.

O app agora evita escolher posição apenas pelo maior overall da grade. Se a posição grande da carta não for lida com segurança, ele usa estilo de jogo + função real para manter o jogador na posição mais coerente em PT-BR.

=======
## O que esta versão mantém da v7

- Next.js/Vercel.
- Login local sem middleware travando.
- OCR local com Tesseract.js.
- Motor de ficha Elite local.
- Histórico local.
- Cálculo de pontos e travas contra valores absurdos.
- Posições travadas pela carta/estilo.

## O que entrou da v8 premium

- Tela de login mais parecida com a referência visual.
- Tela inicial premium com hero, upload, cards de vidro e botões em gradiente.
- Resultado com card maior, métricas compactas, abas, chips de habilidades e distribuição de pontos.
- Paleta dark premium com verde, ciano e roxo.
- Layout mais elegante e menos básico.

## Vercel

Use as configurações:

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run vercel-build`

Depois de publicar, limpe o cache/dados do site no celular para não carregar versão antiga.
>>>>>>> ed5acd963172e3290ecb0b2e7777a13d8f1b4a55
