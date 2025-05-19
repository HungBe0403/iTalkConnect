const ReactionSchema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Messages", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    type: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reactions", ReactionSchema);