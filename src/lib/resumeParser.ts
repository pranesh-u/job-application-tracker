import mammoth from "mammoth";

/**
 * Safely extracts raw text from PDF, DOCX, or TXT buffer.
 * Returns null gracefully if parsing fails.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<string | null> {
  const extension = fileName.split(".").pop()?.toLowerCase();

  try {
    if (extension === "txt") {
      return buffer.toString("utf-8");
    }

    if (extension === "pdf") {
      // CommonJS require for pdf-parse compatibility in Next.js Turbopack
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return data.text ? data.text.trim() : null;
    }

    if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ? result.value.trim() : null;
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileName}:`, error);
  }

  return null;
}
