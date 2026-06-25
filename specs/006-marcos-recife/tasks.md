# Tasks — 006-marcos-recife

> Ordem sugerida. Cada task fecha com 1 commit `feat(world):` (cenário BDD verde / bloco coerente).
> Validação: headless `[H]` no `tests/` quando dá; visual `[V]` pelo roteiro da spec.

## T1 — Igreja como prédio (não afunda)  ·  cenários "igreja se apoia / ordena por profundidade"
- Em `world3d.js`, parar de desenhar `asMarias` pelo quadro fixo de NPC (`sh=18*s`, âncora no meio).
- Desenhar a igreja **ancorada no tile**: base no chão (`y + TH/2`), crescendo pra cima — como um prédio. Opções: (a) `drawIgrejaMarias` ganha âncora "base" e é chamada com o y do chão do tile; (b) caso especial em `drawNpc` para `asMarias` com âncora de prédio.
- Manter a ordenação por `col+row` (já no `queue`) pra oclusão correta.
- **Mantém 004:** segue só o prédio (sem avós coladas) — não regredir.
- ✅ `[H]` draw não lança · `[V]` base no tile, nada abaixo do terreno.

## T2 — Mar visível na orla (oceano fura a névoa)  ·  cenários "mar visível / fura a névoa / não anda"
- `tileVisible(col,row,fn)`: retornar **true para tiles de oceano** filtrando por **TIPO** (`MAP[row][col] === '~'`), independente de zona — mar não é conteúdo secreto. (Distinto da exceção `col<=1` que já existe e pega mangue também — não confundir.)
- Garantir que TERRA travada (`g/r/m/.` + prédios) continua oculta (névoa inalterada).
- `walkable()` **não** muda: oceano segue não-caminhável.
- Cores do oceano vindas da paleta de `DESIGN.md` (`--azul-mar`/`--azul-passo`/água profunda já existentes) — **sem hex avulso novo**.
- (Opcional, se a orla não ler bem) ampliar a faixa de oceano ao norte de d1/d2, sem comer chão de zona.
- ✅ `[H]` `tileVisible(5,0,()=>false)=true`; `tileVisible(13,7,()=>false)=false`; `walkable(oceano)=false` · `[V]` mar ao norte na Beira-Mar.

## T3 — Marco Zero: praça caminhável + rosa no chão  ·  cenários "rosa no chão / caminhável / atrás de NPCs / contagem"
- Definir a **praça do Marco Zero** no centro de d0 (Recife Antigo) — tiles pavimentados (calçada portuguesa), caminháveis, sem afundar conchas/NPCs (`jona`, `mica`). **Manter o MAP/zonas em `world3d.js`** (não tocar `levels.js` → sem ADR).
- Renderizar a **rosa dos ventos projetada no chão** (decal) centrada na praça, na `queue` com profundidade de **chão** (antes de nós/NPCs/player) — reusar `drawRosaDosVentos` (estrela de 8 pontas, **maior que uma concha**, não confundível). Achatar/projetar no plano iso.
- **Perf:** gerar o decal da rosa **uma vez** (offscreen canvas / path cacheado) — não recalcular por frame (Mandato Desejável).
- **Invariantes:** `TOTAL_PHASES===31`, `DISTRICT_SIZES[0]===4`, **d0 mantém 4 nós nas MESMAS posições** do baseline, 31 conchas distintas — revalidar via gerador/`verify-nodes`. Se a praça muda tipos de tile, garantir que o gerador de `PHASE_NODES` ainda conta os tiles certos (`g`/`.`/praça caminhável).
- ✅ `[H]` invariantes + `walkable(praça)=true` · `[V]` rosa reconhecível no chão de d0, marca a área.

## T4 — Verificação consolidada  ·  cenários de invariante
- **Pré-condição:** **expor `walkable` e `tileVisible`** na API pública do `World3D` (no `return {...}`) — hoje são closures internas; sem isso 3 checagens `[H]` não rodam. São funções puras de consulta (seguro expor).
- Estender `tests/` (molde `test-encontro-marias.js`) com as checagens `[H]` da spec: draw não lança; 31 nós distintos; d0 com 4 nós nas posições do baseline; `walkable`/`tileVisible` de oceano (interior) e praça; `asMarias.d===7`; spawns caminháveis em 0..8.
- Rodar a suíte inteira (`tests/*.js`) + `verify-nodes` — tudo verde.
- `[V]` percorrer o roteiro manual da spec no navegador; **console limpo (0 erros, FF-002)** com tudo desbloqueado.

---

### Notas de planejamento
- **Surfacing enxuto:** feature visual de escopo claro; as 2 bifurcações de design (praça caminhável; mar sempre visível) foram decididas no `/spec`. Sem mais perguntas.
- **Sem blueprint/ADR:** não é fluxo multi-passo; são 3 ajustes de render dentro do `World3D`. A regra "oceano fura a névoa" fica rastreável no cenário BDD dedicado (T2), sem ADR.
- **Revisão paralela dos specialists:** ver bloco no fim da conversa do `/spec`.
