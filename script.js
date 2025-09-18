const API = "http://127.0.0.1:5000";

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

const listEl = $("#list");
const emptyEl = $("#empty");
const createForm = $("#formCreate");
const createMsg = $("#createMsg");
const searchEl = $("#search");
const statusFilterEl = $("#statusFilter");
const sortEl = $("#sort");
$("#btnReload").addEventListener("click", load);

const editModal = $("#editModal");
const formEdit = $("#formEdit");
const editMsg = $("#editMsg");
const btnCloseEdit = $("#btnCloseEdit");
let currentEditId = null;

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(createForm);
  const payload = {
    title: fd.get("title"),
    genre: fd.get("genre"),
    episodes: fd.get("episodes") ? Number(fd.get("episodes")) : null,
    status: fd.get("status"),
    release_date: fd.get("release_date") || null,
    cover_url: fd.get("cover_url") || null,
  };
  createMsg.textContent = "Salvando...";
  try {
    const res = await fetch(`${API}/cadastrar_anime`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Falha ao cadastrar");
    createForm.reset();
    createMsg.textContent = "✔ cadastrado!";
    load();
  } catch (err) {
    console.error(err);
    createMsg.textContent = "Erro ao cadastrar";
  } finally {
    setTimeout(() => (createMsg.textContent = ""), 1200);
  }
});

searchEl.addEventListener("input", debounce(load, 300));
statusFilterEl.addEventListener("change", load);
sortEl.addEventListener("change", load);

async function load() {
  const params = new URLSearchParams();
  if (searchEl.value.trim()) params.set("q", searchEl.value.trim());
  if (statusFilterEl.value) params.set("status", statusFilterEl.value);
  if (sortEl.value) params.set("sort", sortEl.value);

  listEl.innerHTML = "";
  emptyEl.hidden = true;

  try {
    const res = await fetch(`${API}/buscar_animes?${params.toString()}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      emptyEl.hidden = false;
      return;
    }
    data.forEach(renderCard);
  } catch (err) {
    console.error(err);
    emptyEl.hidden = false;
    emptyEl.textContent =
      "Não foi possível carregar. Verifique se a API está rodando.";
  }
}

function renderCard(anime) {
  const card = document.createElement("article");
  card.className = "card anime-card";

  const img = document.createElement("img");
  img.className = "cover";
  img.alt = anime.title;
  img.src =
    anime.cover_url ||
    "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop";
  card.appendChild(img);

  const h3 = document.createElement("h3");
  h3.textContent = anime.title;
  h3.style.margin = "6px 0 0 0";
  card.appendChild(h3);

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `
    <span class="badge">${anime.genre || "Sem gênero"}</span>
    <span class="badge">EP: ${anime.episodes ?? "-"}</span>
    <span class="badge">${anime.status}</span>
    ${
      anime.release_date
        ? `<span class="badge">Lanç: ${anime.release_date}</span>`
        : ""
    }
  `;
  card.appendChild(meta);

  // linha de avaliação
  const rating = document.createElement("div");
  rating.className = "rating-line";
  const avg = document.createElement("span");
  avg.className = "rating-avg";
  avg.textContent = anime.rating_avg
    ? `★ ${anime.rating_avg}/5`
    : "Sem avaliações";
  const count = document.createElement("span");
  count.className = "rating-count";
  count.textContent = anime.rating_count ? `(${anime.rating_count})` : "";

  rating.appendChild(avg);
  rating.appendChild(count);
  rating.appendChild(
    buildStars(anime.id, (newAvg, newCount) => {
      avg.textContent = `★ ${newAvg}/5`;
      count.textContent = `(${newCount})`;
    })
  );
  card.appendChild(rating);

  const actions = document.createElement("div");
  actions.className = "actions";

  const btnEdit = document.createElement("button");
  btnEdit.className = "btn";
  btnEdit.textContent = "Editar";
  btnEdit.onclick = () => openEditModal(anime);

  const btnWatching = document.createElement("button");
  btnWatching.className = "btn ok";
  btnWatching.textContent = "Marcar Assistindo";
  btnWatching.onclick = () => updateStatus(anime.id, "Assistindo");

  const btnDone = document.createElement("button");
  btnDone.className = "btn ok";
  btnDone.textContent = "Marcar Completo";
  btnDone.onclick = () => updateStatus(anime.id, "Completo");

  const btnDel = document.createElement("button");
  btnDel.className = "btn del";
  btnDel.textContent = "Excluir";
  btnDel.onclick = () => delAnime(anime.id);

  actions.append(btnEdit, btnWatching, btnDone, btnDel);
  card.appendChild(actions);

  listEl.appendChild(card);
}

function buildStars(animeId, onRated) {
  const wrap = document.createElement("div");
  wrap.className = "stars";
  for (let i = 1; i <= 5; i++) {
    const s = document.createElement("button");
    s.type = "button";
    s.className = "star-input";
    s.setAttribute("aria-label", `Avaliar com ${i} estrela${i > 1 ? "s" : ""}`);
    s.dataset.value = String(i);
    s.onclick = async () => {
      $$(".star-input", wrap).forEach(
        (st) => (st.dataset.active = (+st.dataset.value <= i).toString())
      );
      try {
        const res = await fetch(`${API}/avaliar_anime/${animeId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stars: i }),
        });
        if (!res.ok) throw new Error("Falha ao avaliar");
        const updated = await res.json();
        onRated(updated.rating_avg ?? 0, updated.rating_count ?? 0);
      } catch (err) {
        console.error(err);
        alert("Não foi possível enviar a avaliação.");
      }
    };
    wrap.appendChild(s);
  }
  return wrap;
}

async function updateStatus(id, status) {
  try {
    const res = await fetch(`${API}/atualizar_anime/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Falha ao atualizar");
    load();
  } catch (err) {
    console.error(err);
    alert("Não foi possível atualizar o status.");
  }
}

async function delAnime(id) {
  if (!confirm("Tem certeza que deseja excluir?")) return;
  try {
    const res = await fetch(`${API}/deletar_anime/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Falha ao excluir");
    load();
  } catch (err) {
    console.error(err);
    alert("Não foi possível excluir.");
  }
}

function openEditModal(anime) {
  currentEditId = anime.id;

  formEdit.elements["title"].value = anime.title ?? "";
  formEdit.elements["genre"].value = anime.genre ?? "";
  formEdit.elements["episodes"].value = anime.episodes ?? "";
  formEdit.elements["status"].value = anime.status ?? "Planejo Assistir";
  formEdit.elements["release_date"].value = anime.release_date ?? "";
  formEdit.elements["cover_url"].value = anime.cover_url ?? "";

  editMsg.textContent = "";
  if (typeof editModal.showModal === "function") {
    editModal.showModal();
  } else {
    editModal.removeAttribute("hidden");
  }
}

btnCloseEdit.addEventListener("click", closeEditModal);

function closeEditModal() {
  currentEditId = null;
  if (typeof editModal.close === "function") {
    editModal.close();
  } else {
    editModal.setAttribute("hidden", "");
  }
}

formEdit.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentEditId) return;

  const fd = new FormData(formEdit);
  const payload = {
    title: (fd.get("title") || "").toString(),
    genre: (fd.get("genre") || "").toString(),
    episodes: fd.get("episodes") ? Number(fd.get("episodes")) : null,
    status: (fd.get("status") || "Planejo Assistir").toString(),
    release_date: fd.get("release_date") || null,
    cover_url: fd.get("cover_url") || null,
  };

  editMsg.textContent = "Salvando...";
  try {
    const res = await fetch(`${API}/atualizar_anime/${currentEditId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Falha ao atualizar");
    editMsg.textContent = "✔ salvo!";
    closeEditModal();
    load();
  } catch (err) {
    console.error(err);
    editMsg.textContent = "Erro ao salvar";
  } finally {
    setTimeout(() => (editMsg.textContent = ""), 1200);
  }
});

function debounce(fn, ms = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

load();
