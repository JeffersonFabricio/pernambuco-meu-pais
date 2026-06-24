# ADR-001 — Onboarding gated: Micaele → Jonatha → cidade

> Status: Proposto · Data: 2026-06-24 · Spec: `specs/001-onboarding-recife/`

## Contexto

A entrada no mundo livre (Fase 2) hoje não tem trava: a Maju cai no mapa depois de uma cutscene
conjunta de boas-vindas (`STORY.meet.welcome`, ambos os pais) e pode andar e **entrar em qualquer
concha** antes de falar com a família. O roteiro de quem falar é só texto sugestivo. O estado
`briefed` já existe, mas só controla a seta dourada — não bloqueia nada.

O cliente pediu um onboarding com roteiro real: boas-vindas da **Micaele no mundo** → falar com o
**Jonatha** → só então liberar a cidade (entrar nas conchas), com falas motivadoras nos reencontros.

## Decisão

1. **Máquina de estados de onboarding derivada do save** (sem flag nova além das existentes):
   - `!met.mica` → **AguardaMicaele**: guia aponta pra Micaele; ENTRAR concha travado.
   - `met.mica && !briefed` → **AguardaJonatha**: guia aponta pro Jonatha; ENTRAR concha travado.
   - `briefed` → **Briefed**: seta dourada pras conchas; ENTRAR liberado.
2. **Boas-vindas viram talk de NPC**, não cutscene. `startTutorial()` entra direto no mundo
   (com, no máximo, um beat de narrador). A 1ª fala da Micaele (`STORY.meet.welcome` repurposed) é a
   recepção ao Recife.
3. **Ordem obrigatória Micaele→Jonatha** validada em `talkNpc`: falar com Jonatha quando `!met.mica`
   dispara uma fala de desvio e **não** marca `met.jona`/`briefed`.
4. **Gate de ENTRAR concha** em `enterNear()`: se `!S.save.briefed`, não abre o nível e emite toast.
5. **Guia para NPC** reusa o padrão da seta dourada (`drawBeacon`), apontando para a posição de tela
   do NPC-alvo (Micaele, depois Jonatha) enquanto `!briefed`.

## Alternativas consideradas

- **Travar o movimento numa praça inicial** (barreira invisível): rejeitada pelo cliente — mais
  restritiva e arrisca frustrar quem quer explorar. Andar fica livre; só ENTRAR é gated.
- **Manter a cutscene conjunta de boas-vindas:** rejeitada — o cliente quer a Micaele recebendo
  no mundo, de forma interativa, o que também ensina o controle de andar/FALAR.
- **Flag nova de "fase"** (`S.save.phase=2`): rejeitada (YAGNI) — os booleanos `met.mica`/`briefed`
  já descrevem o estado; derivar a máquina deles evita schema novo e migração extra.

## Consequências

- **Positivas:** roteiro claro e à prova de pulo; reúso da seta existente; sem novo campo de save
  (migração v3 inalterada — saves `briefed` antigos caem direto em **Briefed**).
- **Custos/risco:** `talkNpc` e `enterNear` ganham ramos condicionais (mais lógica num arquivo já
  grande — débito aceito no Baseline §0.1); a ordem dos `<script>` não muda. Copy nova precisa de
  revisão de tom PT-BR/Recife.
- **Domínio:** respeita a Lei §4 (progresso nunca regride) — onboarding só avança; e §6 (PT-BR fiel).
