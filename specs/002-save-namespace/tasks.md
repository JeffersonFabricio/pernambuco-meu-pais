# Tasks 002 — Save namespace + recuperação de legado in-game

> Ordem de execução. Cada task mapeia a cenário(s) da `spec.bdd.md`. Stack vanilla JS — validação manual
> via `window.__*` no navegador (sem framework). 1 commit por bloco coerente.

| # | Task | Arquivo | Cenário(s) BDD |
|---|------|---------|----------------|
| 1 | `SAVE_KEY = 'maresRecife:pernambuco-meu-pais'` + `LEGACY_SAVE_KEY = 'maresRecife'` | [main.js:118](../../js/main.js#L118) | Primeira sessão limpa → 0/31 |
| 2 | `load()` lê **apenas** `SAVE_KEY` (legado nunca adotado automaticamente); preservar `try/catch` defensivo | [main.js:119-135](../../js/main.js#L119) | Save legado não adotado; edge legado ilegível; edge localStorage indisponível |
| 3 | `save()` grava **apenas** em `SAVE_KEY` | [main.js:136](../../js/main.js#L136) | Progresso novo persiste na chave namespeada |
| 4 | Detecção de legado na init: helper que lê `LEGACY_SAVE_KEY`, valida via `load()`-like e retorna nº de conchas; se >0 **e** sem save namespeado → `S.mode = 'legacy'` antes do título | [main.js](../../js/main.js) (init + modos) | Card exibido (1x); edge ilegível/vazio pula card |
| 5 | Novo modo `legacy`: `drawLegacyCard(t)` (reusar `panel`/`pTxt`) com 2 botões; `handleTap` trata os toques | [main.js:361,1172,1205](../../js/main.js#L1172) | Card exibido; Continuar; Começar do zero |
| 6 | Ramo **Continuar**: valida legado, grava em `SAVE_KEY`, vai pro título. Ramo **Começar do zero**: `removeItem(LEGACY_SAVE_KEY)`, grava save 0/31, vai pro título. Ambos persistem → card não reaparece | [main.js](../../js/main.js) | Continuar restaura; Começar do zero descarta |
| 7 | `__world.reset()` remove `SAVE_KEY` **e** `LEGACY_SAVE_KEY` | [main.js:1303](../../js/main.js#L1303) | reset() limpa ambas |
| 8 | Roteiro de teste manual no navegador (todos os cenários, incl. coords dos botões) | console | todos |

## Notas de implementação

- **KISS:** chave é constante literal, não derivada de `location` (ADR-002 §1).
- **Não tocar** a migração v2→v3 dentro de `load()`; ela continua válida **sobre** o conteúdo lido — muda só
  **de onde** se lê. O ramo "Continuar" do card reusa essa mesma validação ao adotar o legado.
- **Auto-suficiente:** a recuperação é a tela `legacy`, não o console. Hooks `window.__*` permanecem só para debug.
- **Princípio 4:** o legado não é apagado na init (só no ramo "Começar do zero", por escolha explícita); "Continuar"
  só adiciona progresso; o card aparece no máximo 1x (a escolha persiste um save namespeado).
- **Card pulado** quando: sem legado, legado ilegível (JSON inválido), ou legado com 0 conchas.
- **UI nova** → esta spec tem cenários de UI; recomendar `/prototype 002-save-namespace` antes do `/implement`.

## Pós-implementação

- Rodar `/sync` para atualizar `.sdd/PROJECT-CONSTITUTION.md §5` (Fronteiras): chave `'maresRecife'` →
  `'maresRecife:pernambuco-meu-pais'`.

## Fora de escopo (FF-DOM-2)

Esta spec **não** toca `DISTRICT_SIZES` nem `TOTAL_PHASES` (apenas lê na migração). A contagem de 31 conchas
permanece intacta.

## Revisão paralela dos specialists

Disparada na Fase 4.5 (product · qa · security). Achados não-controversos aplicados; divergência de `importLegacy`
resolvida pelo usuário (auto-suficiência → card in-game, não console).
