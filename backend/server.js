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

// Manual CORS Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware
app.use(express.json());

// Routes
app.use("/api/news", newsRoutes);
app.use("/api/image", imageRoutes);
app.use("/api/file", fileRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("TruthLens-AI Backend Running...");
});

// MongoDB Connection Check
mongoose.connection.once("open", () => {
  console.log("MongoDB Connected");
});

// Start Server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});