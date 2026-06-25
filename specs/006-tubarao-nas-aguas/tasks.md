# Tasks — 006 Tubarão nas águas do mundo (motor World3D)

> Ordenadas; cada uma mapeia para um Cenário BDD. TDD: 🔴 RED → 🟢 GREEN → 🔄 REFACTOR.
> Implementação em `js/world3d.js` (+ 2 hooks em `js/main.js`). Reusar `drawShark`, `tileVisible`,
> `iso`, `MAP` — não recriar. 1 commit por cenário verde: `feat(mundo): cenário "<nome>"`.

## T0 — Fundação: estado do tubarão + hooks (pré-requisito)
- [ ] Estado efêmero `shark = { col, row, dir, bob }` no IIFE de `world3d.js` (≠ `S`, fora do `save`).
      Init eager num tile de oceano da faixa norte (ex.: `col 12, row 1`), `dir` inicial válida.
- [ ] `isSharkWater(col,row,unlockFn)` = tile `'~'`/`'w'` **e** `tileVisible` (gating da névoa).
- [ ] `stepShark(dt, unlockFn)`: clamp `dt ≤ 1.0`; anda no grid na `dir`; ao centrar no próximo tile,
      escolhe próxima `dir` por prioridade `[reto, direita, esquerda, ré]` (1ª água visível).
- [ ] `sharkSnapshot()` → cópia rasa `{col,row,sx,sy,dir,vx,vy,scale:2,lane,flip,onWater,visible}`
      (`sx,sy` via `iso()`; `visible` via viewport com margem de 1 tile, usando `lastW/lastH`).
- [ ] Expor em World3D: `shark: sharkSnapshot`, `stepShark`. Em main.js `window.__world`:
      `shark: () => World3D.shark()`, `stepShark: dt => World3D.stepShark(dt, districtUnlocked)`.
- [ ] Chamar `stepShark(dt, districtUnlockedFn)` dentro de `World3D.update(...)` (driver real);
      guardar `lastW=W, lastH=H` ali.
- [ ] Criar `tests/test-tubarao-nas-aguas.js` (modelo de tests/test-encontro-marias.js: vm + stubs;
      `loadGame()` expõe `World3D`). Mapa Cenário→teste no topo (lido pelo coverage-gate).
      Cobre "Tubarão inicializa válido já no carregamento".

## T1 — Cenário: Tubarão nada só sobre água e nunca sobre tile de terra
- [ ] 600× `stepShark(0.1)`: `onWater` true; `MAP[floor row][floor col] ∈ {'~','w'}`; dentro do MAP.

## T2 — Cenário: Tamanho do tubarão é proporcional ao mundo
- [ ] `scale = 2`; assert `shark().scale === 2`, `16*scale` ~ `TW`, e `< 3` (escala do puzzle).

## T3 — Cenário: Sprite espelha conforme o sentido na tela
- [ ] `flip = (dir ∈ {W,S})` (passo para a esquerda da tela). Render: `drawShark(...flip)`.
- [ ] Teste: avançar até dir E/N (`flip false`) e até dir W/S (`flip true`).

## T4 — Cenário: Tubarão só nada sobre águas visíveis (respeita a névoa)
- [ ] Gating por `tileVisible` em `isSharkWater`.
- [ ] Teste: jogo novo (só d0), 600 passos, `tileVisible(floor col,floor row,unlock)` true sempre.

## T5 — Cenário: Movimento é determinístico
- [ ] Zero `Math.random` no trajeto; prioridade de virada fixa.
- [ ] Teste: dois `loadGame()`, mesma sequência de passos → trajetória idêntica.

## T6 — Cenário: Tubarão é puramente cosmético — não toca o save nem a Maju
- [ ] `stepShark` não toca `save`/`done`/`player`. Teste: `doneCount` e `JSON(save)` inalterados;
      `World3D.player.col/row` inalterado; reload preserva progresso.

## T7 — Cenário: Jogo desenha o tubarão sem exceção e aplica culling
- [ ] Render no `queue` do `draw()` (`depth = col+row+0.45`), reusando `drawShark`.
- [ ] Culling: `visible` false fora da viewport. Teste: `draw()` um frame sem exceção;
      `visible` consistente com `(sx,sy)`; ao longo de 600 passos `visible` é false ao menos 1x.

## Encerramento
- [ ] **FF-002**: validar 0 erros de console no navegador: `npx http-server -p 8765 .` → ver o
      tubarão nadando no mar; conferir proporção (≈ tile) e o espelhamento.
- [ ] `/code-review` (Fase 1.5) + sensor chain; `/sync` se necessário.
