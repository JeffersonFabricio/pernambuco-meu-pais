# Spec BDD — O encontro das Marias na igreja

> Feature: `004-encontro-marias` · Story: [story.md](story.md) · ADR: [ADR-003](../../docs/adr/ADR-003-cena-reencontro-marias.md)
> Validação: manual no navegador via `window.__*` (sem framework de teste — baseline brownfield). Roteiros concretos no fim do arquivo.

```gherkin
Funcionalidade: Reencontro das duas Marias dentro da igreja (beira-mar, d7)
  Para que a Maju veja que o amor da família atravessa a vida e o céu,
  a Igreja de Nossa Senhora da Piedade, à beira-mar, guarda o reencontro
  das duas Marias: a Vó Maria José (viva, conhecida no frevo) e a Vó Maria
  Rita (do céu). A Maria Rita NÃO fica no mundo — é uma aparição que surge
  só ao ENTRAR na igreja. Sem mexer na contagem de conchas.

  Contexto:
    Dado que o distrito 7 (Beira do Mangue / litoral) está acessível
    E que existe uma entrada "asMarias" (a igreja-prédio) em WORLD_NPCS no litoral de d7
    E que o mapa-mundo isométrico está sendo exibido

  Cenário: Igreja registrada como cena, desenhada por código
    Quando o mundo é carregado
    Então WORLD_NPCS contém uma entrada "asMarias" no litoral de d7
    E NPC_DRAW["asMarias"] é uma função (desenho por código, sem Image/asset)
    E a entrada "asMarias" NÃO aparece em PHASE_NODES
    E o tile de "asMarias" não coincide com o tile de nenhum nó de concha

  Cenário: A Vó Maria Rita não é NPC do mundo (aparição)
    Quando o mundo é carregado
    Então "vovoMae" (Maria Rita) NÃO aparece em WORLD_NPCS
    E ela permanece como SPEAKER, desenhada apenas na cena do reencontro

  # --- gate narrativo: basta conhecer a Vó Maria José (viva) ---

  Cenário: Igreja fechada até conhecer a Vó Maria José
    Dado que "met.vova" é falsy
    Quando a Maju toca a igreja
    Então a cena de reencontro NÃO inicia
    E "met.asMarias" permanece falsy (nada é gravado no save)
    E uma dica suave de tom genérico é exibida ("ainda não é o momento"),
      sem revelar qual avó falta

  Cenário: Ao entrar na igreja, a Maria Rita aparece e as Marias se reúnem
    Dado que "met.vova" é verdadeiro
    E que "met.asMarias" é falsy
    Quando a Maju entra na igreja
    Então é exibido STORY.meet.asMarias (cena cheia), com as duas Marias juntas
    E há falas atribuídas a "vova" e a "vovoMae" na cena (as duas Marias falam)
    E há ao menos uma fala de "maju" na cena
    E ao menos uma fala cita "Maria" (o fio da família é honrado)
    E ao concluir, "met.vovoMae" passa a ser verdadeiro (a Maju viu a Maria Rita)
    E "met.asMarias" passa a ser verdadeiro

  Cenário: A cena não menciona morte (tom de reencontro, não de despedida)
    Quando STORY.meet.asMarias e STORY.meet.asMariasAgain são inspecionados
    Então nenhuma fala contém "morte", "morrer", "morreu", "faleceu", "partiu" ou "despedida"

  Cenário: Reencontro já visto mostra a fala curta
    Dado que "met.asMarias" é verdadeiro
    Quando a Maju toca a igreja de novo
    Então é exibido STORY.meet.asMariasAgain (curta), não STORY.meet.asMarias (cheia)
    E a fala curta também cita "Maria" (mantém o fio da família)

  # --- invariantes e persistência (Lei do Domínio) ---

  Cenário: A cena não adiciona conchas
    Quando a igreja é adicionada ao mundo
    Então TOTAL_PHASES permanece 31
    E PHASE_NODES não ganha nenhum nó por causa da igreja

  Cenário: Save da cena vista não regride após reload
    Dado um save v3 cujo "met" contém { asMarias: true }
    Quando o jogo é recarregado (parseSave)
    Então "met.asMarias" continua verdadeiro
    E a Maju vê a fala curta (asMariasAgain) ao tocar a igreja

  Cenário: Save sem ou com met malformado não trava (load defensivo)
    Dado um save v3 cujo "met" não tem "asMarias" (ou cujo "met" é null)
    Quando o jogo carrega esse save
    Então o jogo carrega sem erro de console
    E "met.asMarias" é falsy
    E tocar a igreja respeita o gate (não dispara a cena se a Vó Maria José não foi conhecida — met.vova falsy)

  Cenário: Igreja inacessível enquanto d7 está na névoa
    Dado que o distrito 7 ainda não está desbloqueado
    Então o tile da igreja (litoral de d7) está coberto pela névoa
    E a Maju não consegue alcançá-lo até desbloquear a região

  Cenário: Jogo carrega e desenha a igreja sem exceção
    Quando o index.html é aberto no navegador
    Então não há erro no console
    E a igreja (prédio) é desenhada sem lançar
    E a cena do reencontro desenha as duas Marias juntas sem lançar
```

## Roteiro de validação manual (via `window.__*`)

```js
const k = 'maresRecife:pernambuco-meu-pais';
// gate parcial (só uma avó conhecida):
window.__game.save.met.vova = true; window.__game.save.met.vovoMae = false;
window.__world.talk?.('asMarias'); // não deve abrir a cena cheia; toast de dica genérica
// reencontro completo:
window.__game.save.met.vova = true; window.__game.save.met.vovoMae = true; window.__game.save.met.asMarias = false;
window.__world.talk?.('asMarias'); // abre STORY.meet.asMarias
// persistência:
const s = JSON.parse(localStorage.getItem(k)); s.met.asMarias = true; localStorage.setItem(k, JSON.stringify(s));
location.reload(); // pós: window.__game.save.met.asMarias === true; talk('asMarias') → asMariasAgain
// grep de tom (sem morte):
const ls = [...(STORY.meet.asMarias||[]), ...(STORY.meet.asMariasAgain||[])];
['morte','morrer','morreu','faleceu','partiu','despedida'].some(w => ls.some(l => l.text.toLowerCase().includes(w))); // false
```

> Os hooks exatos (`window.__world.talk`, exposição de `WORLD_NPCS`/`PHASE_NODES`/`STORY`) devem ser confirmados/ajustados no `/implement`; onde não houver hook, validar pela aba Sources do DevTools. A posição exata do tile da igreja e o detalhe do desbloqueio ficam a definir no `/implement` (ADR-003).

## Notas de implementação (não-normativas)

- `js/world3d.js` (via registro único `js/characters.js`, ADR-005): entrada `key: 'asMarias'` em `WORLD_NPCS` num tile do **litoral de d7 (Beira do Mangue)**, de frente pro mar aberto do SE — a Igreja N. S. da Piedade à beira-mar; `NPC_DRAW.asMarias` → `drawIgrejaMarias`. **Não** adicionar a `PHASE_NODES`. (A cena segue gateada por `met.vova && met.vovoMae`; d7 abre junto da Vovó Maria, mantendo o reencontro alcançável.)
- `js/sprites.js`: `drawIgrejaMarias` reusando o desenho de torre de igreja (extraível de `casa()`, sprites.js:441) + `drawVova` + `drawVovoMae` lado a lado. **Declarar antes de `world3d.js` na ordem dos `<script>` do `index.html`** (risco clássico de console — FF-002; ver ADR-003).
- Interação (`main.js` `talkNpc` ou equivalente em `world3d.js`): checar `met.vova && met.vovoMae` antes de iniciar; usar `met.asMarias` → `asMariasAgain` (mesmo padrão de `talkNpc`). `SPEAKERS` `vova` e `vovoMae` já existem.
- `js/story.js`: `STORY.meet.asMarias` (cena cheia: `nar`, `vova`, `vovoMae`, `maju`) + `asMariasAgain` (curta). Honrar o fio "Maria" já presente no diálogo de `vovoMae` (story.js:340-342).
- **Revisão editorial (humano):** o tom amoroso e sereno (reencontro, não despedida; serenidade luminosa da vovó do céu) é critério de revisão humana da spec — o cenário automatizável cobre apenas a ausência de palavras de morte.
