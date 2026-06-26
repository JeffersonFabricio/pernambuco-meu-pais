# Tasks — 011 Mangue com fundo vivo

Ordem TDD; cada task mapeia um cenário BDD ou bloco coerente. Toca só `js/sprites.js` e
o novo harness `tests/test-mangue-fundo-vivo.js`.

- [ ] **T1 — Harness headless** (suporte aos cenários)
  Criar `tests/test-mangue-fundo-vivo.js` no padrão dos existentes: carregar scripts no `vm`,
  reusar `fakeCtx`/`fakeCanvas`, **espiar `antena`/`drawCrab`/`PR`** por reatribuição no contexto
  global (com capacidade de reset por cenário e captura de argumentos). Mapa Cenário→teste com nomes
  idênticos aos `Scenario:` (lido pelo coverage-gate). Garantir `document.createElement` → fakeCanvas
  para o cenário de `drawScene`.

- [ ] **T2 — Antena no fundo estático** → cenários "A antena aparece…" + "…cor de silhueta diurna…"
  Em `SCENES[5].s`, adicionar 1 antena via `antena(ctx, 288, 478, 1, '#2a4a30')` — cor explícita
  (distinta do default `#1a2f26` da cena 9), base `y = 478` (≥ 440), fora do centro da cena.

- [ ] **T3 — Caranguejos animados** → "Caranguejos são desenhados…" + "…se mexem…" + "…faixa de lama" + "…finitas em t=0"
  Em `SCENES[5].d`, desenhar 2 caranguejos via `drawCrab` em **escala `s = 2`**, com `x` oscilando
  no tempo em sentidos opostos: `drawCrab(ctx, (t*18+30)%360, 448, 2)` e
  `drawCrab(ctx, (360-(t*25+200)%360), 458, 2)`. Todos com `y ≥ 440`, `0 ≤ x < 360`, coords finitas em t=0.

- [ ] **T4 — Regressão e escopo** → "detritos continuam…" + "drawScene primeiro frame…" + "escopo não vaza"
  Garantir que os 2 detritos boiando (`PR` cor `#6a5a42`) seguem sendo desenhados a cada `.d`,
  `drawScene(5, …)` não lança em t=0/t>0, e que `SCENES[9]` (2 antenas) e `TOTAL_PHASES` ficam inalterados.

- [ ] **T5 — Validação manual no browser** (FF-002)
  Abrir o jogo, entrar na fase do Cordão da Lama e confirmar visualmente a antena ao fundo + caranguejos
  andando na lama durante o diálogo, com leitura pixel art coesa, sem poluir o painel de diálogo (y ≥ 480)
  e com 0 erros no console.
