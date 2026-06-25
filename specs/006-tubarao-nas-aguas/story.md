# 006 — Um tubarão passando nas águas do mundo

> Modo: solo (sem `.discovery/` prévio). **Spec corrigida após o pivot de arquitetura** descoberto
> na Fase 0 do `/goal` — ver [analysis.md](analysis.md).

## Story

**Como** Maju explorando o Recife pelo mundo,
**quero** ver um tubarão nadando de leve pelo mar,
**para que** as águas pareçam vivas — não um azul parado — somando ao encanto afetivo do passeio.

## Contexto técnico (lido do código)

- O mundo vivo é o motor **isométrico `World3D`** ([js/world3d.js](../../js/world3d.js)) —
  `TW=36, TH=18`, MAP `24×24`. (O `drawWorld` top-down de main.js é **código morto**; ver analysis.)
- Água = tiles do MAP: `'~'` **oceano** (sempre visível — "o MAR fura a névoa") e `'w'` **rio**
  (riacho de 4 tiles na zona do Manguezal D3, só visível com D3 aberto).
- Já existe `drawShark(ctx, x, y, s, flip)` — sprite 16×7px — global de
  [js/sprites.js](../../js/sprites.js), reusado do motor 3 (puzzle do tubarão).
- O `draw()` do World3D ordena tudo por profundidade iso (`col+row`); o tubarão entra nessa fila.
- Testes headless dirigem por `window.__world.*` / `World3D.*` (o loop real não roda no harness →
  movimento precisa de um passo determinístico exposto).

## Decisões de escopo (confirmadas com o cliente, mapeadas ao World3D)

1. **Toda a água** → tubarão patrulha o **mar** (`'~'`); o `'w'` é um riacho desconexo de 4 tiles,
   sem espaço para um tubarão.
2. **Só em áreas liberadas** → nada só sobre água **visível** (`tileVisible`). _Consequência do
   pivot:_ o oceano é sempre visível por design, então o tubarão aparece desde o início, como o mar.
3. **Um tubarão, discreto** → único ator efêmero, cosmético.

## Critérios de aceite (verificáveis)

1. O tubarão está **sempre sobre um tile d'água** (`'~'`/`'w'`) — nunca sobre terra
   (g/r/m/`.`/prédio), em qualquer passo (`window.__world.shark().onWater === true`).
2. **Tamanho proporcional ao mundo**: `scale` = **2** (16×7 → 32×14px ≈ 1 tile iso de 36×18),
   menor que a escala 3 do puzzle.
3. **Só sobre águas visíveis**: `World3D.tileVisible(floor col, floor row, unlock)` true em todo
   passo; nunca entra num tile `'w'` de distrito na névoa.
4. **Movimento determinístico** (sem `Math.random`) — testável via `window.__world.stepShark(dt)`;
   o sprite **espelha** pelo sentido de tela (sem rotação 90° — mundo iso).
5. **Puramente cosmético**: não altera `save` (nem ganha campo — Lei do Domínio §4), não conta
   conchas, não move/colide com a Maju; desenha sem erro de console (FF-002) e aplica culling.

## Notas de planejamento

- _Sem ADR_ — usa a arquitetura existente (World3D) sem decisão nova nem mudança na ordem dos
  `<script>`. Toca `js/world3d.js` (feature) + 2 linhas de hook em `js/main.js` (`window.__world`).
- _Sem blueprint_ — fluxo de render simples (um ator efêmero por frame).
- O tubarão é **estado efêmero** (não persistido), no escopo do IIFE de `world3d.js`, **não** em `S`.
  `shark()` devolve cópia rasa; `stepShark(dt)` clampa `dt`.
- _Fora de escopo:_ remover o código morto top-down de main.js (débito brownfield pré-adoção).
