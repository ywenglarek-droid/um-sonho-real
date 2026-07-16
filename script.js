const STORAGE_KEY = "um-sonho-real-v3";

let data = JSON.parse(
  localStorage.getItem(STORAGE_KEY)
) || {
  characters: [],
  timelines: [],
  chapters: [],
  places: [],
  ideas: [],
  playlist: []
};

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);

function save() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  renderAll();
}

function escapeHTML(value = "") {

  return String(value).replace(
    /[&<>"']/g,
    function (character) {

      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character];

    }
  );

}

function showSection(section) {

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
    timelines: "Linhas do tempo",
    chapters: "Capítulos",
    places: "Lugares",
    ideas: "Ideias e anotações",
    playlist: "Playlist",
    settings: "Personalização"

  };

  $("#pageTitle").textContent =
    names[section] || "Painel da Escritora";

}

$$(".nav-btn").forEach((button) => {

  button.addEventListener("click", () => {

    showSection(
      button.dataset.section
    );

  });

});

$$("[data-go]").forEach((button) => {

  button.addEventListener("click", () => {

    showSection(
      button.dataset.go
    );

  });

});

function openModal(title, fields, callback) {

  $("#modalTitle").textContent = title;

  $("#modalForm").innerHTML = `

    <div class="form-grid">

      ${fields.map((field) => {

        if (field.type === "textarea") {

          return `

            <div class="field ${field.full ? "full" : ""}">

              <label>
                ${field.label}
              </label>

              <textarea
                name="${field.name}"
                placeholder="${field.placeholder || ""}"
              >${escapeHTML(field.value || "")}</textarea>

            </div>

          `;

        }

        if (field.type === "select") {

          return `

            <div class="field ${field.full ? "full" : ""}">

              <label>
                ${field.label}
              </label>

              <select name="${field.name}">

                ${field.options.map((option) => `

                  <option
                    value="${escapeHTML(option)}"
                    ${option === field.value ? "selected" : ""}
                  >
                    ${escapeHTML(option)}
                  </option>

                `).join("")}

              </select>

            </div>

          `;

        }

        return `

          <div class="field ${field.full ? "full" : ""}">

            <label>
              ${field.label}
            </label>

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

  $("#modalForm").onsubmit = function(event) {

    event.preventDefault();

    const formData = new FormData(
      event.target
    );

    callback(
      Object.fromEntries(formData)
    );

    $("#modal").classList.add("hidden");

    save();

  };

}

$("#closeModal").addEventListener(
  "click",
  () => {

    $("#modal").classList.add("hidden");

  }
);

$("#modal").addEventListener(
  "click",
  (event) => {

    if (
      event.target === $("#modal")
    ) {

      $("#modal").classList.add("hidden");

    }

  }
);

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
        placeholder: "Cole o link da imagem",
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

$("#addCharacter").addEventListener(
  "click",
  () => characterForm()
);

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

          ${
            character.image

              ? `<img
                  src="${escapeHTML(character.image)}"
                  style="width:100%;height:100%;object-fit:cover"
                >`

              : "👤"

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

    const surname =
      character.surname?.trim();

    if (!surname) return;

    if (!families[surname]) {

      families[surname] = [];

    }

    families[surname].push(
      character.name
    );

  });

  const familyNames =
    Object.keys(families);

  if (familyNames.length === 0) {

    element.innerHTML = `

      <div class="empty">

        Adicione personagens com sobrenomes
        para criar famílias automaticamente.

      </div>

    `;

    return;

  }

  element.innerHTML = familyNames.map(
    (family) => `

      <article class="card family-card">

        <h3>
          Família ${escapeHTML(family)}
        </h3>

        <div class="family-members">

          ${families[family].map(
            (member) => `

              <span class="member">
                👤 ${escapeHTML(member)}
              </span>

            `
          ).join("")}

        </div>

      </article>

    `
  ).join("");

}

/* LINHAS DO TEMPO */

function timelineForm(item = {}, timelineIndex = -1) {

  openModal(

    timelineIndex >= 0
      ? "Editar linha do tempo"
      : "Nova linha do tempo",

    [

      {
        name: "name",
        label: "Nome da linha do tempo",
        placeholder: "Ex.: Vida da Isabella",
        value: item.name,
        full: true
      },

      {
        name: "description",
        label: "Descrição",
        type: "textarea",
        placeholder: "Sobre o que é esta linha do tempo?",
        value: item.description,
        full: true
      }

    ],

    (value) => {

      if (timelineIndex >= 0) {

        data.timelines[timelineIndex] = {
          ...data.timelines[timelineIndex],
          ...value
        };

      } else {

        data.timelines.push({

          id: Date.now(),

          name: value.name,

          description: value.description,

          events: []

        });

      }

    }

  );

}

function eventForm(
  timelineIndex,
  event = {},
  eventIndex = -1
) {

  openModal(

    eventIndex >= 0
      ? "Editar acontecimento"
      : "Novo acontecimento",

    [

      {
        name: "date",
        label: "Data",
        type: "date",
        value: event.date
      },

      {
        name: "title",
        label: "Título",
        placeholder: "Ex.: Isabella nasce",
        value: event.title
      },

      {
        name: "place",
        label: "Local",
        placeholder: "Ex.: Brasil",
        value: event.place
      },

      {
        name: "chapter",
        label: "Capítulo",
        placeholder: "Ex.: Capítulo 1",
        value: event.chapter
      },

      {
        name: "description",
        label: "O que acontece?",
        type: "textarea",
        value: event.description,
        full: true
      },

      {
        name: "characters",
        label: "Personagens envolvidos",
        placeholder: "Isabella, Filiphi...",
        value: event.characters,
        full: true
      }

    ],

    (value) => {

      const timeline =
        data.timelines[timelineIndex];

      if (!timeline.events) {

        timeline.events = [];

      }

      if (eventIndex >= 0) {

        timeline.events[eventIndex] = value;

      } else {

        timeline.events.push(value);

      }

      sortEvents(timeline);

    }

  );

}

function sortEvents(timeline) {

  timeline.events.sort(
    (a, b) => {

      const dateA =
        new Date(a.date || "9999-12-31");

      const dateB =
        new Date(b.date || "9999-12-31");

      return dateA - dateB;

    }
  );

}

function renderTimelines() {

  const element =
    $("#timelinesGrid");

  if (data.timelines.length === 0) {

    element.innerHTML = `

      <div class="empty">

        Você ainda não criou nenhuma
        linha do tempo.

      </div>

    `;

    return;

  }

  element.innerHTML =
    data.timelines.map(
      (timeline, timelineIndex) => {

        const events =
          timeline.events || [];

        sortEvents(timeline);

        return `

          <article class="timeline-group">

            <div class="timeline-group-header">

              <div>

                <h3>
                  ${escapeHTML(
                    timeline.name ||
                    "Linha do tempo sem nome"
                  )}
                </h3>

                <p>
                  ${escapeHTML(
                    timeline.description || ""
                  )}
                </p>

              </div>

              <div class="actions">

                <button
                  class="action-btn"
                  onclick="eventForm(${timelineIndex})"
                >
                  ＋ Acontecimento
                </button>

                <button
                  class="action-btn"
                  onclick="timelineForm(data.timelines[${timelineIndex}], ${timelineIndex})"
                >
                  Editar
                </button>

                <button
                  class="action-btn delete"
                  onclick="removeItem('timelines', ${timelineIndex})"
                >
                  Excluir
                </button>

              </div>

            </div>

            ${
              events.length === 0

                ? `

                  <div class="empty">
                    Esta linha do tempo ainda está vazia.
                  </div>

                  `

                : `

                  <div class="timeline">

                    ${events.map(
                      (event, eventIndex) => `

                        <div class="timeline-item">

                          <div class="timeline-date">

                            ${
                              event.date
                                ? new Date(
                                    event.date +
                                    "T00:00:00"
                                  ).toLocaleDateString(
                                    "pt-BR"
                                  )
                                : "Sem data"
                            }

                          </div>

                          <h4>
                            ${escapeHTML(
                              event.title ||
                              "Sem título"
                            )}
                          </h4>

                          <p>
                            ${escapeHTML(
                              event.description ||
                              ""
                            )}
                          </p>

                          ${
                            event.place
                              ? `<span class="tag">
                                  📍 ${escapeHTML(event.place)}
                                </span>`
                              : ""
                          }

                          ${
                            event.chapter
                              ? `<span class="tag">
                                  📖 ${escapeHTML(event.chapter)}
                                </span>`
                              : ""
                          }

                          ${
                            event.characters
                              ? `<span class="tag">
                                  👥 ${escapeHTML(event.characters)}
                                </span>`
                              : ""
                          }

                          <div class="actions">

                            <button
                              class="action-btn"
                              onclick="eventForm(${timelineIndex}, data.timelines[${timelineIndex}].events[${eventIndex}], ${eventIndex})"
                            >
                              Editar
                            </button>

                            <button
                              class="action-btn delete"
                              onclick="removeEvent(${timelineIndex}, ${eventIndex})"
                            >
                              Excluir
                            </button>

                          </div>

                        </div>

                      `
                    ).join("")}

                  </div>

                  `

            }

          </article>

        `;

      }
    ).join("");

}

function removeEvent(
  timelineIndex,
  eventIndex
) {

  if (
    confirm(
      "Deseja excluir este acontecimento?"
    )
  ) {

    data.timelines[
      timelineIndex
    ].events.splice(
      eventIndex,
      1
    );

    save();

  }

}

$("#addTimeline").addEventListener(
  "click",
  () => timelineForm()
);

/* CAPÍTULOS */

function chapterForm(
  item = {},
  index = -1
) {

  openModal(

    index >= 0
      ? "Editar capítulo"
      : "Novo capítulo",

    [

      {
        name: "number",
        label: "Número",
        type: "number",
        value: item.number
      },

      {
        name: "title",
        label: "Título",
        placeholder: "Ex.: O começo",
        value: item.title
      },

      {
        name: "status",
        label: "Status",
        type: "select",
        options: [
          "Planejado",
          "Em andamento",
          "Concluído"
        ],
        value: item.status || "Planejado"
      },

      {
        name: "summary",
        label: "Resumo",
        type: "textarea",
        value: item.summary,
        full: true
      }

    ],

    (value) => {

      if (index >= 0) {

        data.chapters[index] = value;

      } else {

        data.chapters.push(value);

      }

    }

  );

}

$("#addChapter").addEventListener(
  "click",
  () => chapterForm()
);

function renderChapters() {

  const element =
    $("#chaptersGrid");

  if (data.chapters.length === 0) {

    element.innerHTML = `

      <div class="empty">
        Nenhum capítulo adicionado.
      </div>

    `;

    return;

  }

  element.innerHTML =
    data.chapters.map(
      (chapter, index) => `

        <article class="card">

          <span class="tag">
            Capítulo ${escapeHTML(
              chapter.number || ""
            )}
          </span>

          <h3>
            ${escapeHTML(
              chapter.title ||
              "Sem título"
            )}
          </h3>

          <p>
            ${escapeHTML(
              chapter.summary ||
              "Sem resumo."
            )}
          </p>

          <span class="tag">
            ${escapeHTML(
              chapter.status ||
              "Planejado"
            )}
          </span>

          <div class="actions">

            <button
              class="action-btn"
              onclick="chapterForm(data.chapters[${index}], ${index})"
            >
              Editar
            </button>

            <button
              class="action-btn delete"
              onclick="removeItem('chapters', ${index})"
            >
              Excluir
            </button>

          </div>

        </article>

      `
    ).join("");

}

/* LUGARES */

function placeForm(
  item = {},
  index = -1
) {

  openModal(

    index >= 0
      ? "Editar lugar"
      : "Novo lugar",

    [

      {
        name: "name",
        label: "Nome do lugar",
        placeholder: "Ex.: Escola",
        value: item.name
      },

      {
        name: "country",
        label: "País / região",
        placeholder: "Ex.: Inglaterra",
        value: item.country
      },

      {
        name: "description",
        label: "Descrição",
        type: "textarea",
        value: item.description,
        full: true
      }

    ],

    (value) => {

      if (index >= 0) {

        data.places[index] = value;

      } else {

        data.places.push(value);

      }

    }

  );

}

$("#addPlace").addEventListener(
  "click",
  () => placeForm()
);

function renderPlaces() {

  const element =
    $("#placesGrid");

  if (data.places.length === 0) {

    element.innerHTML = `

      <div class="empty">
        Nenhum lugar adicionado.
      </div>

    `;

    return;

  }

  element.innerHTML =
    data.places.map(
      (place, index) => `

        <article class="card">

          <h3>
            🗺️ ${escapeHTML(
              place.name ||
              "Sem nome"
            )}
          </h3>

          <span class="tag">
            ${escapeHTML(
              place.country ||
              "Sem região"
            )}
          </span>

          <p>
            ${escapeHTML(
              place.description ||
              "Sem descrição."
            )}
          </p>

          <div class="actions">

            <button
              class="action-btn"
              onclick="placeForm(data.places[${index}], ${index})"
            >
              Editar
            </button>

            <button
              class="action-btn delete"
              onclick="removeItem('places', ${index})"
            >
              Excluir
            </button>

          </div>

        </article>

      `
    ).join("");

}

/* IDEIAS */

function ideaForm(
  item = {},
  index = -1
) {

  openModal(

    index >= 0
      ? "Editar ideia"
      : "Nova ideia",

    [

      {
        name: "title",
        label: "Título",
        placeholder: "Ex.: Novo mistério",
        value: item.title
      },

      {
        name: "category",
        label: "Categoria",
        placeholder: "Personagem, plot, romance...",
        value: item.category
      },

      {
        name: "text",
        label: "Sua ideia",
        type: "textarea",
        value: item.text,
        full: true
      }

    ],

    (value) => {

      if (index >= 0) {

        data.ideas[index] = value;

      } else {

        data.ideas.push(value);

      }

    }

  );

}

$("#addIdea").addEventListener(
  "click",
  () => ideaForm()
);

function renderIdeas() {

  const element =
    $("#ideasGrid");

  if (data.ideas.length === 0) {

    element.innerHTML = `

      <div class="empty">
        Nenhuma ideia adicionada.
      </div>

    `;

    return;

  }

  element.innerHTML =
    data.ideas.map(
      (idea, index) => `

        <article class="card">

          <span class="tag">
            ${escapeHTML(
              idea.category ||
              "Ideia"
            )}
          </span>

          <h3>
            ${escapeHTML(
              idea.title ||
              "Sem título"
            )}
          </h3>

          <p>
            ${escapeHTML(
              idea.text ||
              ""
            )}
          </p>

          <div class="actions">

            <button
              class="action-btn"
              onclick="ideaForm(data.ideas[${index}], ${index})"
            >
              Editar
            </button>

            <button
              class="action-btn delete"
              onclick="removeItem('ideas', ${index})"
            >
              Excluir
            </button>

          </div>

        </article>

      `
    ).join("");

}

/* PLAYLIST */

function songForm(
  item = {},
  index = -1
) {

  openModal(

    index >= 0
      ? "Editar música"
      : "Nova música",

    [

      {
        name: "title",
        label: "Nome da música",
        placeholder: "Ex.: Nome da música",
        value: item.title
      },

      {
        name: "artist",
        label: "Artista",
        placeholder: "Ex.: Artista",
        value: item.artist
      },

      {
        name: "link",
        label: "Link",
        placeholder: "YouTube, Spotify...",
        value: item.link,
        full: true
      },

      {
        name: "moment",
        label: "Para qual momento?",
        type: "textarea",
        value: item.moment,
        full: true
      }

    ],

    (value) => {

      if (index >= 0) {

        data.playlist[index] = value;

      } else {

        data.playlist.push(value);

      }

    }

  );

}

$("#addSong").addEventListener(
  "click",
  () => songForm()
);

function renderPlaylist() {

  const element =
    $("#playlistGrid");

  if (data.playlist.length === 0) {

    element.innerHTML = `

      <div class="empty">
        Nenhuma música adicionada.
      </div>

    `;

    return;

  }

  element.innerHTML =
    data.playlist.map(
      (song, index) => `

        <article class="card">

          <h3>
            🎵 ${escapeHTML(
              song.title ||
              "Sem título"
            )}
          </h3>

          <span class="tag">
            ${escapeHTML(
              song.artist ||
              "Artista desconhecido"
            )}
          </span>

          <p>
            ${escapeHTML(
              song.moment ||
              "Sem descrição."
            )}
          </p>

          ${
            song.link
              ? `<a
                  href="${escapeHTML(song.link)}"
                  target="_blank"
                  class="primary-btn"
                >
                  Abrir música
                </a>`
              : ""
          }

          <div class="actions">

            <button
              class="action-btn"
              onclick="songForm(data.playlist[${index}], ${index})"
            >
              Editar
            </button>

            <button
              class="action-btn delete"
              onclick="removeItem('playlist', ${index})"
            >
              Excluir
            </button>

          </div>

        </article>

      `
    ).join("");

}

/* EXCLUIR */

function removeItem(
  type,
  index
) {

  if (
    confirm(
      "Tem certeza que deseja excluir?"
    )
  ) {

    data[type].splice(
      index,
      1
    );

    save();

  }

}

/* CONTADORES */

function updateStats() {

  $("#statCharacters").textContent =
    data.characters.length;

  $("#statChapters").textContent =
    data.chapters.length;

  $("#statTimelines").textContent =
    data.timelines.length;

  $("#statIdeas").textContent =
    data.ideas.length;

}

/* PALETAS */

$$(".palette").forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        const palette =
          button.dataset.palette;

        if (palette === "pink") {

          document.documentElement.style.setProperty(
            "--primary",
            "#d46a91"
          );

          document.documentElement.style.setProperty(
            "--primary-dark",
            "#8e3f61"
          );

          document.documentElement.style.setProperty(
            "--accent",
            "#f2a9c0"
          );

        }

        if (palette === "darkpink") {

          document.documentElement.style.setProperty(
            "--primary",
            "#9e4266"
          );

          document.documentElement.style.setProperty(
            "--primary-dark",
            "#4e2438"
          );

          document.documentElement.style.setProperty(
            "--accent",
            "#d47b9b"
          );

        }

        if (palette === "softpink") {

          document.documentElement.style.setProperty(
            "--primary",
            "#c985a0"
          );

          document.documentElement.style.setProperty(
            "--primary-dark",
            "#986078"
          );

          document.documentElement.style.setProperty(
            "--accent",
            "#e9b7c9"
          );

        }

      }
    );

  }
);

/* BOTÃO ADICIONAR */

$("#quickAdd").addEventListener(
  "click",
  () => {

    const current =
      document.querySelector(
        ".section.active"
      )?.id;

    if (current === "characters") {
      characterForm();
    }

    else if (current === "timelines") {
      timelineForm();
    }

    else if (current === "chapters") {
      chapterForm();
    }

    else if (current === "places") {
      placeForm();
    }

    else if (current === "ideas") {
      ideaForm();
    }

    else if (current === "playlist") {
      songForm();
    }

    else {
      showSection("characters");
      characterForm();
    }

  }
);

/* RENDERIZAÇÃO */

function renderAll() {

  renderCharacters();

  renderFamilies();

  renderTimelines();

  renderChapters();

  renderPlaces();

  renderIdeas();

  renderPlaylist();

  updateStats();

}

renderAll();
