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
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://truthlenss-ai.netlify.app",
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

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