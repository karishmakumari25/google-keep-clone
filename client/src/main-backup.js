import "./style.css";
const API_URL = "http:" + "//localhost:5000" + "/api/notes";

const app = document.querySelector("#app");

const form = document.createElement("div");
form.className = "note-form";

const titleInput = document.createElement("input");
titleInput.id = "titleInput";
titleInput.type = "text";
titleInput.placeholder = "Title";

const descriptionInput = document.createElement("textarea");
descriptionInput.id = "descriptionInput";
descriptionInput.placeholder = "Take a note...";

const addNoteBtn = document.createElement("button");
addNoteBtn.id = "addNoteBtn";
addNoteBtn.textContent = "Add Note";

const notesContainer = document.createElement("div");
notesContainer.id = "notesContainer";

form.appendChild(titleInput);
form.appendChild(descriptionInput);
form.appendChild(addNoteBtn);

app.appendChild(form);
app.appendChild(notesContainer);

async function loadNotes() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Failed to load notes");
    }

    const notes = await response.json();

    notesContainer.innerHTML = "";

    notes.forEach(function(note) {
      const noteElement = document.createElement("div");
      noteElement.className = "note";

      const title = document.createElement("h3");
      title.textContent = note.title || "";

      const description = document.createElement("p");
      description.textContent = note.description || "";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";

      deleteBtn.addEventListener("click", function() {
        deleteNote(note._id);
      });

      noteElement.appendChild(title);
      noteElement.appendChild(description);
      noteElement.appendChild(deleteBtn);

      notesContainer.appendChild(noteElement);
    });
  } catch (error) {
    console.error("Notes load error:", error);
  }
}

async function addNote() {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

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
        title: title,
        description: description
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

async function deleteNote(id) {
  try {
    const response = await fetch(API_URL + "/" + id, {
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

addNoteBtn.addEventListener("click", addNote);

loadNotes();
