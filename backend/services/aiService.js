import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import { searchWebForClaim } from "./searchService.js";
import { analyzeWithGroq } from "./groqService.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY?.trim(),
});

const cache = new Map();

const normalizeClaim = (claim) =>
  claim
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ");

const calculateScore = (result, sourceCount) => {
  let credibilityScore = 50;

  if (result === "Real") credibilityScore = 80 + sourceCount * 5;
  if (result === "Fake") credibilityScore = 10 + sourceCount * 5;
  if (result === "Misleading") credibilityScore = 45 + sourceCount * 5;

  credibilityScore = Math.min(100, Math.max(0, credibilityScore));

  if (sourceCount <= 1) credibilityScore = Math.min(credibilityScore, 60);
  if (sourceCount === 0) credibilityScore = Math.min(credibilityScore, 50);

  return credibilityScore;
};

const analyzeWithGemini = async (claim, context, currentDate) => {
  const prompt = `
You are TruthLens-AI, a strict fact-checking assistant.

Today's date is: ${currentDate}

Use ONLY the provided context. If context is weak, insufficient, outdated, or conflicting, clearly say so.

TIME RULE:
- Compare claim dates with Today's date.
- If an event date is after Today's date, it is future.
- If an event date is before Today's date, verify using context.
- Do not call a past event future.

GROUNDING RULES:
1. Do NOT invent facts.
2. Do NOT invent sources.
3. Use only the context.
4. Be accurate, cautious, and clear.

Context:
${context}

Claim: "${claim}"

Return ONLY valid JSON:
{
  "result": "Real" | "Fake" | "Misleading",
  "explanation": "2-3 sentence explanation based only on context."
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      temperature: 0.1,
      maxOutputTokens: 450,
    },
  });

  const text = response.text.replace(/```json|```/g, "").trim();
  return JSON.parse(text);
};

export const analyzeClaim = async (claim) => {
  const normalizedClaim = normalizeClaim(claim);

  if (cache.has(normalizedClaim)) {
    console.log("⚡ Cache hit");
    return cache.get(normalizedClaim);
  }

  try {
    const searchResults = await searchWebForClaim(claim);

    const context = searchResults
      .map((item, index) => {
        return `${index + 1}. ${item.title}\n${item.snippet}\n${item.link}`;
      })
      .join("\n\n");

    const currentDate = new Date().toISOString().split("T")[0];

    const geminiPromise = analyzeWithGemini(claim, context, currentDate);
    const groqPromise = analyzeWithGroq(claim, context, currentDate);

    const aiResult = await Promise.any([geminiPromise, groqPromise]);

    const sourceCount = searchResults.filter((item) => item.link).length;

    const finalResult = {
      result: ["Real", "Fake", "Misleading"].includes(aiResult.result)
        ? aiResult.result
        : "Misleading",
      credibilityScore: calculateScore(aiResult.result, sourceCount),
      explanation: aiResult.explanation,
      sources: searchResults.map((item) => item.link).filter(Boolean),
    };

    cache.set(normalizedClaim, finalResult);
    return finalResult;
  } catch (error) {
    console.error("All AI providers failed:", error.message);

    const finalResult = {
      result: "Misleading",
      credibilityScore: 0,
      explanation:
        "AI verification is temporarily unavailable. Please try again later.",
      sources: [],
    };

    cache.set(normalizedClaim, finalResult);
    return finalResult;
  }
};