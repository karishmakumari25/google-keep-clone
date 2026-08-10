const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// CREATE note
router.post("/", async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ all notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE note
router.put("/:id", async (req, res) => {
  try {
    const update = {};

    if (req.body.pinned !== undefined) update.pinned = Boolean(req.body.pinned);
    if (req.body.archived !== undefined) update.archived = Boolean(req.body.archived);
    if (req.body.trashed !== undefined) update.trashed = Boolean(req.body.trashed);

    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.description !== undefined) update.description = req.body.description;
    if (req.body.color !== undefined) update.color = req.body.color;

    if (req.body.reminder !== undefined) {
      update.reminder = req.body.reminder;
    }

    if (req.body.labels !== undefined) {
      update.labels = Array.isArray(req.body.labels) ? req.body.labels : [];
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MOVE TO TRASH
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: { trashed: true, archived: false } },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
