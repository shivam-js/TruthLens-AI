import express from "express";
import { createNewsAnalysis, getAllNewsAnalysis, deleteNewsAnalysis } from "../controllers/newsController.js";

const router = express.Router();

router.get("/", getAllNewsAnalysis);
router.post("/analyze", createNewsAnalysis);
router.delete("/:id", deleteNewsAnalysis);

export default router;