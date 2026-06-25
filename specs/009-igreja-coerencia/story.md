# 009 — Coerência temática da Igreja: fé, não mangue

## Story

**Como** mãe/jogadora acompanhando a Maju pela jornada das conchas,
**quero** que a igrejinha de Nossa Senhora da Piedade fale só de **fé e do reencontro das duas Marias**,
**para que** a cena emocional do encontro não seja contaminada pelo tema do mangue — que pertence ao titio Jeff e ao puzzle Manguebeat.

## Contexto / Diagnóstico

A cena de reencontro das Marias (`STORY.meet.asMarias`) está **plantada no distrito d7 "Beira do Mangue"** — o capítulo temático do Manguebeat ([characters.js:54-61](../../js/characters.js#L54-L61), [levels.js:91-100](../../js/levels.js#L91-L100)). O texto da cena em si já é fé/amor das Marias, mas o **enquadramento do distrito** (nome do lugar, puzzle Manguebeat, lama ao redor) faz a igreja "soar" como mangue.

**Decisão de design (escolhida pelo cliente):** *re-skin local* — manter a igreja em d7 (sem mexer no gate `met.vova` nem na ordem de abertura dos distritos), mas garantir que **toda a presença local da igreja** (toast de bloqueio + falas da cena) seja inequivocamente fé/Piedade/beira-mar/reencontro. O mangue permanece como tema **exclusivo** do titio Jeff (d3) e do puzzle Manguebeat (narrado pelo vovô Maro).

## Critérios de aceite

1. A cena da igreja (`asMarias` e `asMariasAgain`) **não contém nenhuma menção** a mangue / manguezal / lama / manguebeat — só fé, beira-mar e o reencontro das Marias.
2. O toast exibido quando a Maju toca a igreja **antes** de `met.vova` tem tom de fé/beira-mar (contém ao menos uma âncora de lugar: "igrejinha", "Piedade", "porta" ou "mar") e **continua não revelando** quem falta conhecer (preserva ADR-003).
3. O titio Jeff (d3) **permanece** o portador do tema mangue — sua fala (`jeff`/`jeffAgain`) segue explicando o mangue e encaminhando à igreja.
4. Entrar na igreja com `met.vova = true` continua reunindo as duas Marias dentro da igrejinha, registrando `met.vovoMae = true` e ensinando a lição do amor eterno (comportamento intacto).
5. Nenhuma regressão estrutural: a igreja não é concha (`TOTAL_PHASES = 31` inalterado), continua gated por `met.vova`, e o save versionado não muda de schema.

## Sem blueprint/ADR

Feature de coerência de conteúdo, dentro dos padrões da stack — fluxo de ≤ 2 passos, sem decisão arquitetural nova (a alternativa "mover de distrito" foi explicitamente descartada para preservar o gate e a sequência). Re-skin de texto/toast, sem mudança de schema nem de motor.
