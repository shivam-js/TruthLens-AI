import express from "express";
import multer from "multer";
import { analyzeUploadedFile } from "../controllers/fileController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/analyze", upload.single("file"), analyzeUploadedFile);

export default router;