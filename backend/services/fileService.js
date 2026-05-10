import fs from "fs";
import * as pdfParseModule from "pdf-parse";
import mammoth from "mammoth";

export const extractTextFromFile = async (file) => {
  const filePath = file.path;
  const mimeType = file.mimetype;

  try {
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);

      const parser = new pdfParseModule.PDFParse({
        data: dataBuffer,
      });

      const pdfData = await parser.getText();
      return pdfData.text.trim();
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value.trim();
    }

    throw new Error("Unsupported file type");
  } catch (error) {
    console.error("File extraction error:", error.message);
    throw new Error("Failed to extract text from file");
  }
};