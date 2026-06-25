# Hipótese — 001-minijogos-tematicos: Motores novos onde cena=mecânica

> Referência ao problema: `.discovery/001-minijogos-tematicos/problem.md`

---

## Hipótese

> Acreditamos que **adicionar 4-6 motores de puzzle novos, cada um nascido de uma cena específica do Recife (mecânica = metáfora do lugar)**,
> vai resolver **a repetição (mesmo motor até 5×) e a desconexão (puzzle genérico que não fala do lugar)**
> para **a Maju percorrendo as 31 conchas**,
> e saberemos que funcionou quando **nenhum motor aparecer mais que ~2-3× na jornada E os novos motores entregarem o mesmo "ficou perfeito" dos casos-assinatura (maracatu, amanhecer-luzes, tubarão)**.

---

## Suposições críticas

| # | Suposição | Certeza | Como validar |
|---|-----------|---------|--------------|
| 1 | Existem cenas recifenses ainda não-mecanizadas fortes o bastante pra virar motor (não só decoração) | **Média** | Mapa cena→mecânica (abaixo): se 4-6 ideias passam no teste "a mecânica conta o lugar", confirma |
| 2 | A arquitetura atual (classe `*Puzzle` + `cfg` por tier, registro em `js/levels.js`) absorve motores novos sem refator estrutural | **Alta** | Já há 10 motores no mesmo molde; um motor novo é aditivo (1 classe + 1 `e:` + reatribuição de `e:` em conchas) |
| 3 | Reduzir repetição aumenta o encantamento percebido (e não só "mais coisa pra ma manter") | **Média** | Comparar sensação das conchas-assinatura atuais vs. recicladas — o autor já sente a diferença |

---

## Maior risco

**Suposição #1** — se as cenas novas não tiverem uma mecânica que "conta o lugar" (e virarem só puzzle genérico com pintura recifense), a feature recria o problema com motores diferentes. O valor inteiro mora em cena=mecânica, não em quantidade.

---

## Escopo mínimo

**Dentro do escopo:**
- 1 **mapa cena→mecânica** (catálogo de candidatos abaixo) — o artefato que destrava o `/spec`.
- **4-6 motores novos**, cada um com classe `*Puzzle` + tiers, no mesmo molde dos atuais.
- **Reatribuição de `e:`** em `js/levels.js` para que nenhum motor passe de ~2-3×.

**Fora do escopo (explicitamente):**
- Área de arcade / fliperama avulso (caminho B descartado nesta sessão).
- Refator dos 10 motores existentes (só os casos fracos podem ser substituídos por reatribuição).
- Multiplayer, ranking, qualquer backend.

---

## Catálogo de candidatos — cena do Recife → mecânica (semente do mapa)

> Critério de corte: a mecânica precisa **narrar o lugar**, como maracatu/amanhecer/tubarão já fazem.

| # | Cena / cultura | Mecânica proposta | Distrito-alvo | Por que cena=mecânica |
|---|----------------|-------------------|---------------|------------------------|
| 1 | **Jangada na maré** (o colar do avô jangadeiro!) | Navegar lendo a corrente — guiar a jangada pelo fluxo da maré até o ponto certo | Mar / Lama | É o coração da história: a maré que dá nome ao colar vira a mecânica |
| 2 | **Pontes do Recife** ("Veneza brasileira") | Conectar as ilhas erguendo pontes na ordem certa pra atravessar | Poente | A cidade-de-pontes só se cruza ligando margens — o mapa é o puzzle |
| 3 | **Caranguejo no mangue** (manguebeat) | Pegar os caranguejos saindo dos buracos da lama no tempo certo | Lama / Antena | O mangue vivo no timing — "da lama ao caos" feito ritmo de captura |
| 4 | **Renda de bilro / renascença** (artesanato) | Traçar o caminho da linha pelos alfinetes pra revelar o desenho da renda | Memória (Casa da Cultura) | O ofício manual vira gesto: desenhar a renda é o jogo |
| 5 | **Pipa no vento** (céu / Torre Malakoff observatório) | Planar a pipa nas correntes de ar desviando de obstáculos | Sol / céu | O vento que sustenta a pipa é a física do controle |
| 6 | **Frevo da sombrinha** (Paço do Frevo) | Equilibrar a sombrinha do passista nos passes, no compasso | Passo | A dança de equilíbrio frenético vira mecânica de balance+timing |
| 7 | **Forró da sanfona** (São João recifense) | Apertar os foles/botões na sequência da melodia | (qualquer festa junina) | Tocar a sanfona É a sequência — primo musical do maracatu |

(Escolher 4-6 destes na `/spec`; #1 e #2 são os mais "assinatura" e ligados ao colar/cidade.)

---

## Métricas de validação

| Métrica | Baseline atual | Meta para considerar válido |
|---------|----------------|-----------------------------|
| Reuso máximo de um único motor | 5× | ≤ 3× |
| Motores temáticos (cena=mecânica) no total | 3 reconhecidos como "perfeitos" | +4 a +6 novos no mesmo nível |
| Refator estrutural exigido | — | Zero (só adição + reatribuição de `e:`) |
