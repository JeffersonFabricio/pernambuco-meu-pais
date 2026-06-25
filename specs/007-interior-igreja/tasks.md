# Tasks — 007 Interior da Igreja

Ordem de execução TDD (cenário a cenário). Validação manual via `window.__*` + inspeção visual no browser (ADR-000).

| # | Task | Cenário BDD | Arquivo |
|---|------|-------------|---------|
| 1 | Adicionar `SCENES[11]` em `sprites.js` com `s(ctx)` (nave âmbar, vitral ao fundo, altar, candelabros) e `d(ctx, t)` (chama das velas oscilando por `sin(t)`). `s` determinística (sem `Math.random`/`Date.now`). | "elementos esperados", "velas tremeluzem", "determinística" | [js/sprites.js](../../js/sprites.js#L921) |
| 2 | Trocar `sceneN` de `7 → 11` apenas na chamada `asMarias`/`asMariasAgain` em `talkNpc` (`main.js:873`). Não tocar `STORY.opening` (1268/1270). | "S.sceneN recebe 11", "reencontro repetido", "abertura não afetada" | [js/main.js](../../js/main.js#L873) |
| 3 | Validar regressão: distrito 7 segue Noite de Maracatu; fallback de `drawScene` (SCENES[1]) intacto; callback persiste `met.vovoMae`/`met.asMarias`. | "Maracatu intacta", "fallback", "efeito de save" | manual via `window.__*` |

## Roteiro de validação manual (DevTools)

```js
// Isolar e inspecionar o interior (task 1) — SCENES é const de módulo; copiar a fn ou testar via fluxo:
window.__game.save.met.vova = true; window.__game.save.met.asMarias = false;
// → tocar a porta da igreja (window.__tap na posição do NPC asMarias)
// → conferir: window.__game.sceneN === 11 e o fundo é o interior dourado

// Regressão distrito 7:
window.__openLevel(/* fase do distrito 7 */); // fundo segue noturno

// Efeito de save após o diálogo completo:
window.__game.save.met.vovoMae;   // true
window.__game.save.met.asMarias;  // true
```

> Revisão paralela dos specialists aplicada (product/qa/security). Security: superfície OWASP nula (cosmético, Canvas puro, sem input externo). Sem ADR/blueprint — mudança de 1 passo dentro dos padrões da stack.
