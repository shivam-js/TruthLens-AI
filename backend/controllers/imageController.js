import { extractTextFromImage } from "../services/ocrService.js";
import { analyzeClaim } from "../services/aiService.js";

export const analyzeImageClaim = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const extractedText = (await extractTextFromImage(req.file.path)).trim();

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in image",
      });
    }

    const aiResult = await analyzeClaim(extractedText);

    res.status(200).json({
      success: true,
      extractedText,
      data: aiResult,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Image analysis failed",
      error: error.message,
    });
  }
};