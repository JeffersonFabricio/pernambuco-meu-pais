# Análise estratégica — 001 Onboarding gated (Fase 0, /goal autônomo)

## Superfície de impacto
- `js/main.js` — `talkNpc` (ordem + gate de marcação `met`), `enterNear` (gate de ENTRAR + guard
  anti-duplo-toque, cobre teclado pois Enter/Espaço chamam `enterNear`), `startTutorial` (remove
  cutscene conjunta → entra direto no mundo), guia visual de NPC (reuso da seta), painel de ajuda.
- `js/story.js` — copy: `mica` vira a boas-vindas ao Recife; novo `jonaBlocked` (desvio);
  `micaAgain`/`jonaAgain` reescritos como motivadoras curtas; remove `welcome` (orfão).

## Decisões herdadas (sem novo ADR além do ADR-001)
- **Sem schema novo de save.** A máquina de estados deriva de `met.mica` / `briefed` já existentes.
- **Migração de saves antigos já cobre** "≥1 concha → briefed" (`load()` linha 127) — AC7 ok sem mexer.
- **`met` marcado só ao concluir o diálogo correto** (move do topo de `talkNpc` para o callback `after`),
  corrigindo o bug apontado pelos specialists (met.jona gravado antes do desvio).

## Convenções respeitadas (STACK/Constitution)
- Globais + ordem de `<script>` inalterada (FF-002). Reuso dos helpers `pTxt`/`PR`/`triggerBeaconAndPan`.
- Extrai `drawGuideArrow(tx,ty,t,label)` compartilhado entre `drawBeacon` (conchas) e a guia de NPC
  (evita duplicar o desenho da seta — DRY, 2 usos).
- PT-BR, tom afetivo do Recife. Sem deps novas, sem assets.

## Validação (brownfield, sem framework — Baseline §0.1)
- `node --check` nos arquivos JS (sintaxe).
- Roteiro manual via `window.__world.rebrief()` + `window.__world.toNpc()` + `window.__tap` cobrindo
  os 15 cenários do `spec.bdd.md`.
