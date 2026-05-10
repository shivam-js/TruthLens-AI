import express from "express";
import multer from "multer";
import { analyzeImageClaim } from "../controllers/imageController.js";

const router = express.Router();

const upload = multer({
  dest: "uploads/",
});

router.post("/analyze", upload.single("image"), analyzeImageClaim);

export default router;