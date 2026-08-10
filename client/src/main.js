import "./style.css";

const API_URL = "https://google-keep-clone-m21x.onrender.com/api/notes";

const app = document.querySelector("#app");

app.innerHTML = `
  <header class="topbar">
    <div class="brand">
      <div class="keep-logo">💡</div>
      <span>Keep</span>
    </div>

    <div class="search-box">
      <span>🔍</span>
      <input id="searchInput" type="text" placeholder="Search">
    </div>

    <div class="top-actions">
      <button title="Refresh" id="refreshBtn">↻</button>
      <button title="Settings">⚙</button>
      <button title="Apps">▦</button>
      <div class="profile">K</div>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar">
      <button id="notesBtn" class="side-item active">💡 <span>Notes</span></button>
      <button id="remindersBtn" class="side-item">🔔 <span>Reminders</span></button>
      <button id="labelsBtn" class="side-item">✏️ <span>Edit labels</span></button>
      <button id="archiveBtn" class="side-item">📦 <span>Archive</span></button>
      <button id="trashBtn" class="side-item">🗑️ <span>Trash</span></button>
    </aside>

    <main class="content">
      <div class="note-form">
        <input id="titleInput" type="text" placeholder="Title">
        <textarea id="descriptionInput" placeholder="Take a note..."></textarea>

        <div class="form-actions">
          <button id="addNoteBtn">Add Note</button>
        </div>
      </div>

      <div id="notesContainer" class="notes-grid"></div>
    </main>
  </div>
`;

const titleInput = document.querySelector("#titleInput");
const descriptionInput = document.querySelector("#descriptionInput");
const addNoteBtn = document.querySelector("#addNoteBtn");
const notesContainer = document.querySelector("#notesContainer");
const searchInput = document.querySelector("#searchInput");
const refreshBtn = document.querySelector("#refreshBtn");

let currentSection = "notes";
async function loadNotes() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load notes");
    }

    const notes = await response.json();
    renderNotes(notes);
  } catch (error) {
    console.error("Load notes error:", error);
  }
}

function renderNotes(notes) {
  const search = searchInput.value.toLowerCase();

  const filteredNotes = notes.filter(note => {
    if (currentSection === "archive") return note.archived === true && note.trashed !== true;
    if (currentSection === "trash") return note.trashed === true;
    if (currentSection === "reminders") return note.reminder !== null && note.reminder !== undefined;
    return note.archived !== true && note.trashed !== true;
  }).filter(note =>
    (note.title || "").toLowerCase().includes(search) ||
    (note.description || "").toLowerCase().includes(search)
  );

  notesContainer.innerHTML = "";

  if (filteredNotes.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <div>📝</div>
        <p>No notes found</p>
      </div>
    `;
    return;
  }

  filteredNotes.forEach(note => {
    const card = document.createElement("div");
    card.className = "note-card";
card.style.backgroundColor = note.color || "#ffffff";

    card.innerHTML = `
      <h3>${escapeHtml(note.title || "Untitled")}</h3>
      <p>${escapeHtml(note.description || "")}</p>

      <div class="note-actions">
    <button class="color-btn" data-id="${note._id || note.id}">🎨 Color</button>
    <button class="edit-btn" data-id="${note._id || note.id}">✏️ Edit</button>
    <button class="pin-btn" data-id="${note._id || note.id}" data-pinned="${note.pinned}">${note.pinned ? "📌 Unpin" : "📌 Pin"}</button>
        <button class="delete-btn" data-id="${note._id || note.id}">
          🗑 Delete
        </button>
      </div>
    `;

    notesContainer.appendChild(card);
  });

document.querySelectorAll(".color-btn").forEach(button => {
  button.addEventListener("click", () => changeColor(button.dataset.id));
});
document.querySelectorAll(".edit-btn").forEach(button => {
  button.addEventListener("click", () => editNote(button.dataset.id));
});
document.querySelectorAll(".pin-btn").forEach(button => {
  button.onclick = async () => {
    await togglePin(button.dataset.id, button.dataset.pinned === "true");
  };
});
  document.querySelectorAll(".delete-btn").forEach(button => {
    button.addEventListener("click", () => deleteNote(button.dataset.id));
  });
}

async function addNote() {
  const title = document.querySelector("#titleInput").value.trim();
  const description = document.querySelector("#descriptionInput").value.trim();

  if (!title && !description) {
    alert("Please write a note first!");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title,
        description
      })
    });

    if (!response.ok) {
      throw new Error("Failed to add note: " + await response.text());
    }

    titleInput.value = "";
    descriptionInput.value = "";

    await loadNotes();
  } catch (error) {
    console.error("Add note error:", error);
    alert("Note add nahi ho raha.");
  }
}

async function changeColor(id) {
  const color = prompt("Choose color: yellow, blue, green, pink, purple");
  if (!color) return;

  const colors = {
    yellow: "#fff59d",
    blue: "#bbdefb",
    green: "#c8e6c9",
    pink: "#f8bbd0",
    purple: "#d1c4e9"
  };

  if (!colors[color.toLowerCase()]) {
    alert("Please enter: yellow, blue, green, pink, or purple");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ color: colors[color.toLowerCase()] })
    });

    if (!response.ok) throw new Error("Failed to change color");
    await loadNotes();
  } catch (error) {
    console.error("Color error:", error);
    alert("Color change nahi ho raha.");
  }
}
async function editNote(id) {
  const title = prompt("Enter new title:");
  if (title === null) return;

  const description = prompt("Enter new description:");
  if (description === null) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description })
    });

    if (!response.ok) throw new Error("Failed to edit note");

    await loadNotes();
  } catch (error) {
    console.error("Edit note error:", error);
    alert("Note edit nahi ho raha.");
  }
}
async function togglePin(id, pinned) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: !pinned })
    });

    if (!response.ok) {
      throw new Error("Failed to update pin");
    }

    await loadNotes();
  } catch (error) {
    console.error("Pin error:", error);
    alert("Pin update nahi ho raha.");
  }
}

async function deleteNote(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error("Failed to delete note");
    }

    await loadNotes();
  } catch (error) {
    console.error("Delete note error:", error);
    alert("Note delete nahi ho raha.");
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

addNoteBtn.addEventListener("click", addNote);
searchInput.addEventListener("input", loadNotes);
refreshBtn.addEventListener("click", loadNotes);

loadNotes();


document.querySelector("#notesBtn").addEventListener("click", () => {
  currentSection = "notes";
  document.querySelectorAll(".side-item").forEach(btn => btn.classList.remove("active"));
  document.querySelector("#notesBtn").classList.add("active");
  loadNotes();
});

document.querySelector("#archiveBtn").addEventListener("click", () => {
  currentSection = "archive";
  document.querySelectorAll(".side-item").forEach(btn => btn.classList.remove("active"));
  document.querySelector("#archiveBtn").classList.add("active");
  loadNotes();
});

document.querySelector("#trashBtn").addEventListener("click", () => {
  currentSection = "trash";
  document.querySelectorAll(".side-item").forEach(btn => btn.classList.remove("active"));
  document.querySelector("#trashBtn").classList.add("active");
  loadNotes();
});

document.querySelector("#remindersBtn").addEventListener("click", () => {
  currentSection = "reminders";
  document.querySelectorAll(".side-item").forEach(btn => btn.classList.remove("active"));
  document.querySelector("#remindersBtn").classList.add("active");
  loadNotes();
});

document.querySelector("#labelsBtn").addEventListener("click", () => {
  currentSection = "labels";
  document.querySelectorAll(".side-item").forEach(btn => btn.classList.remove("active"));
  document.querySelector("#labelsBtn").classList.add("active");
  loadNotes();
});
