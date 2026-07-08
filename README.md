# BuildMaster Local Pro v6 Secure

Versão privada com login e leitura 100% local para eFootball/eFHUB/eFootBase.

## Login padrão

- Usuário: `thiago0126`
- Senha: `iu1fsaa67a`

Você pode mudar na Vercel:

```env
BUILDMASTER_LOGIN_USER=thiago0126
BUILDMASTER_LOGIN_PASSWORD=iu1fsaa67a
BUILDMASTER_SESSION_TOKEN=coloque_um_token_grande_aqui
```

## O que mudou na v6

- Removeu a parte de IA/API paga.
- OCR local premium com Tesseract.js.
- Leitura por áreas da imagem.
- Soma os pontos reais a partir da ficha automática distribuída no print, quando ela aparece.
- Se a ficha automática não for lida, calcula pelo nível máximo.
- Nunca aceita pontos absurdos como `2/2`, `116/116` ou valores acima de 80.
- Ranking de posições agora fica travado nas posições da carta lidas no print.
- Se a posição alvo escolhida não existir na carta, o app ignora e usa a posição principal da carta.
- Motor Elite Local redistribui os pontos para gameplay real, sem copiar a ficha automática do jogo.
- Habilidades adicionais continuam sem repetir as habilidades nativas da carta.
- Histórico local salvo no navegador/celular.

## Como atualizar no GitHub/Vercel

1. Extraia o ZIP.
2. Abra a pasta `buildmaster_vision_pro_v6_local_elite`.
3. Suba o conteúdo dela por cima dos arquivos atuais do repositório.
4. Faça commit: `BuildMaster Local Pro v6 OCR elite`.
5. Faça Redeploy na Vercel.
6. No celular, limpe os dados/cache do site ou teste em aba anônima.

## Melhor print para leitura

Use print direto da tela, não foto da tela. O ideal é que apareça:

- carta do jogador;
- posição principal;
- nível máximo;
- ficha automática/treino distribuído;
- atributos;
- habilidades.

