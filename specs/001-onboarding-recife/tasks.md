# Tasks — 001 Onboarding guiado

> Ordem sugerida. Cada task mapeia para um ou mais cenários BDD. TDD aqui = roteiro manual via
> `window.__*` no navegador (Baseline §0.1 — sem framework). Commit por cenário verde.

## T1 — Copy das falas (story.js)
Mapeia: cenários "Boas-vindas", "Jonatha explica", "desvio", "reencontro Micaele/Jonatha".
- Repurpose `STORY.meet.welcome` → fala de **boas-vindas da Micaele no mundo** (ela recebe e
  encaminha pro painho). Garantir `who: 'mica'`.
- Adicionar fala de **desvio do Jonatha** (`jonaBlocked` ou similar): "Fala primeiro com tua mãe, filha."
- Reescrever `micaAgain` e `jonaAgain` como **motivadoras curtas** no espírito
  "Eu sei que tu consegue, Maju. Vai lá!" (manter tom PT-BR/Recife).
- Conferir que a remoção da cutscene conjunta não deixa `STORY.meet` órfão referenciado em `main.js`.

## T2 — Entrada no mundo sem cutscene conjunta (main.js `startTutorial`)
Mapeia: "Mundo nasce apontando para a Micaele".
- `startTutorial()` passa a `enterWorld()` direto (opcional: 1 beat de narrador), sem o diálogo
  conjunto dos dois pais.
- Painel de ajuda (`!briefed`) instrui a falar com a **mainha primeiro**.

## T3 — Máquina de estados de onboarding em `talkNpc` (main.js)
Mapeia: "Boas-vindas da Micaele", "Jonatha explica a missão", "desvio", "reencontros".
- Micaele 1ª vez (`!met.mica`): toca welcome, `met.mica=true`, save, atualiza guia → Jonatha.
- Jonatha com `!met.mica`: fala de desvio; **não** marca `met.jona`/`briefed`.
- Jonatha com `met.mica && !briefed`: missão, `briefed=true`, `met.jona=true`, seta dourada + toast.
- Reencontros (já conhecidos): falas motivadoras (`*Again`).
- Reusar o padrão atual de `first` por NPC; ajustar a condição do Jonatha pra exigir `met.mica`.

## T4 — Gate de ENTRAR concha (main.js `enterNear`)
Mapeia: "Tocar ENTRAR antes de briefed é bloqueado", "Depois de briefed funciona".
- Em `enterNear()`, se `S.near && !S.save.briefed`: não chamar `openLevel`; emitir toast pedindo pra
  falar com os pais. Falar com NPC (`S.nearNpc`) continua liberado.

## T5 — Guia visual apontando para NPC (main.js, reuso de `drawBeacon`)
Mapeia: "Mundo nasce apontando para a Micaele", "guia passa a apontar para o Jonatha".
- Enquanto `!briefed`: desenhar seta/destaque sobre o NPC-alvo — Micaele se `!met.mica`, senão Jonatha.
- Reusar a lógica/visual da seta dourada (posição de tela do NPC = `npc.x - cam.x`, `npc.y - cam.y`).
- `drawBeacon` (conchas) permanece só para `briefed` — sem conflito visual.

## T6 — Persistência e migração (main.js `load`)
Mapeia: "Onboarding sobrevive ao recarregar", "Save antigo já briefed não volta pro onboarding".
- Confirmar que `met.mica`/`met.jona`/`briefed` persistem no v3 (já existem).
- Garantir que a derivação de `briefed` na migração (v2→v3) continua válida — saves antigos briefed
  não voltam ao onboarding.

## T7 — Hooks de teste manual (main.js `window.__world`)
- Estender `rebrief()` (já zera jona/mica/briefed) e validar o roteiro completo no navegador.
- Roteiro manual cobrindo os 10 cenários do `spec.bdd.md`.

## T8 — CHANGELOG
- O PR toca `CLAUDE.md`/harness? Não — só `js/*.js`, `docs/adr`, `specs/`. **CHANGELOG não exigido**
  (mudança em código de produto, não no harness). Registrar aqui a verificação.
