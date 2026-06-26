# Análise estratégica — 010-ceu-maria-rita

> Fase 0 do /goal (autônoma). Brownfield; área lida integralmente.

## Pontos de toque (mínimos)

| Arquivo | Mudança |
|---------|---------|
| `js/main.js:352` | gate `afterPuzzle`: `... && S.save.met.vovoMae && !S.save.fin` (ADR-008) |
| `js/main.js:859` | gate `talkNpc`: `npc.ending && doneCount()>=TOTAL && S.save.met.vovoMae` |
| `js/main.js:887` | branch `vovo`: dica → igreja quando 31 conchas mas `!met.vovoMae` |
| `js/main.js:1091` | botão: "★ SUBIR" só com gate completo; senão "★ FALAR" |
| `js/main.js:463 drawCeu` | recompor: Vó Maria Rita FOCAL central (`x≈W/2`) + família como anel de luzes; jangada sobe até ela |
| `js/main.js:1396 window.__world` | expor `drawCeu(t)` e `ceuFocal()` (posição focal) p/ teste headless |
| `js/story.js skyEnding` | narração de reencontro (focal, três juntos, continuidade igreja); sem falas `vovoMae` |
| `js/story.js meet` | `vovoNeedsChurch`: dica do Vovô Maro |

## Riscos / invariantes
- Progresso nunca regride: gate é condição adicional, não muda `done`/`TOTAL_PHASES`.
- Reúso total de helpers; zero asset/dep novo.
- Determinismo: `drawCeu(t)` puro em `t` → testável headless (sem exceção em t∈[0..12]).

## Decisão registrada
ADR-008 (igreja obrigatória) — índice DECISIONS.md já reconciliado.
