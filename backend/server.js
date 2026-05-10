import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import connectDB from "./config/db.js";
import newsRoutes from "./routes/newsRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "https://truthlens-ai.netlify.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());

app.use("/api/news", newsRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/file", fileRoutes);

app.get("/", (req, res) => {
  res.send("TruthLens-AI Backend Running...");
});

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});