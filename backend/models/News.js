import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    claim: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      enum: ["Real", "Fake", "Misleading"],
    },
    credibilityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    explanation: {
      type: String,
    },
    sources: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model("News", newsSchema);

export default News;