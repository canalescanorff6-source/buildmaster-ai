# Dicionário de Campos — Importação de Cartas

| Campo interno | Nome em português aceito | Tipo | Exemplo |
|---|---|---|---|
| sourceExternalId | idCarta | texto obrigatório | messi-epic-2026-001 |
| playerExternalId | idJogador | texto opcional | messi |
| playerName | jogador, nomeJogador | texto obrigatório | Lionel Messi |
| club | clube | texto | Inter Miami |
| country | pais, nacionalidade | texto | Argentina |
| mainPosition | posicaoPrincipal | texto obrigatório | AMF |
| secondaryPositions | posicoesSecundarias | lista com \| | SS\|RWF |
| playerPlaystyle | estiloJogador | texto | Creative Playmaker |
| height | altura | número | 170 |
| weight | peso | número | 72 |
| age | idade | número | 36 |
| dominantFoot | peDominante | RIGHT, LEFT, BOTH | LEFT |
| cardName | nomeCarta | texto | Epic Messi |
| season | temporada | texto | 2026 |
| rarity | raridade, tipoCarta | enum | EPIC |
| overall | geral | número | 90 |
| maxOverall | geralMaximo | número | 103 |
| cardPlaystyle | estiloCarta | texto | Creative Playmaker |
| imageUrl | imagem | URL | https://... |
| positions | posicoes | lista com \| | AMF\|SS\|RWF |
| releaseDate | dataLancamento | data ISO | 2026-01-01 |
| nativeSkills | habilidadesNativas | lista com \| | One-touch Pass\|Through Passing |
| recommendedSkills | habilidadesRecomendadas | lista com \| | Double Touch\|Sole Control |

## Atributos aceitos

| Campo interno | Nome em português aceito |
|---|---|
| offensiveAwareness | conscienciaOfensiva |
| ballControl | controleBola, controleDeBola |
| dribbling | drible |
| tightPossession | conducaoFirme, posseApertada |
| lowPass | passeRasteiro, passeBaixo |
| loftedPass | passeAlto |
| finishing | finalizacao |
| heading | cabeceio |
| placeKicking | bolaParada, cobrancaFalta |
| curl | efeito |
| speed | velocidade |
| acceleration | aceleracao |
| kickingPower | forcaChute |
| jump | impulsao |
| physicalContact | contatoFisico |
| balance | equilibrio |
| stamina | resistencia |
| defensiveAwareness | conscienciaDefensiva |
| tackling | desarme |
| aggression | agressividade |
| defensiveEngagement | engajamentoDefensivo |
| goalkeeperAwareness | conscienciaGoleiro |
| goalkeeperCatching | pegadaGoleiro |
| goalkeeperParrying | espalmarGoleiro |
| goalkeeperReflexes | reflexosGoleiro |
| goalkeeperReach | alcanceGoleiro |
