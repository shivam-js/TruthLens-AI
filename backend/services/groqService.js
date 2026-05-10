import axios from "axios";

export const analyzeWithGroq = async (claim, context, currentDate) => {
  const prompt = `
You are TruthLens-AI, a strict fact-checking assistant.

Today's date is: ${currentDate}

Use ONLY the provided context.

Context:
${context}

Claim: "${claim}"

Return ONLY valid JSON:
{
  "result": "Real" | "Fake" | "Misleading",
  "explanation": "2-3 sentence explanation based only on context."
}
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 350,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("Groq response:", response.data);
  
    const raw = response.data.choices[0].message.content;

  console.log("Groq RAW:", raw); // 👈 IMPORTANT DEBUG

  let parsed;

  try {
    parsed = JSON.parse(
      raw.replace(/```json|```/g, "").trim()
    );
  } catch (err) {
    console.error("JSON parse failed, using fallback");

    // fallback safe parsing
    parsed = {
      result: raw.toLowerCase().includes("fake")
        ? "Fake"
        : raw.toLowerCase().includes("real")
        ? "Real"
        : "Misleading",
      explanation: raw,
    };
  }

  return parsed;
  
};