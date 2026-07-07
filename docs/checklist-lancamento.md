# Checklist rápido para lançar o BuildMaster AI

## Antes do deploy

- [ ] Criar conta no GitHub.
- [ ] Criar repositório do projeto.
- [ ] Criar banco PostgreSQL no Neon.
- [ ] Copiar `DATABASE_URL`.
- [ ] Criar `JWT_SECRET` forte.
- [ ] Subir projeto para GitHub.

## Na Vercel

- [ ] Importar repositório.
- [ ] Conferir se o build command é `npm run vercel-build`.
- [ ] Adicionar variáveis de ambiente.
- [ ] Fazer deploy.
- [ ] Abrir `/api/health`.
- [ ] Testar login.
- [ ] Testar `/dashboard/analisar-imagem`.
- [ ] Instalar no celular como PWA.

## Depois do deploy

- [ ] Trocar senha/admin padrão.
- [ ] Testar upload de print da carta.
- [ ] Corrigir texto do OCR quando necessário.
- [ ] Conferir posições PT-BR.
- [ ] Conferir habilidades recomendadas.
- [ ] Testar com carta de atacante, meia, volante e zagueiro.
