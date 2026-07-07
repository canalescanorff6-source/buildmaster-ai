# BuildMaster AI Vision Pro v4 Auto Elite

Versão focada em leitura automática e ficha competitiva para eFootball.

## Principais mudanças

- Modo **IA Vision** para leitura automática avançada da imagem.
- Fallback com **OCR local premium** caso a chave da IA não esteja configurada.
- Motor de pontos v4: não aceita 2/2, 116/116 ou números soltos do print como orçamento de ficha.
- Pontos são priorizados pelo **Nível máximo**: pontos = (nível - 1) × 2.
- Motor **Elite Build**: não copia a ficha automática do jogo/eFHUB; otimiza por posição, estilo, atributos, custo real e gameplay.
- Posição automática travada pela posição principal/estilo para evitar CA virar ponta ou volante sem sentido.
- Habilidades adicionais continuam removendo as habilidades que o jogador já possui.

## IA Vision opcional

Para a melhor leitura automática na Vercel, configure a variável de ambiente:

```txt
OPENAI_API_KEY=sua_chave
```

Opcional:

```txt
OPENAI_VISION_MODEL=gpt-4.1-mini
```

Sem essa variável, o app funciona com OCR local seguro.

## Deploy

1. Suba o conteúdo desta pasta na raiz do GitHub.
2. Faça commit.
3. Redeploy na Vercel.
4. No celular, limpe os dados/cache do site para não carregar versão antiga.
