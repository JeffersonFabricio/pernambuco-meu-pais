# Story — Onboarding guiado: Micaele → Jonatha → cidade

> Modo: **solo** (sem discovery prévio). Brownfield — toca `js/main.js` e `js/story.js`.

## Story

**Como** Maju (jogadora criança/casual, no celular),
**quero** ser recebida no Recife pela Micaele e, em seguida, conversar com o Jonatha antes de sair pela cidade,
**para** entender a missão do colar de marés sem me perder, com um roteiro claro de quem falar e o que fazer primeiro.

## Contexto

A Fase 1 (intro — Maju acordando do sonho) já funciona. Hoje, ao cair no mundo, a Maju pode
andar para qualquer lugar e até **entrar numa concha** antes de falar com os pais — o roteiro de
boas-vindas é só uma sugestão de texto (`"Fale com a Micaele e, depois, com o Jonatha"`), sem
nenhuma trava real. Esta story transforma esse trecho na **Fase 2: onboarding guiado e gated**.

## Decisões de produto (definidas com o cliente)

1. **Boas-vindas da Micaele acontecem no mundo** — o mundo nasce já em modo livre; uma seta/destaque
   aponta para a Micaele. As boas-vindas tocam quando a Maju chega perto e toca **★ FALAR** nela.
   (A cutscene conjunta de boas-vindas dos dois pais sai de cena.)
2. **Ordem obrigatória: Micaele primeiro.** Se a Maju tentar falar com o Jonatha antes da Micaele,
   ele desvia: *"Fala primeiro com tua mãe, filha."* — não explica a missão.
3. **Entrar nas conchas fica travado** até a Maju falar com o Jonatha (estado `briefed`). Andar é
   livre (precisa, pra chegar nos pais). Tocar **▶ ENTRAR** numa concha cedo → toast pedindo pra
   falar com os pais primeiro; a concha não abre.
4. **Falas motivadoras no reencontro** — depois de já ter falado com cada um, novas conversas dão
   uma mensagem curta de incentivo, no espírito de *"Eu sei que tu consegue, Maju. Vai lá!"*.

## Critérios de Aceite

1. Ao entrar no mundo pela primeira vez (intro concluída, `!met.mica`), uma **guia visual aponta para
   a Micaele**, e o painel de ajuda instrui a falar com ela primeiro.
2. Falar com a **Micaele** (1ª vez) toca as **boas-vindas ao Recife** dela, marca `met.mica=true` e
   a guia passa a **apontar para o Jonatha**.
3. Falar com o **Jonatha sem ter falado com a Micaele** mostra a fala de desvio e **não** marca
   `met.jona` nem `briefed` (a guia continua apontando para a Micaele). O marcador `met` só grava
   após o diálogo correto, nunca no toque que cai no desvio.
4. Falar com o **Jonatha depois da Micaele** (1ª vez) explica a missão do colar, marca `briefed=true`,
   **libera a entrada nas conchas** e ativa a seta dourada para a primeira concha.
5. Tocar **▶ ENTRAR** numa concha (por toque **ou** pelo atalho Enter/Espaço) enquanto `!briefed`
   **não abre** a concha e mostra um toast pedindo pra falar com os pais; depois de `briefed`,
   ENTRAR funciona normalmente.
6. Reencontro dá **mensagem motivadora curta**, sem repetir a explicação completa: a da **Micaele**
   vale assim que `met.mica=true` (mesmo antes de `briefed`); a do **Jonatha** vale quando `briefed=true`.
7. O **save preserva** o progresso do onboarding (`met.mica`, `met.jona`, `briefed`) entre sessões;
   a migração de saves antigos não regride quem já estava `briefed`, e um save **com ≥1 concha feita**
   é tratado como já briefado (não força refazer o onboarding — Lei do Domínio §4).
8. O jogo **carrega sem erro de console** (FF-002) em qualquer estado de save (novo, briefed, migrado,
   corrompido); save corrompido cai no onboarding do zero com segurança.

## Escopo / Não-escopo

- **Escopo:** fluxo e travas do onboarding (Fase 2), guia visual para NPC, copy PT-BR das falas
  (welcome da Micaele, desvio do Jonatha, motivadoras), trava de ENTRAR, estado/save.
- **Não-escopo:** novos puzzles, novos distritos, redesenho de sprites dos pais, mudanças na Fase 1
  (intro/sonho) ou no desfecho (céu).

## Blueprint / ADR

- **Blueprint:** sim (`blueprint.mermaid`) — fluxo > 2 passos com máquina de estados de onboarding.
- **ADR:** sim (`docs/adr/ADR-001-onboarding-gated.md`) — muda o fluxo de entrada no mundo e adiciona
  gating; toca 2 arquivos JS (`main.js` + `story.js`), o que exige ADR pelo Acordo do Time §6.
