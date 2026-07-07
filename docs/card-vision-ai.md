# Card Vision AI

O Card Vision AI é o módulo que transforma um print da carta em uma análise premium.

## Entrada

O usuário pode enviar:

- print do eFHUB/eFootBase;
- print do jogo;
- texto copiado manualmente;
- ficha digitada manualmente.

## Saída

O sistema gera:

- identidade da carta;
- ID interno;
- posições em PT-BR;
- atributos lidos;
- habilidades já presentes;
- PRI;
- melhor posição real;
- treino recomendado;
- habilidades adicionais sugeridas;
- compatibilidade tática;
- orientação de gameplay.

## Por que isso é melhor que copiar uma base inteira?

Porque o app não precisa distribuir imagens protegidas. O usuário envia a própria imagem, o app lê a ficha e gera a análise.

## Arquivos importantes

- `src/components/card-image-analyzer.tsx`: interface premium da análise por imagem.
- `src/app/api/vision/analyze-card/route.ts`: endpoint de análise.
- `src/lib/vision/card-identity.ts`: parser do texto extraído da imagem.
- `src/lib/vision/temp-card.ts`: cria carta temporária quando ela ainda não existe no banco.
- `src/lib/positions.ts`: conversão EN/PT-BR das posições.
- `src/lib/skills-ptbr.ts`: dicionário de habilidades em português.
- `src/lib/pri-engine.ts`: motor PRI, build e recomendações.

## Exemplo de ficha colada

```txt
Gabriel Batistuta
Artilheiro
Argentina
CA / SA
Altura 185cm
Peso 73kg
Idade 26
Nível 31
Talento ofensivo 81
Controle de bola 76
Drible 76
Condução firme 74
Passe rasteiro 58
Passe alto 55
Finalização 81
Cabeçada 80
Cobrança de bola parada 60
Curva 62
Velocidade 79
Aceleração 77
Força do chute 84
Salto 77
Contato físico 80
Equilíbrio 68
Resistência 72
Habilidades: Cabeçada, Efeito de longe, Precisão à distância, Chute com o peito do pé, Chute ascendente, Finalização acrobática, Chute de primeira, Espírito guerreiro, Superioridade aérea, Finalizador nato
```
