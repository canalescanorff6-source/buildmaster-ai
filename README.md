# BuildMaster Local Pro v12

App Next.js/PWA com login local para analisar prints de cartas do eFootball/eFHUB/eFootBase e gerar ficha Elite focada em gameplay real.

## Login

- Usuário: `thiago0126`
- Senha: `iu1fsaa67a`

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


## v14 - correção após análise do vídeo

Esta versão corrige o problema observado no vídeo em que um DMF/VOL destruidor podia virar MLG por leitura da grade de posições. Agora o OCR lê primeiro a face da carta e não usa linhas da grade como `CMF 88` para definir a posição principal.

Também corrige o nível máximo absurdo (`88`) e melhora as habilidades adicionais para jogadores defensivos centrais.
