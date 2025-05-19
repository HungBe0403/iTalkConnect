const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "video", "audio", "file"],
      required: true,
    },
    format: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    name: { type: String },
    duration: { type: Number }, // For video/audio files
    width: { type: Number }, // For images/videos
    height: { type: Number }, // For images/videos
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", MediaSchema);
