import News from "../models/News.js";
import { analyzeClaim } from "../services/aiService.js";

export const createNewsAnalysis = async (req, res) => {
  try {
    const { claim } = req.body;

    if (!claim) {
      return res.status(400).json({
        success: false,
        message: "Claim is required",
      });
    }

    // ⚡ FAST AI RESPONSE
    const aiResult = await analyzeClaim(claim);

    // Save to DB
    const news = await News.create({
      claim,
      result: aiResult.result,
      credibilityScore: aiResult.credibilityScore,
      explanation: aiResult.explanation,
      sources: aiResult.sources,
    });

    // ✅ ONLY ONE RESPONSE
    res.status(201).json({
      success: true,
      data: news,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllNewsAnalysis = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: news.length,
      data: news,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching news claims",
      error: error.message,
    });
  }
};

export const deleteNewsAnalysis = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News claim not found",
      });
    }

    await News.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "News claim deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while deleting news claim",
      error: error.message,
    });
  }
};