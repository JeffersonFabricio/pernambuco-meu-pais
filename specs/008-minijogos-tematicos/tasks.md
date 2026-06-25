# Tasks — 008 Minijogos temáticos

> Entrega **pacote único** (decisão B): um `/implement` constrói os 5 motores + a reatribuição.
> Cada task fecha com 1 commit por cenário BDD verde. Ordem pensada pra manter o jogo jogável a cada passo.

## Fase 1 — Motores novos (1 classe por task, no molde de `js/puzzles.js`)

- [ ] **T1 — 🌉 PontesPuzzle (13):** conectar ilhas; geração validada por BFS (`this.solvable`), `solution()` de taps. Cobre Grupo E.
- [ ] **T2 — 🧵 RendaPuzzle (15):** traçar linha por todos os alfinetes; `this.solvable` + `solution()`. Cobre Grupo F.
- [ ] **T3 — 🛶 JangadaPuzzle (12):** navegar células de corrente até o cais; BFS de solubilidade; encalhe reseta sem travar. Cobre Grupo G.
- [ ] **T4 — 🦀 CaranguejoPuzzle (14):** capturar por timing; vencível em tempo finito; erro não trava. Cobre Grupo H.
- [ ] **T5 — 🪁 PipaPuzzle (16):** planar pelas correntes até a altura-alvo; colisão reseta sem travar. Cobre Grupo I.

> Cada motor T1–T5 expõe o hook `window.__puzzles[N]` e desenha sem exceção (Grupo J entra como assert transversal em cada task).

## Fase 2 — Registro e dificuldade

- [ ] **T6 — Registrar em PUZZLES:** adicionar 12–16 no objeto `PUZZLES` (`js/puzzles.js`). Cobre Grupo A (registro).
- [ ] **T7 — engineCfg por tier:** adicionar `case 12..16` em `engineCfg` (`js/levels.js`) escalando dificuldade por tier (0/1/2). Cobre Grupo D.

## Fase 3 — Reatribuição das conchas

- [ ] **T8 — Trocar `e:` em CHAPTERS** (`js/levels.js`) nas 9 conchas do mapa aprovado: g2→16, g11→16, g8→12, g30→12, g12→13, g29→13, g15→14, g28→14, g18→15. Cobre Grupo A (resolução) + Grupo B (invariantes: teto ≤3×, sem repetição em distrito).

## Fase 4 — Garantias transversais

- [ ] **T9 — Compat de save:** validar que `done[g]` por concha sobrevive à troca de `e:` e que âncoras mantêm `intro`/`outro`/`scene`. Cobre Grupo C.
- [ ] **T10 — Harness headless** `tests/test-minijogos-tematicos.js`: cobre os 10 grupos BDD (registro, invariantes de reatribuição, save, tiers, solubilidade BFS, vencibilidade das ações, robustez transversal). Inclui hook `window.__puzzles` novo em `js/puzzles.js`.
- [ ] **T11 — Robustez transversal (Grupo J):** tap fora da PA, tap pós-vitória, geração < 50ms (guard finito + fallback `MazePuzzle`), alvo de toque ≥44px nos motores de ação, render sem exceção. Embutido em T1–T5 + validado em T10.

> **ADR-007** ✅ escrito ([docs/adr/ADR-007-motores-tematicos.md](../../docs/adr/ADR-007-motores-tematicos.md)) e índice sincronizado — honra o Acordo do Time (2+ arquivos JS). Pipa: input por tap **+ inclinação** (`tilt(gamma)`), tap como fallback.

## Mapa cenário → task

| Grupo BDD | Tasks |
|-----------|-------|
| A Registro/resolução | T6, T8 |
| B Invariantes reatribuição | T8 |
| C Compat de save | T9 |
| D Tiers (inc. boundaries g=1/g=31) | T7 |
| E Pontes | T1 |
| F Renda | T2 |
| G Jangada | T3 |
| H Caranguejo | T4 |
| I Pipa | T5 |
| J Robustez transversal | T1–T5 + T11 |

> Validação paralela por specialists: **executada** na Fase 4.5 do `/spec` (síntese em [story.md](story.md) / abaixo no chat).
