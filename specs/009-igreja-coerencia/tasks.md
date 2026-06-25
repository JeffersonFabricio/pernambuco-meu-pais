# Tasks — 009 Coerência temática da Igreja

Ordem TDD (RED → GREEN → REFACTOR), 1 commit por cenário verde. Testes headless em `tests/test-igreja-coerencia.js` (espelha o padrão de `tests/test-encontro-marias.js`).

| # | Task | Cenário(s) BDD | Arquivo(s) |
|---|------|----------------|------------|
| 1 | Criar harness `tests/test-igreja-coerencia.js` (carrega scripts via `vm`, stubs de browser, helper de inspeção de `STORY`/`NPCS` + driver `window.__world`) | (infra dos demais) | `tests/test-igreja-coerencia.js` |
| 2 | Asserção: `asMarias` sem tokens de mangue + âncora de fé | "A cena de reencontro não menciona o tema do mangue" | `tests/`, `js/story.js` (ajuste se houver vazamento) |
| 3 | Asserção: `asMariasAgain` sem tokens de mangue + reescrita da fala da Vó Maria Rita para reforçar permanência | "A fala curta de reentrada também não menciona mangue" | `tests/`, `js/story.js:402` |
| 4 | Re-skin do toast de bloqueio para tom de fé/beira-mar (texto + cor ouro), sem revelar quem falta | "Tocar a igreja antes de conhecer as duas avós mostra um toast de fé/beira-mar" | `js/main.js:868` |
| 5 | Caracterização do reencontro (duo, flags, lição) — **sem mudança de produção**, só asserção | "Entrar na igreja após conhecer as duas avós revela a Vó Maria Rita" | `tests/` |
| 6 | Verificar Jeff mantém o tema mangue + encaminha à igreja | "O titio Jeff continua sendo o portador do tema mangue" | `tests/`, `js/story.js` |
| 7a | Regressão: `TOTAL_PHASES = 31`, igreja não é concha (`completeAll()` → 31 em `done`, sem chave `asMarias`) | "A igreja continua não sendo uma concha…" | `tests/` |
| 7b | Regressão: gate `met.vova` preservado + jogo carrega/desenha sem exceção (try/catch no harness) | "A igreja segue gated por met.vova…" | `tests/` |

## Notas de implementação

- **Mudança de produção provável é mínima:** a cena `asMarias`/`asMariasAgain` já parece livre de mangue (cenários 2–3 podem nascer verdes — caracterização). A única edição de produção esperada é o **toast** (task 4). Se as asserções de conteúdo passarem direto, registre como teste de caracterização (brownfield, PLAYBOOK §7.1) e siga.
- **Não mexer** no gate `met.vova`, na ordem de distritos, nem no schema do save.
- **Não mexer** no puzzle Manguebeat (`STORY.levels[9]`) nem na fala do Jeff além de verificar — o mangue é tema deles por design.
- **Texto do toast (decidido pelo cliente):** `"A porta da Piedade vai abrir quando o coração estiver pronto."` — e trocar a cor `#d9b25c` por `#f2c038` (ouro `--ouro`, coesão com o toast de conclusão da cena) tanto em `color` quanto em `textColor`. Se 3.5s ficar curto pro texto, subir `t` levemente.
- **Fala de reentrada (decidida pelo cliente):** em `asMariasAgain`, trocar a fala da `vovoMae` `"O amor que nos une não tem fim. Vai com força, meu amor."` por `"O amor que nos une não tem fim. Sempre que tu voltar, a gente está aqui."` — muda o vetor de "despedida" para "permanência".

> Revisão paralela por specialists: ver bloco na resposta do `/spec` (product + qa + design).
