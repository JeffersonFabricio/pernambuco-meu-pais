# Tasks — 010 · Encontro no céu com a Vó Maria Rita

> TDD cenário a cenário (brownfield: começar com caracterização do desfecho atual).
> 1 commit por cenário verde. Reúso obrigatório dos helpers. Revisão paralela dos
> specialists feita (product + qa + security) — ajustes incorporados.

| # | Task | Cenário(s) BDD | Arquivo(s) |
|---|------|----------------|-----------|
| T1 | Expor `window.__world.drawCeu(ctx, t)` delegando à `drawCeu` interna (pré-req dos testes de render) | "A cena ceu renderiza sem exceção…" | `js/main.js` |
| T2 | Harness headless `tests/test-ceu-maria-rita.js` (vm + stubs, modelo `test-igreja-coerencia.js`), com `Cenário:` idênticos aos da spec p/ o coverage-gate | todos | `tests/test-ceu-maria-rita.js` |
| T3 | Caracterizar (RED baseline): skyEnding atual sem reencontro focal; gatilho 31 conchas + `talk('vovo')` → `fin` + `startEnding` → `S.mode='ceu'` → retorno ao tocar (`S.winT=12` + `tapAt`) | "Caracterização…", "Completar as 31…", "A cena do céu é alcançada…" | `tests/`, `js/main.js` |
| T4 | Narração de reencontro no `STORY.skyEnding` (linhas `who:'nar'`): cita a Vó Maria Rita, evoca `amorCeu`, trata como reencontro (continuidade com a igreja), PT-BR; **zero** falas `who:'vovoMae'` | "O desfecho narra…", "A narração trata como reencontro…", "A Vó não ganha novas falas…", "O roteiro reúne os três…" | `js/story.js` |
| T5 | Recompor `drawCeu`: Vó Maria Rita **focal/central** (porto do céu, x≈W/2) que a jangada alcança; família vira **anel de luzes**; manter Vovô Maro + Maju na jangada (estrutura `SOULS` inspecionável) | "O roteiro reúne os três…" (eixo render), "[MANUAL]…" | `js/main.js` |
| T6 | Preservar reúso (helpers + paleta DESIGN.md), crédito "Para Maria Júlia" + "✦ FIM ✦" + retorno ao mundo; sem novo asset/dep | "O desfecho não introduz asset…", "[MANUAL]…" | `js/main.js` |
| T7 | **Gate ADR-008**: condicionar `startEnding` a `doneCount()>=TOTAL_PHASES && met.vovoMae` nos dois gatilhos (`afterPuzzle` main.js:352, `talkNpc` main.js:859); botão "★ SUBIR" só com gate ok; dica do Vovô Maro apontando a igreja quando 31 conchas mas `met.vovoMae` false | "Com as 31 conchas mas sem visitar a igreja…" | `js/main.js`, `js/story.js`, `tests/` |
| T8 | Invariantes: desfecho só com 31 conchas (FF-DOM-2); save não regride; re-disparo sem loop; edge "sem 31 conchas não dispara" | "O desfecho só dispara com 31…", "Não regride o progresso…", "Re-disparar… sem loop", "Falar sem as 31…" | `js/main.js`, `tests/` |
| T9 | Regressão: jogo carrega sem exceção; rodar todos os `tests/test-*.js` verdes | "A cena ceu renderiza sem exceção…" | `tests/` |

## Validação final
- `node tests/test-ceu-maria-rita.js` → todos PASS; demais `tests/test-*.js` sem regressão.
- Visual no navegador: completar o jogo (ou hook) e assistir a cena `ceu` — Vó Maria
  Rita focal, os três no quadro, anel de luzes, narração, crédito; toque volta ao mundo.
- Sem novo asset, sem nova dependência, paleta do `DESIGN.md`, texto PT-BR.

> Decisão de coerência resolvida (PARE): **igreja obrigatória** → [ADR-008](../../docs/adr/ADR-008-desfecho-gated-igreja.md).