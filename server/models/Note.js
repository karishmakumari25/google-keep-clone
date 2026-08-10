const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    pinned: { type: Boolean, default: false },

    archived: { type: Boolean, default: false },

    trashed: { type: Boolean, default: false },

    reminder: {
      type: Date,
      default: null,
    },

    labels: {
      type: [String],
      default: [],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    color: {
      type: String,
      default: "#ffffff",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Note", noteSchema);
