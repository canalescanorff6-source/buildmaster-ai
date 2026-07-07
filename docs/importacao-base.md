# BuildMaster AI — Base por Importação

Este módulo permite criar sua própria base de cartas usando CSV ou JSON. O objetivo é alimentar o sistema de forma organizada, sem depender de scraping ou cópia automática de bancos de terceiros.

## Caminho recomendado

1. Use a planilha `BuildMaster_AI_Template_Importacao.xlsx` como modelo.
2. Preencha uma carta por linha na aba `Cartas_Importar`.
3. Exporte essa aba para CSV.
4. Importe pelo painel `/dashboard/importar` ou pelo terminal.
5. Confira cartas criadas, atualizadas e ignoradas no resultado da importação.

## Importação pelo painel

Acesse:

```text
/dashboard/importar
```

Escolha `Importar CSV`, cole o conteúdo do arquivo CSV e clique em `Importar base`.

## Importação pelo terminal

Depois de configurar o banco e rodar migrations:

```bash
npm run import:cards:csv -- sample-data/cards-import-template.csv "Minha Base Manual"
```

Para JSON:

```bash
npm run import:cards:json -- sample-data/cards-import-template.json
```

## Campos obrigatórios

Para cada carta, estes campos são essenciais:

| Campo | Exemplo | Observação |
|---|---:|---|
| sourceExternalId | messi-epic-2026-001 | ID único da carta na sua base. Não repita. |
| playerName | Lionel Messi | Nome do jogador. |
| mainPosition | AMF | Posição principal. |
| rarity | EPIC | Tipo da carta. |
| overall | 90 | Overall base ou atual. |

## Campos mais importantes para o PRI

Para o motor de desempenho real, priorize preencher:

- offensiveAwareness
- ballControl
- dribbling
- tightPossession
- lowPass
- loftedPass
- finishing
- heading
- curl
- speed
- acceleration
- kickingPower
- jump
- physicalContact
- balance
- stamina
- defensiveAwareness
- tackling
- aggression
- defensiveEngagement

## Listas no CSV

Use `|` para separar vários valores:

```text
SS|AMF|RWF
```

Exemplos:

```text
secondaryPositions = SS|CMF
positions = AMF|SS|RWF
nativeSkills = One-touch Pass|Through Passing
recommendedSkills = Double Touch|Sole Control|Long-Range Curler
```

## Raridades aceitas

- STANDARD
- FEATURED
- POTW
- HIGHLIGHT
- TRENDING
- LEGEND
- EPIC
- BIG_TIME
- SHOW_TIME
- SPECIAL

## Pés aceitos

- RIGHT
- LEFT
- BOTH

Também são aceitos no CSV:

- DIREITO → RIGHT
- ESQUERDO → LEFT
- AMBOS → BOTH

## Atualização de cartas

A importação usa `sourceExternalId` como chave única da carta.

Se você importar novamente uma linha com o mesmo `sourceExternalId`, o sistema atualiza a carta existente em vez de duplicar.

## Estratégia para montar uma base grande

Recomendação prática:

1. Comece com 50 cartas que você usa ou quer analisar.
2. Depois crie lotes por tipo: Epic, Big Time, POTW, Standard etc.
3. Depois crie lotes por posição: CF, SS, AMF, DMF, CB, GK.
4. Sempre confira os dados antes de importar.
5. Mantenha um ID único e fixo para cada carta.

## Estrutura de ID recomendada

Use um padrão simples:

```text
nome-tipo-ano-versao
```

Exemplos:

```text
messi-epic-2026-001
mbappe-potw-2026-003
maldini-legend-2026-001
vieira-big-time-2026-001
```

## Observação importante

A base pode conter dados reais digitados, revisados ou importados por você desde que você tenha direito de uso desses dados. Para publicar o app comercialmente, evite usar bases de terceiros sem autorização.
