export const extractClaimsFromText = (text) => {
  if (!text) return [];

  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim();

  const sentences = cleanedText
    .split(/(?<=[.!?])\s+|(?<=।)\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30);

  const claimLikeSentences = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase();

    const weakWords = [
      "acknowledgement",
      "submitted by",
      "guided by",
      "department",
      "university",
      "report",
      "chapter",
      "table of contents",
    ];

    const hasWeakWord = weakWords.some((word) => lower.includes(word));

    return !hasWeakWord;
  });

  return claimLikeSentences.slice(0, 10);
};