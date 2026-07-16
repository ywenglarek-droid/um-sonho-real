const KEY = "um-sonho-real-data";

let data = JSON.parse(
  localStorage.getItem(KEY) ||
  '{"characters":[],"families":[],"timeline":[],"chapters":[],"places":[],"ideas":[],"playlist":[]}'
);

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);

function save() {
  localStorage.setItem(KEY, JSON.stringify(data));
  renderAll();
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m];
  });
}

/* NAVEGAÇÃO */

function nav(section) {

  $$(".section").forEach((element) => {
    element.classList.toggle(
      "active",
      element.id === section
    );
  });

  $$(".nav-btn").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.section === section
    );
  });

  const names = {
    dashboard: "Painel da Escritora",
    characters: "Personagens",
    families: "Famílias",
    timeline: "Linha do tempo",
    chapters: "Capítulos",
    places: "Lugares",
    ideas: "Ideias e anotações",
    playlist: "Playlist"
  };

  document.querySelector(".topbar h1").textContent =
    names[section] || "Painel da Escritora";
}

$$(".nav-btn").forEach((button) => {

  button.onclick = () => {
    nav(button.dataset.section);
  };

});

$$("[data-go]").forEach((button) => {

  button.onclick = () => {
    nav(button.dataset.go);
  };

});

/* MODAL */

function openModal(title, fields, onSave) {

  $("#modalTitle").textContent = title;

  $("#modalForm").innerHTML = `

    <div class="form-grid">

      ${fields.map((field) => {

        if (field.type === "textarea") {

          return `
            <div class="field ${field.full ? "full" : ""}">
              <label>${field.label}</label>

              <textarea
                name="${field.name}"
                placeholder="${field.placeholder || ""}"
              >${escapeHTML(field.value || "")}</textarea>

            </div>
          `;

        }

        return `
          <div class="field ${field.full ? "full" : ""}">

            <label>${field.label}</label>

            <input
              type="${field.type || "text"}"
              name="${field.name}"
              value="${escapeHTML(field.value || "")}"
              placeholder="${field.placeholder || ""}"
            >

          </div>
        `;

      }).join("")}

    </div>

    <button class="primary-btn form-submit">
      Salvar
    </button>

  `;

  $("#modal").classList.remove("hidden");

  $("#modalForm").onsubmit = (event) => {

    event.preventDefault();

    const formData = new FormData(
      event.target
    );

    onSave(
      Object.fromEntries(formData)
    );

    $("#modal").classList.add("hidden");

    save();

  };

}

$("#closeModal").onclick = () => {

  $("#modal").classList.add("hidden");

};

/* PERSONAGENS */

function characterForm(item = {}, index = -1) {

  openModal(

    index >= 0
      ? "Editar personagem"
      : "Novo personagem",

    [

      {
        name: "name",
        label: "Nome completo",
        placeholder: "Ex.: Isabella",
        value: item.name
      },

      {
        name: "surname",
        label: "Sobrenome / família",
        placeholder: "Ex.: Wenglarek",
        value: item.surname
      },

      {
        name: "age",
        label: "Idade",
        type: "number",
        value: item.age
      },

      {
        name: "role",
        label: "Papel na história",
        placeholder: "Protagonista, amigo...",
        value: item.role
      },

      {
        name: "image",
        label: "Link da imagem",
        placeholder: "Cole o link de uma imagem",
        value: item.image,
        full: true
      },

      {
        name: "description",
        label: "Descrição e personalidade",
        type: "textarea",
        value: item.description,
        full: true
      },

      {
        name: "relations",
        label: "Relações familiares",
        placeholder: "Filha de..., irmã de...",
        value: item.relations,
        full: true
      },

      {
        name: "secrets",
        label: "Segredos",
        type: "textarea",
        value: item.secrets,
        full: true
      }

    ],

    (value) => {

      if (index >= 0) {

        data.characters[index] = value;

      } else {

        data.characters.push(value);

      }

    }

  );

}

$("#addCharacter").onclick = () => {

  characterForm();

};

function renderCharacters() {

  const element = $("#charactersGrid");

  if (data.characters.length === 0) {

    element.innerHTML = `
      <div class="empty">
        Ainda não há personagens.
        Clique em "Novo personagem".
      </div>
    `;

    return;

  }

  element.innerHTML = data.characters.map(
    (character, index) => `

      <article class="item-card">

        <div class="item-image">

          ${character.image
            ? `<img
                src="${escapeHTML(character.image)}"
                style="width:100%;height:100%;object-fit:cover"
              >`
            : "♙"
          }

        </div>

        <div class="item-content">

          <h3>
            ${escapeHTML(character.name || "Sem nome")}
          </h3>

          <span class="tag">
            ${escapeHTML(character.surname || "Sem família")}
          </span>

          <span class="tag">
            ${escapeHTML(character.role || "Personagem")}
          </span>

          <p>
            ${escapeHTML(
              character.description ||
              "Sem descrição ainda."
            )}
          </p>

          <div class="actions">

            <button
              class="action-btn"
              onclick="characterForm(data.characters[${index}], ${index})"
            >
              Editar
            </button>

            <button
              class="action-btn delete"
              onclick="removeItem('characters', ${index})"
            >
              Excluir
            </button>

          </div>

        </div>

      </article>

    `
  ).join("");

}

/* FAMÍLIAS */

function renderFamilies() {

  const element = $("#familiesGrid");

  const families = {};

  data.characters.forEach((character) => {

    if (character.surname) {

      if (!families[character.surname]) {

        families[character.surname] = [];

      }

      families[character.surname].push(
        character.name
      );

    }

  });

  const names = Object.keys(families);

  if (names.length === 0) {

    element.innerHTML = `
      <div class="empty">
        Adicione personagens com sobrenomes
        para criar famílias automaticamente.
      </div>
    `;

    return;

  }

  element.innerHTML = names.map(
    (family) => `

      <article class="card family-card">

        <h3>
          Família ${escapeHTML(family)}
        </h3>

        <div class="family-members">

          ${families[family].map(
            (member) => `

              <span class="member">
                ♙ ${escapeHTML(member)}
              </span>

            `
          ).join("")}

        </div>

      </article>

    `
  ).join("");

}

/* LINHA DO TEMPO */

function timelineForm(item = {}, index = -1) {

  openModal(

    index >= 0
      ? "Editar acontecimento"
      : "Novo acontecimento",

    [

      {
        name: "date",
        label: "Data ou período",
        placeholder: "Ex.: 2026",
        value: item.date
      },

      {
        name: "title",
        label: "Título",
        placeholder: "Ex.: Isabella chega à Inglaterra",
        value: item.title
      },

      {
        name: "place",
        label: "Local",
        placeholder: "Ex.: Inglaterra",
        value: item.place
      },

      {
        name: "chapter",
        label: "Capítulo",
        placeholder: "Ex.: Capítulo 1",
        value: item.chapter
      },

      {
        name: "description",
        label: "O que acontece?",
        type: "textarea",
        value: item.description,
        full: true
      },

      {
        name: "characters",
        label: "Personagens envolvidos",
        placeholder: "Isabella, Filiphi...",
        value: item.characters,
        full: true
      }

    ],

    (value) => {

      if (index >= 0) {

        data.timeline[index] = value;

      } else {

        data.timeline.push(value);

      }

    }

  );

}

$("#addTimeline").onclick = () => {

  timelineForm();

};

function renderTimeline() {

  const element = $("#timelineList");

  if (data.timeline.length === 0) {

    element.innerHTML = `
      <div class="empty">
        Sua linha do tempo está esperando
        o primeiro acontecimento.
      </div>
    `;

    return;

  }

  element.innerHTML = data.timeline.map(
    (event, index) => `

      <article class="timeline-item">

        <div class="timeline-date">
          ${escapeHTML(event.date || "Sem data")}
        </div>

        <h3>
          ${escapeHTML(event.title || "Sem título")}
        </h3>

        <p>
          ${escapeHTML(event.description || "")}
        </p>

        <span class="tag">
          📍 ${escapeHTML(event.place || "Local não definido")}
        </span>

        <span class="tag">
          📖 ${escapeHTML(event.chapter || "Sem capítulo")}
        </span>

        <div class="actions">

          <button
            class="action-btn"
            onclick="timelineForm(data.timeline[${index}], ${index})"
          >
            Editar
          </button>

          <button
            class="action-btn delete"
            onclick="removeItem('timeline', ${index})"
          >
            Excluir
          </button>

        </div>

      </article>

    `
  ).join("");

}

/* EXCLUIR */

function removeItem(type, index) {

  if (
    confirm("Tem certeza que deseja excluir?")
  ) {

    data[type].splice(index, 1);

    save();

  }

}

/* CONTADORES */

function updateStats() {

  $("#statCharacters").textContent =
    data.characters.length;

  $("#statChapters").textContent =
    data.chapters.length;

  $("#statTimeline").textContent =
    data.timeline.length;

  $("#statIdeas").textContent =
    data.ideas.length;

}

/* RENDERIZAÇÃO */

function renderAll() {

  renderCharacters();

  renderFamilies();

  renderTimeline();

  updateStats();

}

renderAll();
