# 011 — Mangue com fundo vivo

## Story

**Como** Maju explorando o Manguezal do Capibaribe (Cordão da Lama),
**quero** que, durante o diálogo, o fundo do mangue ganhe uma antena enfiada na lama e alguns caranguejos andando,
**para** que a cena respire vida e ecoe o tema do manguebeat ("caranguejos com cérebro") mesmo antes de o jogador chegar à fase da Antena.

> Cena alvo: `SCENES[5]` ("Mangue") em [js/sprites.js](../../js/sprites.js) — a cena de fundo dos diálogos de intro/outro da fase do Cordão da Lama. Hoje o fundo tem céu esverdeado, água, raízes de mangue, lama e dois detritos boiando — **sem antena e sem caranguejos**.

## Critérios de aceite

1. `SCENES[5].s` desenha **pelo menos uma antena** reusando o helper `antena()` existente, com **cor explícita de silhueta diurna do mangue** (`#2a4a30`) — distinta do default crepuscular `#1a2f26` usado na cena 9 — e base (3º argumento `y`) na faixa de lama (`y ≥ 440`).
2. `SCENES[5].d` desenha **2 ou mais caranguejos** reusando o helper `drawCrab()`, em **escala pequena de fundo (`s = 2`)**, que se **movem** ao longo do tempo (a posição `x` muda entre dois instantes `t` distintos).
3. Todos os caranguejos ficam **na faixa de lama** (`y ≥ 440`, `0 ≤ x < 360`) e suas coordenadas são **números finitos** (sem `NaN`/`Infinity`) em qualquer `t`, inclusive `t = 0` — nunca sobre o céu, a água ou as raízes altas.
4. Os **dois detritos boiando** existentes (retângulos cor `#6a5a42`) continuam sendo desenhados a cada invocação de `SCENES[5].d` (sem regressão), e nem `SCENES[5].d(ctx, t)` nem `drawScene(5, ctx, t)` lançam exceção em `t = 0` e `t > 0`.
5. **Escopo fechado em `SCENES[5]`**: a cena 9 (Manguebeat — mantém suas 2 antenas) e as demais cenas permanecem inalteradas; `TOTAL_PHASES` e o save não mudam. Validado manualmente no navegador antes do merge (FF-002 — 0 erros de console).

## Decisões de processo

- _Sem blueprint/ADR — feature trivial e visual, dentro dos padrões da stack: toca só `js/sprites.js` (`SCENES[5].s`/`.d`), reusa os sprites existentes `antena()` e `drawCrab()`, sem decisão arquitetural, sem input externo, sem mudança de domínio/save._
- **Valores concretos sugeridos** (revisão do design-specialist, não-normativos — o `/implement` pode ajustar mantendo os ACs): antena `antena(ctx, 288, 478, 1, '#2a4a30')`; caranguejos `drawCrab(ctx, (t*18+30)%360, 448, 2)` e um segundo em sentido oposto `drawCrab(ctx, (360-(t*25+200)%360), 458, 2)`.
