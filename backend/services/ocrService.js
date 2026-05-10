import Tesseract from "tesseract.js";

export const extractTextFromImage = async (imagePath) => {
  try {
    const result = await Tesseract.recognize(
      imagePath,
      "eng+hin"
    );

    return result.data.text.trim();
  } catch (error) {
    console.error("OCR error:", error.message);
    throw new Error("Failed to extract text from image");
  }
};