import { extractTextFromFile } from "../services/fileService.js";
import { extractClaimsFromText } from "../services/claimService.js";
import { analyzeClaim } from "../services/aiService.js";
import News from "../models/News.js";

export const analyzeUploadedFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const extractedText = await extractTextFromFile(req.file);

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        message: "No readable text found in file",
      });
    }

        const claims = extractClaimsFromText(extractedText);

        const analysisResults = [];

        for (const singleClaim of claims) {
          const result = await analyzeClaim(singleClaim);

          analysisResults.push({
            claim: singleClaim,
            ...result,
          });
        }

        const aiResult = {
          result: 
            analysisResults.some((item) => item.result === "Fake")
              ? "Fake"
              : analysisResults.some((item) => item.result === "Misleading")
              ? "Misleading"
              : "Real",
          credibilityScore: Math.round(
            analysisResults.reduce((sum, item) => sum + (item.credibilityScore || 0), 0) /
              (analysisResults.length || 1)
          ),
          explanation: JSON.stringify(analysisResults),
          sources: [...new Set(analysisResults.flatMap((item) => item.sources || []))],
        };

  const news = await News.create({
    claim: extractedText,
    result: aiResult.result,
    credibilityScore: aiResult.credibilityScore,
    explanation: aiResult.explanation,
    sources: aiResult.sources,
  });

  res.status(200).json({
    success: true,
    extractedText,
    data: news,
  });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "File analysis failed",
      error: error.message,
    });
  }
};