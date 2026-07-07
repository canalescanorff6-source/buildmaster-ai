# BuildMaster AI Vision Pro v5 Secure Premium

Versão v5 com login privado, visual premium, histórico local e motor Elite para ficha de gameplay real no eFootball.

## Login padrão

- Usuário: `thiago0126`
- Senha: `iu1fsaa67a`

O login usa cookie HttpOnly por 14 dias. Para trocar depois na Vercel, configure:

```txt
BUILDMASTER_LOGIN_USER=seu_usuario
BUILDMASTER_LOGIN_PASSWORD=sua_senha
BUILDMASTER_SESSION_TOKEN=um_token_grande_e_secreto
```

## Recursos principais

- Tela de login antes de acessar o app.
- Upload separado: galeria/arquivos e câmera.
- IA Vision opcional via `OPENAI_API_KEY`.
- OCR local premium como reserva.
- Travas contra pontos absurdos como `2/2` e `116/116`.
- Motor Elite para ficha de gameplay real, sem copiar a ficha automática do jogo.
- Habilidades adicionais faltantes, sem repetir as que a carta já possui.
- Histórico local das últimas análises no próprio navegador/celular.
- Botão de sair e botão de nova análise.

## Deploy

1. Extraia o ZIP.
2. Abra a pasta `buildmaster_vision_pro_v5_secure`.
3. Envie o conteúdo dela para a raiz do GitHub.
4. Faça commit.
5. Na Vercel, faça Redeploy.
6. Limpe cache/dados do site no celular ou teste em aba anônima.

## Observação

Para leitura automática mais forte, configure `OPENAI_API_KEY` na Vercel. Sem a chave, o app usa OCR local, que funciona offline no navegador, mas pode errar mais em prints muito pequenos ou cortados.
