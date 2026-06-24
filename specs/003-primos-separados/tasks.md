# Tasks — 003-primos-separados

> Ordem TDD cenário a cenário (RED → GREEN → REFACTOR). 1 commit por cenário verde.
> Revisão paralela dos specialists: aplicada (product + qa + security). Ajustes P0/P1 já incorporados ao BDD.

| # | Task | Cenário(s) BDD | Arquivos |
|---|------|----------------|----------|
| 1 | Dividir `WORLD_NPCS`: `primos` → `ravi` + `nicolas` em tiles distintos no d2; atualizar `NPC_DRAW` (`ravi: drawRavi`, `nicolas: drawNico`; remover `primos`) | Dois sprites distintos; Jogo desenha sem exceção | `js/world3d.js` |
| 2 | Dividir entrada `primos` de `NPCS` (`main.js`); `lesson` da companhia em ambos | A lição aparece ao conhecer qualquer um | `js/main.js` |
| 3 | Derivar diálogos `ravi`/`raviAgain` e `nicolas`/`nicolasAgain` de `primos` atual, cross-referenciando o outro e preservando a linha da lição | Intro do Ravi cita Nicolas; intro do Nicolas cita Ravi; reencontro do Ravi | `js/story.js` |
| 4 | Migração de save em `parseSave`: `if (s.met?.primos) { met.ravi = met.nicolas = true; }` (dentro do try/catch) | Save antigo migrado; save sem primos; save malformado | `js/main.js` |
| 5 | Verificar fluxo de ordem invertida (Nicolas antes de Ravi) — `met[key]` independente | Conhecer Nicolas antes de Ravi | `js/main.js` (validação) |
| 6 | Validar invariantes: contagem de conchas d2 inalterada, TOTAL_PHASES=31, console limpo | Contagem não muda; carrega sem erro | manual `window.__*` |
| 7 | Revisão editorial humana: nenhuma linha afetiva do diálogo `primos` perdida sem equivalente | (nota editorial, não automatizável) | `js/story.js` |

**Sem ADR / sem blueprint** — feature dentro dos padrões da stack.
