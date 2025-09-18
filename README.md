# Frontend — Anime Tracker (HTML/CSS/JS Puro, Responsivo)

> SPA sem frameworks (sem React/Vue/Angular). Abre diretamente o `index.html` no navegador e consome a API Flask.

---

## 🎯 Objetivo

Interface de uma página para **cadastrar**, **listar em cards**, **filtrar**, **ordenar**, **avaliar por estrelas** (1–5) e **gerenciar status** dos animes.

---

## 🧠 Como este frontend atende às _key constraints_

- **Separação**: Front consome a API; nenhuma lógica de dados no servidor de páginas.
- **Uniformidade**: Rotas REST, `fetch` com JSON.
- **Camadas**: UI → API (sem acoplamento).
- **Stateless**: Cada ação é uma requisição independente (sem sessão persistida no front).
- **On-demand**: (opcional) poderia carregar scripts sob demanda; aqui mantemos simples.

---

## 📁 Estrutura sugerida do repositório

```
frontend-mvp-anime/
├─ index.html
├─ styles.css
├─ script.js
├─ logo.png
└─ README.md
```

---

## ▶️ Como executar

1. **Abra o arquivo `index.html`** diretamente no navegador (duplo clique).
2. Garanta que o **backend** está rodando em `http://127.0.0.1:5000`.

> Não há servidores locais, extensões ou configurações adicionais. Atende ao requisito do enunciado.

---

## ⚙️ Configuração

O `script.js` usa por padrão:

```js
const API = "http://127.0.0.1:5000";
```

Se necessário (por exemplo, porta/host diferente), edite essa constante.

---

## 🖼️ Funcionalidades

- **Formulário** de cadastro (título, gênero, episódios, status, data, URL da capa).
- **Lista em cards** com capa, gênero, episódios, status e data.
- **Filtros** por texto e status.
- **Ordenação** por título, melhor avaliação e mais recentes.
- **Avaliação por estrelas** (1–5) com média e contagem atualizadas em tempo real.
- **Ações**: marcar como _Assistindo_ | _Completo_ e **Excluir**.

---

## 📱 Responsividade

- _Grid_ de cards: 4 → 3 → 2 → 1 colunas (breakpoints 1100px/820px/520px).
- Formulário fluido: 3 → 2 → 1 colunas.
- Cabeçalho _sticky_ com filtros adaptáveis (1–4 colunas).

---

## 🔗 Rotas chamadas pelo frontend

- `POST /cadastrar_anime` (cadastro)
- `GET /buscar_animes` (listar com filtros)
- `POST /avaliar_anime/<id>` (avaliar)
- `PUT /atualizar_anime/<id>` (alterar status)
- `DELETE /deletar_anime/<id>` (excluir)

> ✅ Cobre **todas** as rotas principais do backend.

---

## 🧪 Roteiro de teste manual (checklist)

- [ ] Cadastrar novo anime (form) → aparece na lista.
- [ ] Filtrar por texto/status.
- [ ] Ordenar por melhor avaliados / mais recentes.
- [ ] Avaliar com 1–5 estrelas → média/contagem atualizam no card.
- [ ] Atualizar status para _Assistindo_ e depois _Completo_.
- [ ] Excluir um anime.
- [ ] Ver o layout em mobile (≤ 520px) e tablet (≈ 820px).

---

## 🎥 Sugestão de roteiro do vídeo (≤ 4 min)

1. **Objetivo** (20–60s): problema e solução do _Anime Tracker_.
2. **Swagger** (60–90s): mostre `POST /cadastrar_anime`, `GET /buscar_animes`, `GET /buscar_anime/<id>`, `DELETE /deletar_anime/<id>` (ou `PUT`).
3. **Frontend** (60–90s): cadastro → lista → filtros → ordenar → estrelas → atualizar status → excluir.

---

## 🧹 Dicas

- Capas: pode usar uma URL de imagem pública ou deixar que o _placeholder_ apareça.
- Acessibilidade: botões de estrela têm `aria-label`.
- Caso a API não esteja rodando, a página mostra um aviso simples.

---

## 📜 Licença

Anna Betryz Lima de Araújo
