# BDD — 011 Mangue com fundo vivo

Cena alvo: `SCENES[5]` em `js/sprites.js`. Os cenários são verificáveis no harness headless
(`tests/test-mangue-fundo-vivo.js`): carrega os scripts reais num contexto `vm`, reusa os stubs
`fakeCtx`/`fakeCanvas` dos harnesses existentes e **espia os globais `antena`, `drawCrab` e `PR`**
reatribuindo-os no contexto global por funções que registram cada chamada e seus argumentos,
**antes** de invocar `SCENES[5].s` / `SCENES[5].d`.

Convenções do harness (valem para todos os cenários):

- Assinaturas reais: `antena(ctx, x, y, s, c)` → arg 3 = `y`, arg 5 = `c`; `drawCrab(ctx, x, y, s)` → arg 2 = `x`, arg 3 = `y`.
- Os cenários de parte **estática** invocam `SCENES[5].s(ctx)` **diretamente** (nunca via `drawScene`, que tem cache offscreen e só chama `.s` uma vez por cena).
- Cada cenário **reinicia os espiões** (zero chamadas) no seu `Given`.

Feature: Fundo vivo no Manguezal do Capibaribe (cena 5)
  Para que o diálogo da fase do Cordão da Lama respire vida
  Como Maju no manguezal
  Quero ver uma antena enfiada na lama e caranguejos andando

  Background:
    Given os scripts do jogo carregados num contexto vm com stubs de browser
    And os globais "antena", "drawCrab" e "PR" substituídos por espiões que registram argumentos
    And os globais "SCENES" e "drawScene" disponíveis no contexto vm

  Scenario: A antena aparece na parte estática do mangue
    Given os espiões reiniciados (zero chamadas)
    When eu invoco SCENES[5].s(ctx)
    Then o espião de "antena" registra pelo menos 1 chamada
    And o 3º argumento (y) de alguma chamada a "antena" é >= 440 (base na lama)

  Scenario: A antena usa cor de silhueta diurna, distinta da cena 9
    Given os espiões reiniciados
    When eu invoco SCENES[5].s(ctx)
    Then o 5º argumento (cor) de uma chamada a "antena" é a string "#2a4a30"
    And essa cor é diferente do default crepuscular da cena 9 ("#1a2f26")

  Scenario: Caranguejos são desenhados na parte animada em escala de fundo
    Given os espiões reiniciados
    When eu invoco SCENES[5].d(ctx, 0.5)
    Then o espião de "drawCrab" registra 2 ou mais chamadas
    And o 4º argumento (escala s) de cada chamada a "drawCrab" é 2

  Scenario: Os caranguejos se mexem ao longo do tempo
    Given os espiões reiniciados
    When eu invoco SCENES[5].d(ctx, 0.5) capturando as posições no instante A
    And reinicio o espião e invoco SCENES[5].d(ctx, 1.7) capturando as posições no instante B
    Then existe pelo menos um índice i em que o x do caranguejo difere entre A e B

  Scenario: Os caranguejos ficam na faixa de lama em qualquer instante
    Given os espiões reiniciados
    When eu invoco SCENES[5].d(ctx, t) para cada t em {0, 0.5, 1.7, 3.0, 5.0} (invocações separadas, espião acumulado)
    Then todo 3º argumento (y) de "drawCrab" é >= 440
    And todo 2º argumento (x) de "drawCrab" está em 0 <= x < 360

  Scenario: As coordenadas dos caranguejos são finitas em t = 0
    Given os espiões reiniciados
    When eu invoco SCENES[5].d(ctx, 0)
    Then todo x e todo y passados a "drawCrab" são Number finitos (não NaN, não Infinity)

  Scenario: Os detritos boiando continuam sendo desenhados (sem regressão)
    Given os espiões reiniciados
    When eu invoco SCENES[5].d(ctx, 0.5) e depois SCENES[5].d(ctx, 1.7)
    Then em cada invocação o espião de "PR" registra pelo menos 2 chamadas com a cor "#6a5a42" (os dois detritos)
    And nenhuma exceção é lançada em nenhuma das invocações

  Scenario: A cena renderiza via drawScene no primeiro frame sem erro
    Given os espiões reiniciados
    And o stub de document.createElement retorna um fakeCanvas cujo getContext() devolve um fakeCtx
    When eu invoco drawScene(5, ctx, 0)
    Then nenhuma exceção é lançada
    And o espião de "drawCrab" (capturado pela parte animada .d) registra pelo menos 1 chamada

  Scenario: O escopo não vaza para outras cenas
    Given os espiões reiniciados
    When eu invoco SCENES[9].s(ctx)
    Then o espião de "antena" registra exatamente 2 chamadas (as antenas originais da cena 9, inalteradas)
    And TOTAL_PHASES permanece o mesmo valor de antes desta feature
