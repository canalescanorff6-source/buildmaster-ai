# BuildMaster Local Pro v6.1 — Login Hotfix

Versão corrigida para resolver o problema em que o usuário digitava a senha e o app não entrava.

## Login

- Usuário: `thiago0126`
- Senha: `iu1fsaa67a`

## O que foi corrigido

- Removido bloqueio por middleware/cookie da Vercel, que podia travar em alguns celulares/PWA.
- Login agora é local no navegador, usando `localStorage` por 14 dias.
- Botão **Sair** limpa a sessão local e volta para a tela de login.
- Atualizado cache do PWA para evitar versão antiga no celular.

## Observação de segurança

Este login é uma trava local de acesso para uso privado do app. Ele evita acesso casual, mas não é um sistema corporativo com banco de usuários.

## Como atualizar

1. Extraia o ZIP.
2. Abra a pasta `buildmaster_vision_pro_v6_1_login_local_hotfix`.
3. Suba o conteúdo dela no GitHub por cima dos arquivos atuais.
4. Commit sugerido: `Corrige login local do BuildMaster`.
5. Faça Redeploy na Vercel.
6. No celular, limpe os dados/cache do site ou abra em aba anônima.
