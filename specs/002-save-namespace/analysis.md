# Análise estratégica — 002-save-namespace (/goal Fase 0)

> Modo autônomo · brownfield · 2026-06-24

## Seam

Toda a mudança vive em [js/main.js](../../js/main.js), camada de save + um novo modo de tela. Nenhum outro
arquivo JS muda. `panel`/`pTxt`/`inBox`/`PR` são globais de [js/puzzles.js](../../js/puzzles.js) — reusar.

## Pontos de mudança

| Ponto | Linha atual | Mudança |
|-------|-------------|---------|
| Chaves | `SAVE_KEY = 'maresRecife'` (118) | `SAVE_KEY = 'maresRecife:pernambuco-meu-pais'` + `LEGACY_SAVE_KEY = 'maresRecife'` |
| `load()` | 119-135 | Lê só `SAVE_KEY`; v2→v3 continua válida sobre o conteúdo lido |
| `save()` | 136 | Grava só `SAVE_KEY` (já usa `SAVE_KEY`, muda só o valor da const) |
| `parseSave(raw)` | novo | Extrai a lógica de migração de `load()` p/ reuso no ramo "Continuar" do card |
| `countDone(save)` | novo | Conta conchas de um save parseado (decide se o card aparece) |
| Init | ~171, 192 | Após `S.save = load()`: se vazio E legado tem >0 conchas → `S.mode = 'legacy'`, guarda `S.legacy` |
| `drawLegacyCard(t)` | novo (~376) | Card com 2 botões (reusa `panel`/`pTxt`) |
| `handleTap` | 1172 | `case 'legacy'`: hit-test dos 2 botões |
| frame switch | 1205 | `case 'legacy': drawLegacyCard(t)` |
| `reset()` | 1303 | Remove `SAVE_KEY` **e** `LEGACY_SAVE_KEY` |

## Invariantes respeitadas

- **Lei §4 (nunca regride):** legado não apagado na init; card 1x (escolha persiste save namespeado); "Continuar"
  só adiciona.
- **Lei §1 (31 conchas):** não toca `DISTRICT_SIZES`/`TOTAL_PHASES`.
- **Mandato (carrega sem erro):** `try/catch` defensivo preservado em load/parse.
- **Ordem dos `<script>`:** inalterada.

## Decisão de design

Botões com caixas em constantes compartilhadas (`LEGACY_BTN_CONT`, `LEGACY_BTN_FRESH`) para draw e tap
concordarem — evita drift de coordenadas. Padrão já usado no puzzle HUD (`inBox(x,y,10,8,60,40)`).
