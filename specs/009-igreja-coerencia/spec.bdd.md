# Spec BDD — 009 Coerência temática da Igreja

> Stack: jogo Canvas vanilla JS, testado headless via `node tests/test-*.js` (contexto `vm` com stubs de browser, dirigido por `window.__world` e inspeção direta de `STORY`/`NPCS`). Asserções de conteúdo são determinísticas (inspeção de strings); asserções de comportamento usam os hooks de teste reais.

Feature: A igrejinha de N. S. da Piedade fala só de fé e do reencontro das Marias
  Para que a cena emocional do encontro não seja contaminada pelo tema do mangue,
  como jogadora acompanhando a Maju,
  a presença local da igreja deve ser inequivocamente fé/beira-mar/reencontro.

  Background:
    Dado que os scripts reais do jogo estão carregados no contexto de teste
    E que `STORY.meet`, `window.__world` (inclui `.npcs`, `.talk`, `.finish`) e `window.__levels` estão disponíveis

  # ── Critério 1: cena da igreja sem vazamento de mangue ──
  Cenário: A cena de reencontro não menciona o tema do mangue
    Dado o array `STORY.meet.asMarias`
    Quando concateno o texto de todas as falas da cena
    Então o texto não contém nenhum dos tokens (case-insensitive): "mangue", "manguezal", "manguebeat", "lama"
    E o texto contém ao menos uma âncora de fé/beira-mar (ex.: "igreja", "beira-mar", "Piedade", "céu", "amor")

  Cenário: A fala curta de reentrada também não menciona mangue
    Dado o array `STORY.meet.asMariasAgain`
    Quando concateno o texto de todas as falas
    Então o texto não contém nenhum dos tokens (case-insensitive): "mangue", "manguezal", "manguebeat", "lama"
    E o texto mantém o tom de fé/reencontro das Marias

  # ── Critério 2: toast de bloqueio com tom de fé, sem revelar quem falta ──
  # NOTA: este cenário nasce RED — o texto atual é 'Ainda não é o momento...' e não tem âncora de fé/beira-mar.
  Cenário: Tocar a igreja antes de conhecer as duas avós mostra um toast de fé/beira-mar
    Dado um save novo com `met.vova = false`
    Quando a Maju interage com o NPC `asMarias` (via `window.__world.talk('asMarias')`)
    Então um toast é exibido contendo ao menos uma âncora de fé/lugar: "igrejinha", "Piedade", "porta" ou "mar"
    E o toast não contém os tokens "mangue"/"manguezal"/"lama"
    E o toast não revela o nome de nenhuma avó nem quem falta conhecer (preserva ADR-003)
    E a cena de reencontro NÃO dispara (`S.dlg` não recebe as falas de `asMarias`)

  # ── Critério 4: comportamento do reencontro intacto ──
  Cenário: Entrar na igreja após conhecer as duas avós revela a Vó Maria Rita
    Dado um save com `met.vova = true`
    Quando a Maju interage com o NPC `asMarias` (via `window.__world.talk('asMarias')`)
    Então o diálogo iniciado contém falas de `vova` e de `vovoMae` (as duas Marias na cena)
    E `S.dlg.duo` é `['vova','vovoMae']` (lido logo após `talk`, antes de `finish`)
    E ao concluir a cena (`finish`) `met.vovoMae` e `met.asMarias` ficam `true`
    E a lição do amor eterno é registrada (toast "Lição aprendida")

  # ── Critério 3: mangue permanece com o Jeff ──
  Cenário: O titio Jeff continua sendo o portador do tema mangue
    Dado os arrays `STORY.meet.jeff` e `STORY.meet.jeffAgain`
    Quando inspeciono o texto de cada array separadamente
    Então o texto de `STORY.meet.jeff` contém o token "mangue"
    E ao menos um dos dois arrays encaminha a Maju à igrejinha à beira-mar (contém "igrejinha" ou "Piedade")

  # ── Critério 5: sem regressão estrutural ──
  Cenário: A igreja continua não sendo uma concha e o total de fases não muda
    Dado o jogo carregado
    Quando leio `window.__levels.TOTAL_PHASES`
    Então o valor é 31
    E após `completeAll()` o save tem exatamente 31 fases em `done`
    E a chave `asMarias` não aparece em `save.done` (não é concha)

  Cenário: A igreja segue gated por met.vova e o jogo carrega sem exceção
    Dado o jogo carregado do zero
    Quando a cena da igreja e as avós são desenhadas
    Então nenhuma exceção é lançada
    E o NPC `asMarias` permanece gated por `met.vova`
