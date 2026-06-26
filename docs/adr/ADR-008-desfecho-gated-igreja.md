# ADR-008 — Desfecho no céu gated pela igreja das Marias (met.vovoMae)

> Data: 2026-06-26 · Status: Aceito · Spec: `specs/010-ceu-maria-rita/`

## Contexto

O desfecho (subir ao céu de jangada com o Vovô Maro e reencontrar a Vó Maria Rita)
hoje dispara apenas com `doneCount() >= TOTAL_PHASES` (31 conchas), em dois pontos:
`afterPuzzle` (main.js:352) e `talkNpc` do Vovô Maro (main.js:859).

A cena da igreja N. S. da Piedade (`asMarias`, ADR-003 / spec 009), onde a Maju
conhece a Vó Maria Rita e aprende a lição do amor eterno, é **opcional** — não é
concha, não conta para `TOTAL_PHASES`. Logo, um jogador pode completar as 31 conchas
sem nunca entrar na igreja e, mesmo assim, o desfecho cita a Vó Maria Rita e agora
conduz um **reencontro focal** com ela. Isso cria incoerência narrativa: reencontrar
quem nunca se encontrou.

A spec 010 aprofunda esse encontro, tornando a incoerência mais visível.

## Decisão

Gatear o desfecho por `met.vovoMae` **além** das 31 conchas. O céu só dispara quando
`doneCount() >= TOTAL_PHASES && S.save.met.vovoMae` (a Maju entrou na igreja e conheceu
a Vó Maria Rita). Aplica-se aos dois gatilhos (`afterPuzzle` e `talkNpc`).

Para não prender o jogador: quando ele tem as 31 conchas mas ainda não visitou a igreja,
o Vovô Maro no cais **não** mostra "★ SUBIR" — mostra "★ FALAR" e dá uma **dica**
apontando a igreja das Marias (sem spoiler pesado, no tom afetivo). O botão "★ SUBIR"
só aparece quando ambas as condições são satisfeitas.

## Consequências

**Positivas**
- Coerência narrativa: o reencontro no céu pressupõe o encontro na igreja.
- Valoriza a cena da igreja (lição do amor eterno) como parte essencial da jornada.

**Negativas / custo**
- A regra de progressão muda: completar conchas deixa de ser suficiente para o fim.
- Exige uma dica de redirecionamento no Vovô Maro (escopo extra, baixo).
- Caso de borda a cobrir: 31 conchas + `met.vovoMae` false → desfecho não dispara.

**Invariantes preservados**
- Progresso nunca regride (Lei do Domínio §4); `TOTAL_PHASES` segue derivado de
  `DISTRICT_SIZES` (FF-DOM-2) — o gate é condição adicional, não muda a contagem.

## Alternativas consideradas

- **Sempre acontece (sonho)** — narração neutra que funciona com ou sem a igreja.
  Mais simples, sem gating; descartada por o cliente preferir coerência forte.
- **Narração sensível a `met.vovoMae`** (encontro × reencontro) — coerente sem prender,
  mas mantém a igreja opcional; descartada pela mesma razão.
