# Spec BDD — 008 Minijogos temáticos (cena = mecânica)

> Discovery: `.discovery/001-minijogos-tematicos/` · Story: [story.md](story.md)
>
> **Stack:** Canvas 2D puro, vanilla JS, sem build. Motores são classes `*Puzzle` em
> [js/puzzles.js](../../js/puzzles.js), registradas em `PUZZLES`, atribuídas às conchas pelo campo
> `e:` em `CHAPTERS` ([js/levels.js](../../js/levels.js)), com dificuldade por tier em `engineCfg(e,g)`.
>
> **Contrato de cada motor** (igual aos 11 atuais): `constructor(cfg = {})` · `tap(x,y)` · `update(dt)` ·
> `draw(ctx,t)` · flag `this.solved`. Vitória → `this.solved = true` (+ `AudioFX.win()`).
> **Input primário é `tap(x,y)`** em todos os motores (mantém o contrato e permite teste headless).
> **Exceção:** a 🪁 Pipa aceita **também inclinação** (giroscópio) como entrada secundária — via um método
> `tilt(gamma)` alimentado por `DeviceMotion`/`deviceorientation` no browser; no headless, `tilt(gamma)`
> é dirigido diretamente (sem evento). `tap(x,y)` continua funcionando como fallback em qualquer device.
> `update(dt)` recebe só `dt`; o tempo de animação `t` chega em `draw(ctx,t)`.
>
> **Testes headless** (node + vm, zero-dep, no padrão de `tests/test-*.js`): carregam os scripts,
> instanciam via `window.__puzzles[N]` e dirigem por `tap(x,y)`/`update(dt)`, lendo `solved`.
> `requestAnimationFrame` stubado; nada toca `save`.
> - **`window.__puzzles` é um hook NOVO** que o `/implement` deve expor em `js/puzzles.js`
>   (no padrão de `window.__levels` em `levels.js:213`): `window.__puzzles = { 1: LightsPuzzle, …, 16: PipaPuzzle }`.
> - **`AudioFX.win` é stubado como spy** no sandbox do harness (`AudioFX = { win: () => winCount++, … }`);
>   "AudioFX.win foi chamado" significa `winCount` incrementou.
>
> **Hooks que cada motor novo expõe** (além do contrato):
> - Puzzles-de-solução (12 Jangada, 13 Pontes, 15 Renda): `this.solvable` (bool, computado por BFS na
>   construção) **e** `solution()` → lista de taps `[{x,y}, …]` que, aplicados em ordem, levam a `solved`.
> - Ação (14 Caranguejo, 16 Pipa): condição de vitória explícita e reset não-travante ao errar/colidir.
>
> **Geração procedural** (lei da `STACK.md` + Security): os 3 puzzles-de-solução geram com guard de
> tentativas finitas + **fallback determinístico** garantidamente solúvel (padrão `MazePuzzle`,
> `puzzles.js:879-936`) — nunca `do/while` ilimitado.
>
> Convenções: PT-BR em todo texto; **só tokens de cor de `DESIGN.md`**; helpers `PR`/`PU`/`pTxt`/`panel`
> reusados; `PA` é a área do puzzle. 1 commit por cenário verde.

---

## Grupo A — Registro e resolução de fase

Cenário: Os 5 motores novos estão registrados no hook window.__puzzles

```gherkin
Dado os scripts do jogo carregados na ordem do index.html
  E que js/puzzles.js passou a expor window.__puzzles (hook novo deste /implement)
Quando leio window.__puzzles
Então existem as chaves 12, 13, 14, 15 e 16
  E window.__puzzles[12] é JangadaPuzzle, 13 é PontesPuzzle, 14 é CaranguejoPuzzle, 15 é RendaPuzzle, 16 é PipaPuzzle
  E o índice 5 (Maze) continua sem ser usado por nenhuma concha (segue desativado)
```

Cenário: getLevel resolve as conchas reatribuídas para os motores novos

```gherkin
Dado os scripts do jogo carregados
Quando chamo window.__levels.getLevel(g) para cada concha reatribuída
Então getLevel(2).engine é 16 e getLevel(11).engine é 16  (Pipa)
  E getLevel(8).engine é 12 e getLevel(30).engine é 12      (Jangada)
  E getLevel(12).engine é 13 e getLevel(29).engine é 13     (Pontes)
  E getLevel(15).engine é 14 e getLevel(28).engine é 14     (Caranguejo)
  E getLevel(18).engine é 15                                (Renda)
```

---

## Grupo B — Reatribuição: invariantes globais

Cenário: Nenhum motor é usado mais que 3 vezes nas 31 conchas

```gherkin
Dado os scripts do jogo carregados
Quando conto getLevel(g).engine para g de 1 a 31
Então nenhum motor aparece mais que 3 vezes
  E os motores novos contam: Jangada(12)=2, Pontes(13)=2, Caranguejo(14)=2, Pipa(16)=2, Renda(15)=1
```

Cenário: Nenhum motor se repete dentro de um mesmo distrito

```gherkin
Dado os scripts do jogo carregados
  E que window.__levels.DISTRICT_STARTS e window.__levels.DISTRICT_SIZES estão definidos
Quando agrupo getLevel(g).engine por distrito usando DISTRICT_STARTS/SIZES
Então em cada um dos 9 distritos todos os motores são distintos (sem repetição interna)
```

Cenário: A soma das conchas continua 31 e todas resolvem para um motor válido

```gherkin
Dado os scripts do jogo carregados
Quando chamo getLevel(g) para g de 1 a 31
Então cada getLevel(g).engine existe como chave em window.__puzzles
  E window.__levels.TOTAL_PHASES é 31
```

---

## Grupo C — Compatibilidade de save (ADR-002 intacto)

Cenário: Reatribuir o motor de uma concha não invalida um save existente

```gherkin
Dado um save com done={8:true} (a concha 8 já estava concluída antes da reatribuição)
Quando o jogo carrega e resolve getLevel(8) agora apontando para Jangada(12)
Então done[8] continua true (a conclusão é por concha g, não por motor)
  E nenhuma migração de save é disparada por causa da troca de e:
```

Cenário: Diálogo de âncora permanece intacto após troca de motor

```gherkin
Dado a concha 8 reatribuída de Sequence(8) para Jangada(12)
Quando leio getLevel(8).intro, .outro e .scene
Então intro/outro/scene são exatamente os mesmos de antes da troca (engine ≠ roteiro)
```

---

## Grupo D — engineCfg: dificuldade por tier

Cenário: Cada motor novo retorna cfg em todos os tiers, inclusive nos boundaries

```gherkin
Dado os scripts do jogo carregados
Quando chamo window.__levels.engineCfg(e, g) para e em {12,13,14,15,16}
     em g=1 (tier 0 mínimo), g=15 (tier 1) e g=31 (tier 2 máximo)
Então engineCfg retorna um objeto não-vazio em todos os casos, sem erro
  E a dificuldade em g=31 é maior ou igual à de g=1
     (mais ilhas/alfinetes/caranguejos/correntes — pelo menos um parâmetro cresce)
```

---

## Grupo E — 🌉 Pontes (puzzle-de-solução, BFS)

Cenário: Pontes gera sempre uma rede solúvel nos dois extremos de tier

```gherkin
Dado 100 instâncias de PontesPuzzle com cfg de g=12 (tier 1) e 100 com cfg de g=29 (tier 2)
Quando inspeciono this.solvable em cada uma
Então this.solvable é true em todas (BFS garante que dá pra ligar todas as ilhas)
```

Cenário: Conectar todas as ilhas resolve o puzzle

```gherkin
Dado uma instância de PontesPuzzle
  E AudioFX.win stubado como spy (winCount)
Quando aplico via tap(x,y) cada movimento de solution() em ordem
Então this.solved é true
  E winCount incrementou exatamente 1
```

Cenário: Pontes inválida (ilha isolada) não marca solved

```gherkin
Dado uma nova instância de PontesPuzzle
Quando aplico taps que deixam ao menos uma ilha desconectada
Então this.solved permanece false
```

Cenário: tap em PontesPuzzle já resolvido não corrompe estado

```gherkin
Dado uma instância de PontesPuzzle com this.solved === true (via solution())
Quando chamo tap(x,y) em qualquer posição do tabuleiro
Então this.solved permanece true
  E nenhuma exceção é lançada
```

---

## Grupo F — 🧵 Renda de bilro (puzzle-de-solução)

Cenário: Renda gera sempre um traçado válido

```gherkin
Dado 100 instâncias de RendaPuzzle com cfg de g=18 (e dos tiers 0/1/2)
Quando inspeciono this.solvable em cada uma
Então this.solvable é true em todas (existe ao menos um traçado que passa por todos os alfinetes)
```

Cenário: Traçar a linha por todos os alfinetes na ordem resolve

```gherkin
Dado uma nova instância de RendaPuzzle
  E AudioFX.win stubado como spy
Quando aplico via tap(x,y) a sequência de alfinetes de solution()
Então this.solved é true
  E winCount incrementou exatamente 1
```

Cenário: Pular um alfinete não resolve o puzzle

```gherkin
Dado uma nova instância de RendaPuzzle
Quando aplico uma ordem de taps que pula um alfinete
Então this.solved permanece false (o traçado precisa cobrir todos)
```

Cenário: Tocar o mesmo alfinete duas vezes não avança o traçado indevidamente

```gherkin
Dado uma nova instância de RendaPuzzle
Quando toco o primeiro alfinete duas vezes consecutivas
Então o traçado não conta dois alfinetes
  E this.solved permanece false
```

---

## Grupo G — 🛶 Jangada na maré (puzzle-de-solução, BFS)

Cenário: Jangada sempre tem caminho até o cais nos dois extremos de tier

```gherkin
Dado 100 instâncias de JangadaPuzzle com cfg de g=8 (tier 0) e 100 com cfg de g=30 (tier 2)
Quando inspeciono this.solvable em cada uma
Então this.solvable é true em todas (BFS garante caminho da origem ao cais pelas células de corrente)
```

Cenário: Guiar a jangada até o cais resolve o puzzle

```gherkin
Dado uma nova instância de JangadaPuzzle
  E AudioFX.win stubado como spy
Quando aplico via tap(x,y) o caminho de solution() até o cais
Então this.solved é true
  E winCount incrementou exatamente 1
```

Cenário: Encalhar na areia/obstáculo não trava — a jangada volta jogável

```gherkin
Dado uma nova instância de JangadaPuzzle
Quando movo a jangada para uma célula de encalhe (areia/banco)
Então this.solved permanece false
  E a jangada retorna a uma posição jogável (reset), sem estado travado
  E novos tap(x,y) continuam sendo aceitos
```

---

## Grupo H — 🦀 Caranguejo no mangue (ação/timing)

Cenário: Pegar os caranguejos na janela certa vence o jogo

```gherkin
Dado uma instância de CaranguejoPuzzle (cfg de g=15)
  E AudioFX.win stubado como spy
Quando avanço a simulação com update(1/60) e, a cada frame com caranguejo exposto, toco o buraco dele
     até atingir a meta de capturas
Então this.solved fica true
  E winCount incrementou
```

Cenário: Tocar buraco vazio ou perder a janela não trava o jogo

```gherkin
Dado uma instância de CaranguejoPuzzle
Quando toco um buraco sem caranguejo (erro) ou deixo a janela passar avançando update(1/60)
Então this.solved permanece false
  E o contador de capturas não fica negativo nem estoura (clamp ≥ 0)
  E avançar update(1/60) continua expondo novos caranguejos (jogo segue jogável)
```

Cenário: O caranguejo é vencível em tempo finito

```gherkin
Dado uma instância de CaranguejoPuzzle em qualquer tier
Quando simulo a captura ótima (tocar sempre o caranguejo exposto) ao longo de update(1/60)
Então this.solved fica true antes de um número finito de passos (não há estado impossível)
```

---

## Grupo I — 🪁 Pipa no vento (ação/timing, input por tap + inclinação)

Cenário: Conduzir a pipa até a altura-alvo via tap vence o jogo

```gherkin
Dado uma instância de PipaPuzzle (cfg de g=2)
  E AudioFX.win stubado como spy
Quando, via tap(x,y) (puxar a linha p/ esquerda/direita), conduzo a pipa pelas correntes
     até a altura-alvo ao longo de update(1/60)
Então this.solved fica true
  E winCount incrementou
```

Cenário: Conduzir a pipa via inclinação (giroscópio) também vence

```gherkin
Dado uma instância de PipaPuzzle (cfg de g=2)
  E AudioFX.win stubado como spy
Quando dirijo a pipa chamando tilt(gamma) com inclinação para o lado das correntes favoráveis
     ao longo de update(1/60), sem nenhum tap
Então this.solved fica true (inclinação é entrada equivalente ao tap)
  E winCount incrementou
```

Cenário: tilt(gamma) é inócuo quando não há suporte a giroscópio (fallback tap)

```gherkin
Dado uma instância de PipaPuzzle
Quando o ambiente não emite eventos de inclinação (tilt nunca é chamado)
Então a pipa ainda é totalmente jogável e vencível só por tap(x,y)
  E nenhuma exceção é lançada por ausência de DeviceMotion
```

Cenário: Colidir com uma corrente/obstáculo reseta sem travar

```gherkin
Dado uma nova instância de PipaPuzzle
Quando a pipa colide com uma corrente adversa/obstáculo
Então this.solved permanece false
  E a pipa volta a uma posição jogável (reset suave), sem congelar
  E o jogo continua aceitando tap(x,y)
```

---

## Grupo J — Robustez transversal (todos os motores novos)

Cenário: tap fora da área PA não afeta estado nem lança exceção

```gherkin
Dado uma instância de cada motor novo (12,13,14,15,16)
Quando chamo tap(-1, -1) e tap(400, 700) (fora do canvas 360×640)
Então this.solved permanece false
  E nenhuma exceção é lançada
```

Cenário: Cada motor novo desenha um quadro sem lançar exceção

```gherkin
Dado uma instância de cada motor novo (12,13,14,15,16) com um contexto canvas stubado
Quando chamo update(0.1) seguido de draw(ctx, 1.0)
Então nenhuma exceção é lançada
  E o desenho usa a área PA do puzzle (não escapa do tabuleiro)
```

Cenário: A geração procedural não bloqueia o event loop

```gherkin
Dado qualquer cfg válida por tier para os motores de solução (12, 13, 15)
Quando instancio 100 vezes consecutivas cada um
Então nenhuma instância leva mais de 50ms para construir (guard finito + fallback determinístico)
```

Cenário: Alvos de toque dos motores de ação respeitam o mínimo de acessibilidade

```gherkin
Dado uma instância de CaranguejoPuzzle e uma de PipaPuzzle
Quando inspeciono as zonas interativas (buracos / zona de controle da linha)
Então cada zona de toque tem ao menos 44×44px no canvas 360×640 (mandato de acessibilidade de toque)
```
