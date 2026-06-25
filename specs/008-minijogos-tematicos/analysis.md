# Análise estratégica — 008 (Fase 0, /goal autônomo)

## Padrões a seguir (observados no código)
- Motor = classe `*Puzzle` em `js/puzzles.js`: `constructor(cfg)`, `tap(x,y)`, `update(dt)`, `draw(ctx,t)`, flag `solved`. Vitória → `solved=true` + `AudioFX.win()`.
- Área útil `PA = {x:20,y:130,w:320,h:390}`. Helpers: `PR`/`PU` (sprites.js), `pTxt`/`panel`/`inBox`/`rnd`/`shuffle`/`approach` (puzzles.js). Sprites reusáveis: `drawCrab`, `drawShark`, `ICONS.renda`.
- Registro `PUZZLES` (puzzles.js:1196) + `window.__puzzles = PUZZLES` **já existe** (1203) — só estender com 12-16.
- `engineCfg(e,g)` (levels.js:163) por tier (g>10→1, g>21→2). `PUZZLE_HINTS` (story.js:177) por engine.
- Integração: `openLevel`→`new PUZZLES[engine](cfg)`; `handleTap`→`tap`; loop poll `solved` (main.js:1363). Drag opcional via `dragStart/Move/End`.
- Determinismo (STACK): puzzles de solução geram solúveis por construção (MazePuzzle = backtracker), **sem do/while ilimitado** — guard finito + fallback.

## Decisões de design por motor
- **13 Pontes** (BFS): ilhas crescidas conexas em grid; arestas = adjacências ortogonais; solução = árvore geradora (BFS). `tap` alterna ponte no slot mais próximo; `solved` = grafo conexo (BFS). `solvable` true por construção.
- **15 Renda**: N pinos espaçados > raio; `tap` marca pino não-visitado mais próximo; `solved` = todos visitados. Dupla/pulo cobertos por busca do mais próximo + guard `done`.
- **12 Jangada** (BFS): grid com caminho garantido start→cais (random walk) + areia (encalhe) off-path; `tap` move p/ célula adjacente; areia → reset ao start (não trava); `solvable`/`solution` via BFS.
- **14 Caranguejo** (ação): buracos ≥48px; exposição em rotação determinística por `interval`; `tap` no buraco com caranguejo exposto captura; meta `target`. Erro/timeout não trava (clamp ≥0). Vencível finito (rotação garante exposição).
- **16 Pipa** (ação + tilt): sobe por `ascRate`; 1 lane bloqueada por nível (sempre há rota); `tap` (metade esq/dir) ou `tilt(gamma)` move lane; colisão → reset altura (não trava). Guard de tap fora da PA.

## Arquivos tocados
`js/puzzles.js` (5 classes + registro), `js/levels.js` (engineCfg 12-16 + reatribuição `e:`), `js/story.js` (PUZZLE_HINTS 12-16), `js/main.js` (listener `deviceorientation`→`tilt`), `tests/test-minijogos-tematicos.js` (novo). ADR-007 já escrito.
