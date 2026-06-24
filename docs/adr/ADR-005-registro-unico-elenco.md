# ADR-005 — Registro único do elenco (CHARACTERS) como fonte de verdade

> Status: Aceito · Data: 2026-06-24 · Origem: débito de duplicação revelado pela feature `003-primos-separados`

## Contexto

O elenco da família é o dado mais transversal do jogo: cada personagem aparece no
mundo livre (`main.js`), no passeio final (`world3d.js`) e nos diálogos. Até aqui,
esse mesmo elenco era declarado em **4 estruturas paralelas**, em 2 arquivos:

| Estrutura | Arquivo | Campos por personagem |
|-----------|---------|------------------------|
| `NPCS`       | `js/main.js`    | key, d, dx, dy, draw, kid, lesson, ending |
| `SPEAKERS`   | `js/main.js`    | key → name, color, body(=draw), face?, pal? |
| `WORLD_NPCS` | `js/world3d.js` | key, d, col, row, color, label, lesson, ending |
| `NPC_DRAW`   | `js/world3d.js` | key → draw |

Por personagem, isso significava repetir: a função de desenho **3×** (NPCS.draw,
SPEAKERS.body, NPC_DRAW), o distrito `d` **2×**, e — quando coincidem — `color`,
`lesson`, `name`/`label` e `ending` **2×** cada. A lição dos primos
(`'Primo é parceiro pra toda aventura, chuva ou sol.'`) chegou a aparecer **4× literais**.

A feature **`003-primos-separados`** (split de `primos` → `ravi` + `nicolas`) não
*criou* a duplicação — ela **dobrou a manutenção** do que já estava espelhado: onde
antes 1 linha em cada uma das 4 estruturas bastava, passaram a ser 2. A medição da
feature acusou ~21% de duplicação de código, concentrada nesse espelhamento.

> Nuance importante: o espelhamento de `color` e `label`/`name` é **parcial**, não cego.
> `renato`/`bruno`/`vovo` têm cor de marcador no mapa **≠** cor de retrato no diálogo;
> `ravi`/`nicolas`/`bruno`/`renato` têm `label` no mapa **≠** `name` no diálogo. Ou seja,
> são atributos genuinamente por-view que *coincidem na maioria* — não dá pra colapsar num só.

## Decisão

Introduzir uma **fonte única de verdade**: `js/characters.js`, um novo script que
declara o objeto global `CHARACTERS` (e o mapa `LESSONS`). As 4 estruturas deixam de
ser literais e passam a ser **projeções derivadas** via `Characters.npcs()`,
`Characters.speakers()`, `Characters.worldNpcs()` e `Characters.npcDraw()`.

Cada personagem declara o dado **canônico** uma vez (`name`, `color`, `draw`, `d`,
`lesson?`, `kid?`, `ending?`, `portrait?`) e os atributos **por-view** só quando
existem ou divergem do canônico:

- `free: { dx, dy }` → presença marca que o personagem entra em `NPCS` (mundo livre).
- `world: { col, row, label?, color? }` → presença marca que entra em `WORLD_NPCS`;
  `label` cai em `name` e `color` cai no `color` canônico quando omitidos.

`main.js` e `world3d.js` mantêm seus nomes locais (`const NPCS = Characters.npcs()`
etc.), então **nenhum consumidor muda** — só a origem do dado.

## Alternativas consideradas

- **Dedup mínimo das constantes** (extrair só as strings de `lesson` num mapa, sem
  unificar os arrays) — rejeitado: ganho parcial, os 4 arrays paralelos continuariam
  existindo e o próximo personagem voltaria a dobrar a manutenção.
- **Aceitar como débito no §Baseline de Herança** — rejeitado: a feature acabou de
  provar que o débito *cresce* a cada personagem novo; adiar só aumenta o custo.
- **`/code-review` automático** — fora de escopo: aquele sensor faz dedup localizado
  byte-a-byte em `src/`, não cria arquivo novo nem muda a ordem de carga (arquitetura).

## Consequências

**Positivas**
- O dado de cada personagem vive **uma vez**; adicionar/editar um personagem é uma
  entrada só, não 4 linhas espalhadas em 2 arquivos.
- Elimina a duplicação que a `003` amplificou — e impede que o próximo split a recrie.
- Modela explicitamente o que é canônico vs. por-view (cor/label de mapa vs. de retrato).

**Negativas / riscos**
- **Ordem dos `<script>` (risco clássico do projeto — Mandato Inviolável / FF-002):**
  `characters.js` referencia `drawMaju/drawJonatha/…`, `MAJU_FACE`, `VOVO_FACE`,
  `FACE_PAL`, `VOVO_FACE_PAL` — todos definidos em `sprites.js`. Por isso `characters.js`
  carrega **após `sprites.js` e antes de `world3d.js`/`main.js`** no `index.html`.
- Uma indireção a mais entre "quero ver os dados do Ravi" e o array final (mitigado:
  tudo num arquivo pequeno e declarativo).
- Guardado pelo harness headless `tests/test-primos-separados.js`
  (28 asserts via `World3D.worldNpcs`/`npcDraw`), que deve permanecer 28/28 verde.
