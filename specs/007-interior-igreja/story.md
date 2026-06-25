# Story — 007 Interior da Igreja (fundo da cena das Marias)

> Spec ID: `007-interior-igreja` | Modo: brownfield | Gerada por `/spec` em 2026-06-25

## História

**Como** Maju (jogadora),
**quero** que, ao entrar na igreja de Nossa Senhora da Piedade para o reencontro das duas Marias, o fundo da cena mostre o **interior de uma igreja** (nave dourada com vitral, altar e velas),
**para que** o "silêncio dourado lá dentro" descrito no roteiro seja coerente com o que vejo na tela — hoje a cena reusa o fundo de *Noite de Maracatu* (rua à noite com tambores), o que quebra a imersão do momento mais emotivo do jogo.

## Contexto técnico

- A cena das Marias é disparada em [main.js:873](../../js/main.js#L873) via `startDialogue(lines, 7, ...)` — passa `sceneN = 7` (bloco completo em [main.js:865-883](../../js/main.js#L865-L883)).
- `drawScene(7)` desenha `SCENES[7]` = **Noite de Maracatu** ([sprites.js:1029-1047](../../js/sprites.js#L1029-L1047)).
- Os fundos de cena vivem na tabela `SCENES` ([sprites.js:921](../../js/sprites.js#L921)), cada um com `s(ctx)` (camada estática, cacheada) e `d(ctx, t)` (camada animada por tempo).

## Critérios de aceite

1. Existe uma cena nova `SCENES[11]` que desenha um **interior de igreja**: nave em tons âmbar/dourado, vitral colorido ao fundo, altar e velas tremeluzentes (animação na camada `d`).
2. O diálogo de reencontro das duas Marias (`asMarias` e `asMariasAgain`) renderiza sobre `SCENES[11]`, não mais sobre `SCENES[7]`.
3. A cena nova é determinística e cacheável: `s(ctx)` não usa tempo nem aleatoriedade; toda animação fica em `d(ctx, t)`.
4. Nenhuma outra cena/fase passa a usar `SCENES[11]` indevidamente — `SCENES[7]` (Noite de Maracatu) segue intacta para o distrito 7.
5. O gate de entrada da igreja (`met.vova`, toast "Ainda não é o momento...") **permanece inalterado** — fora de escopo.
6. A tela de abertura `STORY.opening` ([main.js:1268,1270](../../js/main.js#L1268)) continua com `sceneN = 7` — apenas as chamadas `asMarias`/`asMariasAgain` mudam para `11`.
7. O callback do `startDialogue` das Marias ([main.js:875-876](../../js/main.js#L875-L876)) continua persistindo `met.vovoMae = true` e `met.asMarias = true` — a troca de `sceneN` não pode quebrá-lo.

## Escopo

**Sem ADR** — decisão dentro dos padrões da stack (nova entrada em `SCENES`, mesmo contrato `s`/`d`). Não muda fronteiras nem persistência.

**Blueprint dispensado** — fluxo de 1 passo (trocar o `sceneN` da cena das Marias + adicionar a cena).
