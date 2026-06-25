# ADR-007 — Motores de puzzle temáticos (cena = mecânica)

> Status: Proposto · Data: 2026-06-25 · Spec: `specs/008-minijogos-tematicos/`
> Discovery: `.discovery/001-minijogos-tematicos/`

## Contexto

A spec 008 adiciona **5 motores de puzzle novos** nascidos de cenas do Recife (🛶 Jangada, 🌉 Pontes, 🦀 Caranguejo, 🧵 Renda, 🪁 Pipa) e **reatribui 9 conchas** para que nenhum motor se repita mais que 3×. A mudança toca **2 arquivos JS** — `js/puzzles.js` (5 classes novas + registro `PUZZLES` + hook `window.__puzzles`) e `js/levels.js` (`engineCfg` casos 12-16 + campo `e:` em `CHAPTERS`).

O Acordo do Time (`.sdd/PROJECT-CONSTITUTION.md` linha 145) exige ADR para "mudança que afete 2+ arquivos JS ou a ordem dos `<script>`". Este ADR existe para honrar esse acordo e registrar que **a mudança é extensão de padrão, não decisão arquitetural nova**.

## Decisão

- **Reusar o molde existente** dos 11 motores `*Puzzle`: mesmo contrato `constructor(cfg)` / `tap(x,y)` / `update(dt)` / `draw(ctx,t)` / `solved`. Sem nova abstração (KISS/YAGNI).
- **Puzzles-de-solução** (Jangada, Pontes, Renda) seguem a lei de determinismo da `STACK.md`: geração com guard de tentativas finitas + **fallback determinístico** garantidamente solúvel (padrão `MazePuzzle`, `puzzles.js:879-936`), validados por BFS (`this.solvable`). **Sem `do/while` ilimitado** (evita jank/travamento da aba — Security A05).
- **Motores de ação** (Caranguejo, Pipa) são vencíveis e resetam sem travar ao errar.
- **Pipa aceita inclinação** (giroscópio) além de tap, via método `tilt(gamma)` alimentado por `DeviceMotion` no browser e dirigível direto no headless; `tap(x,y)` é o fallback universal. É a única ampliação do contrato de input — justificada pela imersão no celular e mantida testável.
- **Reatribuição do campo `e:`** não altera o save: `done[g]` é chaveado por concha `g`, não por motor — **ADR-002 (save namespacing) permanece intacto**, sem migração.
- **Ordem dos `<script>` inalterada** — tudo cabe em `puzzles.js` (que já carrega após `levels.js`).

## Consequências

- **Positivas:** reuso máximo cai de 4× → 3×; cada motor novo "conta o lugar"; zero refator estrutural; save existente preservado.
- **Custos/riscos:** +5 classes em `puzzles.js` (arquivo já grande — aceito por ADR-000, split é YAGNI); a inclinação exige stub de `tilt` no harness headless e fallback em desktop.
- **Não estende nem revoga** ADRs anteriores; apoia-se em ADR-002 (save por `g`).
