# Story — 008 Minijogos temáticos (cena = mecânica)

> Spec ID: `008-minijogos-tematicos` | Modo: brownfield | Gerada por `/spec` em 2026-06-25
> Discovery: `.discovery/001-minijogos-tematicos/`

## História

**Como** Maju (jogadora),
**quero** que as conchas tragam **5 jogos novos nascidos de cenas do Recife** — a jangada na maré, as pontes da cidade, o caranguejo no mangue, a renda de bilro e a pipa no vento —, reatribuídas de modo que nenhum motor se repita mais que 3×,
**para que** cada parada da aventura surpreenda e "fale do lugar", como o maracatu, o amanhecer-luzes e o tubarão já fazem.

## Decisões tomadas no /spec (Roda de Spec)

- **Escopo (B):** 5 motores novos (`PUZZLES` 12–16); o Maze(5) segue desativado.
- **Classes de interação:** 3 puzzles-de-solução (Pontes, Renda, Jangada — geração **validada por BFS**, sempre solúvel) + 2 de ação/timing (Caranguejo, Pipa — vencíveis, errar **não trava**, reseta).
- **Entrega (B):** pacote único — um `/implement` constrói os 5 + a reatribuição.

## Mapa de reatribuição aprovado (9 conchas)

| g | Lugar | Antes | Depois | Vínculo cena=mecânica |
|---|-------|-------|--------|------------------------|
| g2 | Torre Malakoff (observatório do céu) | 7 | 🪁 16 Pipa | vento/céu |
| g11 | Arco-Íris no Rio (céu aberto pós-chuva) | 7 | 🪁 16 Pipa | vento |
| g8 | Parque Dona Lindu (beira-mar) | 8 | 🛶 12 Jangada | mar |
| g30 | Pescadores da Noite (estuário) | 8 | 🛶 12 Jangada | maré/pesca |
| g12 | Capibaribe Cheio (*"…por meio de suas pontes"*) | 8 | 🌉 13 Pontes | o fato fala em pontes |
| g29 | Veneza Brasileira | 4 | 🌉 13 Pontes | cidade-de-pontes |
| g15 | Rio das Capivaras (mangue) | 3 | 🦀 14 Caranguejo | mangue |
| g28 | Da Lama ao Caos (manguebeat) | 3 | 🦀 14 Caranguejo | lama/mangue |
| g18 | Casa da Cultura (artesanato) | 10 | 🧵 15 Renda | ofício manual |

**Contagem final por motor** (31 conchas): nenhum motor > 3×. Novos: Jangada 2, Pontes 2, Caranguejo 2, Pipa 2, Renda 1.

## Critérios de aceite

1. `PUZZLES` registra os índices **12, 13, 14, 15, 16** apontando para 5 classes novas (`JangadaPuzzle`, `PontesPuzzle`, `CaranguejoPuzzle`, `RendaPuzzle`, `PipaPuzzle`), cada uma com o contrato `constructor(cfg)` / `tap(x,y)` / `update(dt)` / `draw(ctx,t)` / `solved`.
2. Após a reatribuição, **nenhum motor aparece mais que 3×** nas 31 conchas, e **nenhum motor se repete dentro de um mesmo distrito**.
3. Os 3 puzzles-de-solução (Pontes, Renda, Jangada) são **sempre solúveis**: em 100 instâncias aleatórias por tier, existe solução (garantida por construção/BFS, conforme a lei de determinismo da `STACK.md`).
4. Os 2 motores de ação (Caranguejo, Pipa) são **vencíveis** e **errar/colidir não trava** o jogo (reseta o estado e segue jogável; `solved` só vira `true` na condição de vitória).
5. `engineCfg(e, g)` retorna `cfg` por tier (0/1/2 conforme `g`) para os 5 motores novos — a dificuldade escala ao longo das 31 fases, no mesmo padrão dos motores existentes.
6. **Compat de save:** `done[g]` continua chaveado por `g` (concha), não por motor — reatribuir `e:` **não invalida nem migra** saves existentes; uma concha já concluída segue concluída.
7. Diálogos de âncora afetadas **permanecem intactos** — trocar `e:` não altera `intro`/`outro`/`scene` (engine ≠ roteiro).
8. Cada motor novo expõe o hook `window.__puzzles[N]` (novo em `js/puzzles.js`, padrão `window.__levels`) que permite, headless e sem exceção: **instanciar, chamar `tap(x,y)`, `update(dt)`, `draw(ctx,t)` e ler `solved`**.
9. **Paleta/helpers:** cada motor novo usa exclusivamente tokens de cor de `DESIGN.md` e os helpers `PR`/`PU`/`pTxt`/`panel` — nenhum hex novo fora do catálogo é introduzido (verificável em code-review).
10. **Acessibilidade de toque** (mandato Desejável): nos motores de ação (Caranguejo, Pipa), cada zona interativa tem ao menos 44×44px no canvas 360×640.
11. **Geração não-travante:** os 3 motores de solução geram com guard de tentativas finitas + fallback determinístico (padrão `MazePuzzle`); instanciar não bloqueia o event loop (< 50ms).

## Escopo / Arquitetura

**ADR-007** ([docs/adr/ADR-007-motores-tematicos.md](../../docs/adr/ADR-007-motores-tematicos.md)) — registrado para honrar o Acordo do Time (mudança em 2+ arquivos JS: `puzzles.js` + `levels.js`). É extensão de padrão, não mudança arquitetural: motores novos no mesmo molde das 11 classes `*Puzzle` existentes, registro em `PUZZLES`, cfg em `engineCfg`, reatribuição do campo `e:` em `CHAPTERS`. Não muda fronteiras, persistência nem o contrato de save (ADR-002 intacto). **Sem blueprint** — o fluxo por concha (DOMAIN.md §3) não muda.

**Input do Pipa:** tap **+ inclinação** (giroscópio via `tilt(gamma)`), com tap como fallback universal — decisão registrada no ADR-007.

**Fora de escopo:** arcade/fliperama avulso; refator dos 11 motores existentes; reativar o Maze(5); motores stretch (Frevo da sombrinha, Forró da sanfona).
