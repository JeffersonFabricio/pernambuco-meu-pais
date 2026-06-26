# Story — 010 · Encontro no céu com a Vó Maria Rita

> Modo: **solo / brownfield** · sem discovery prévio
> Blueprint **sim** (cena multi-beat). ADR **sim** → [ADR-008](../../docs/adr/ADR-008-desfecho-gated-igreja.md):
> o desfecho passa a ser gated por `met.vovoMae` (igreja obrigatória) — muda regra
> de progressão. Reúsa `drawVovoMae`, `jangadaSil`, `drawBead` e o sistema de diálogo.

## Story

**Como** a família que joga até o fim (completar as 31 conchas),
**quero** que o desfecho no céu seja um **reencontro de verdade com a Vó Maria Rita** —
não rostos distantes, mas a jangada do Vovô Maro chegando até ela —
**para que** a jornada termine no encontro do amor que não tem fim.

## Contexto narrativo (cuidado — feature afetiva)

- O jogo é homenagem à Maju (Maria Júlia). O desfecho é o momento mais delicado do jogo.
- **Vovô Maro** (paterno, do céu) conduz a jangada que sobe. **Vó Maria Rita**
  (materna, do céu) é a figura que os espera lá em cima. A Maju já a conheceu
  DENTRO da igreja (cena `asMarias`) — este reencontro é coerente com a fala dela
  lá: _"Sempre que tu voltar, a gente está aqui."_
- Tom: **um sonho**, não uma despedida. Preservar o retorno (_"toque para voltar
  ao Recife"_) — a Maju sobe, encontra, e volta. Nada de morte explícita.

## Critérios de Aceite

1. **Encontro focal** — durante a cena `ceu`, a Vó Maria Rita aparece como figura
   central que a jangada alcança (`drawVovoMae` posicionada em x≈W/2, ~160..200),
   não apenas uma das 8 almas no canto superior. Verificável pela estrutura da cena.
2. **Reencontro narrado** — o encontro é conduzido por **narração** (`who: 'nar'`)
   e pela **aparição focal** da Vó Maria Rita; ela **não ganha novas falas** no céu
   (já falou na igreja). A narração evoca a lição do amor eterno (`amorCeu`).
3. **Os três juntos** — o desfecho mostra Vovô Maro (paterno, do céu), a Maju e a
   Vó Maria Rita (materna, do céu) reunidos; a narração referencia o reencontro das
   duas Marias já iniciado na igreja (continuidade, não contradição).
4. **Reúso visual** — usa `drawVovoMae`, `jangadaSil`, `drawBead`, `skyGrad`,
   `pTxt` existentes; sem novo asset, sem nova dependência, cores dentro da paleta
   de `DESIGN.md` (sem hex fora dela); texto em PT-BR.
5. **Sem regressão** — o jogo carrega sem erro de console; o desfecho ainda dispara
   ao completar a 31ª concha (`startEnding`, gatilho `talk('vovo')`) e ainda volta
   ao mundo ao tocar; o crédito final _"Para Maria Júlia"_ permanece.
6. **Save íntegro** — marcar `S.save.fin = true` no desfecho **não regride** nenhuma
   concha de `S.save.done` (mandato inviolável: progresso nunca regride).
7. **Gate da igreja (ADR-008)** — o desfecho só dispara com 31 conchas **e**
   `met.vovoMae` true. Com 31 conchas mas sem ter entrado na igreja, o Vovô Maro
   mostra "★ FALAR" + dica apontando a igreja das Marias (não "★ SUBIR").

## Hooks de validação manual

- `window.__game` para inspecionar `S.mode === 'ceu'` e `S.winT`.
- Forçar fim: completar todas as conchas ou hook de debug equivalente, então
  observar a cena `ceu` no navegador.
