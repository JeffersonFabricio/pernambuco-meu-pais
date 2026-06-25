# Spec BDD — 006 Tubarão nas águas do mundo

> **Pivot de arquitetura** (ver [analysis.md](analysis.md)): o mundo vivo é o motor **isométrico
> `World3D`** ([js/world3d.js](../../js/world3d.js)), não o `drawWorld` top-down (código morto) de
> main.js. A água são tiles do MAP `24×24`: `'~'` oceano (sempre visível) e `'w'` rio. Um tubarão
> único, cosmético, patrulha o **mar**, proporcional ao tile iso, só sobre água visível.
>
> Testes headless (vm + stubs; `requestAnimationFrame` stubado): dirigem por `window.__world.*` e
> `World3D.*`. Movimento via `stepShark(dt)` determinístico (o loop real nunca roda no harness).
>
> **Hooks a expor** (todos efêmeros — nunca tocam `save`):
> - `World3D.shark()` / `window.__world.shark()` → **cópia rasa**
>   `{ col, row, sx, sy, dir, vx, vy, scale, lane, flip, onWater, visible }`. Válido já no load.
> - `World3D.stepShark(dt, unlockFn)` / `window.__world.stepShark(dt)` → passo determinístico,
>   `dt` clampado ≤ 1.0 (o wrapper de main.js injeta o `districtUnlocked` real).
>
> Helpers reusados: `World3D.tileVisible(col,row,unlockFn)`, `World3D.player`, `window.__world.unlocked(d)`,
> `window.__world.completeDistrict(d)`, `drawShark(ctx,x,y,s,flip)` (global de sprites.js),
> `MAP`/`COLS=24`/`ROWS=24`/`TW=36`/`TH=18`. Estado interno **não** se chama `S`. 1 commit/cenário.

---

Cenário: Tubarão inicializa válido já no carregamento

```gherkin
Dado os scripts do jogo carregados na ordem do index.html
Quando leio window.__world.shark() antes de qualquer stepShark
Então col e row estão definidos e dentro do MAP (0 ≤ col < COLS, 0 ≤ row < ROWS)
  E shark().scale é 2
  E shark().onWater é true (o tile sob o tubarão é '~' ou 'w')
```

Cenário: Tubarão nada só sobre água e nunca sobre tile de terra

```gherkin
Dado um jogo recém-carregado no mundo
Quando avanço a simulação com window.__world.stepShark(0.1) por 600 passos
Então em todo passo shark().onWater é true
  E em todo passo MAP[floor(row)][floor(col)] é '~' ou 'w' (nunca terra: g/r/m/./prédio)
  E em todo passo col e row permanecem dentro do MAP
```

Cenário: Tamanho do tubarão é proporcional ao mundo

```gherkin
Dado um jogo carregado no mundo
Quando leio window.__world.shark()
Então shark().scale é igual a 2 (escala do mundo iso)
  E a largura desenhada (16 * scale = 32px) é da ordem de um tile iso (TW = 36px)
  E a escala é menor que a usada na cena de vitória do puzzle do tubarão (3, ver sprites.js)
```

Cenário: Sprite espelha conforme o sentido na tela

```gherkin
Dado um jogo carregado no mundo
Quando avanço com stepShark até o tubarão nadar para a direita da tela (dir E ou N)
Então shark().flip é false (sprite olhando para a direita)
Quando continuo avançando até ele nadar para a esquerda da tela (dir W ou S)
Então shark().flip é true (sprite espelhado)
  # mundo iso não tem vertical puro: orientação é só o lado da tela; sem rotação 90°
```

Cenário: Tubarão só nada sobre águas visíveis (respeita a névoa)

```gherkin
Dado um jogo novo onde só o distrito 0 está liberado (window.__world.unlocked(0) === true)
Quando avanço a simulação por 600 passos
Então em todo passo World3D.tileVisible(floor(col), floor(row), unlock) é true
  E o tubarão nunca ocupa um tile 'w' de um distrito ainda na névoa
```

Cenário: Movimento é determinístico

```gherkin
Dado dois jogos carregados de forma independente (dois sandboxes) a partir do mesmo estado
Quando avanço cada um com a mesma sequência de window.__world.stepShark(0.1) por 200 passos
Então a posição final (col, row) e a dir são idênticas entre os dois
  E a trajetória passo a passo é idêntica
  # determinismo garantido por não usar Math.random no trajeto (Lei do Domínio: determinismo)
```

Cenário: Tubarão é puramente cosmético — não toca o save nem a Maju

```gherkin
Dado um jogo no mundo com progresso conhecido (doneCount = N) e o save serializado
Quando avanço a simulação do tubarão por 600 passos
Então doneCount permanece N (o tubarão não conta nem remove conchas)
  E JSON.stringify(window.__game.save) é idêntico ao serializado antes (nenhum campo novo)
  E a posição da Maju (World3D.player.col/row) não muda por causa do tubarão (sem colisão)
  E após reload o progresso é preservado (o tubarão é efêmero, fora do schema de save)
```

Cenário: Jogo desenha o tubarão sem exceção e aplica culling

```gherkin
Dado todos os scripts do jogo carregados na ordem do index.html
Quando o mundo é desenhado um frame com o tubarão em cena
Então nenhuma exceção é lançada (mandato inviolável FF-002)
  E shark().visible é consistente com a posição de tela: true sse (sx, sy) está na viewport
    (com margem de um tile), false caso contrário
  E ao longo de 600 passos shark().visible fica false em ao menos um passo (culling realmente ocorre)
```
