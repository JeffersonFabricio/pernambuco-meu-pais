# Fase 0 — Análise estratégica (006 Tubarão nas águas)

> Gerado pelo `/goal` (modo autônomo). Documenta o **pivot de arquitetura** descoberto antes do TDD.

## Descoberta crítica: a spec apontava para código morto

A spec original (aprovada) foi escrita sobre `drawWorld`/`updateWorld`/`drawRiverFoam` de
[js/main.js](../../js/main.js) — um mundo **top-down** com `landRect`/gutters de 12/24px.
**Esse código está morto:** `drawWorld()` e `updateWorld()` **nunca são chamados**. O `case 'world'`
do loop ([main.js:1333](../../js/main.js)) usa `World3D.update()` + `World3D.draw()`.

O motor vivo é **`World3D`** ([js/world3d.js](../../js/world3d.js)): mundo **isométrico** de tiles
(`TW=36, TH=18`, MAP `24×24`). A água são tiles do MAP:
- `'~'` = **oceano** — sempre visível (`tileVisible` fura a névoa: "o MAR fura a névoa", world3d.js:49).
- `'w'` = **rio** — riacho de 4 tiles dentro da zona do Manguezal (D3); só visível com D3 aberto.

Implementar no `drawWorld` morto entregaria um tubarão **invisível no jogo real** — falha de entrega.
Portanto a feature vai para `world3d.js`, e a spec foi corrigida para refletir a realidade (FF-005:
drift spec↔código = 0).

## Mapeamento das decisões de produto (intactas) para o World3D

| Decisão (confirmada com o cliente) | Tradução no World3D |
|---|---|
| Toda a água | Tiles `'~'` (mar) + `'w'` (rio). Um tubarão único vive no **mar** (componente d'água dominante; o `'w'` é um riacho desconexo de 4 tiles — não comporta um tubarão). |
| Só em áreas liberadas | Nada só sobre tiles d'água com `tileVisible(col,row,unlock)` true. **Consequência do pivot:** o oceano é sempre visível por design, então o tubarão aparece desde o início (como o próprio mar). O gating ainda impede entrar num tile `'w'` de distrito fechado. |
| Um tubarão, discreto | Um único ator efêmero. |
| Proporcional ao mundo | Escala **2** (16×7 → 32×14px) ≈ 1 tile iso (36×18). ≠ escala 3 do puzzle. |

## Decisões técnicas (KISS, dentro das convenções do World3D)

1. **Estado efêmero** `shark = { col, row, dir, bob }` no escopo do IIFE de `world3d.js` (não em `S`,
   não no `save`). Init eager num tile de oceano da faixa norte (`col 12, row 1`).
2. **Movimento determinístico** (sem `Math.random`): anda em grid (col/row) na direção atual; ao
   atingir o centro do próximo tile, escolhe a próxima direção por prioridade fixa
   `[reto, direita, esquerda, ré]`, pegando a 1ª cujo tile-alvo seja água **visível**. Garante
   "nunca sai da água visível" e "nunca trava".
3. **Orientação por sentido de tela**: o sprite (horizontal) **espelha** quando o passo vai para a
   esquerda da tela (`dir ∈ {W, S}`). **Sem rotação 90°** — num plano iso não há vertical puro;
   rotacionar ficaria estranho. (Divergência consciente da spec top-down original.)
4. **Render** dentro do `draw()` do World3D, no **queue ordenado por profundidade** iso
   (`depth = col+row+0.45`) — ocluído corretamente por terra/prédios mais próximos, sobre a água.
   Reusa o global `drawShark(ctx,x,y,s,flip)` de `sprites.js`.
5. **Passo na vida real**: chamado dentro de `World3D.update(dt,…)` (já recebe `dt` e
   `districtUnlockedFn`). Para teste headless, exposto via `World3D.stepShark(dt, unlockFn)` e
   `World3D.shark()` (snapshot) — e encaminhado por `window.__world.shark/stepShark` em main.js.

## Escopo / não-escopo

- **Não** removo o código morto top-down (`drawWorld` etc.) — é débito pré-adoção (brownfield,
  conservador em código legado); fora do escopo desta feature. Anotado para um `/sync` futuro.
- Sem ADR: usa a arquitetura existente (World3D) sem decisão nova; sem mudar ordem de `<script>`.
  Toca `js/world3d.js` (feature) + `js/main.js` (2 linhas de hook em `window.__world`).
