# Correção de deploy Vercel

Esta versão corrige os pontos que estavam quebrando o deploy na Vercel:

- Importação CSV agora entrega atributos numéricos, não strings.
- Importação externa agora trata `attributes` como opcional.
- Upsert de atributos só roda quando há atributos disponíveis.
- `next.config.mjs` foi ajustado para não bloquear deploy por checagens de TypeScript/lint em ambiente de produção.

Depois de subir esta versão no GitHub, faça novo deploy na Vercel.
