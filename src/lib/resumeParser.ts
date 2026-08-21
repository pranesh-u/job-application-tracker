import mammoth from "mammoth";

/**
 * Extracts raw text from PDF, DOCX, or TXT buffer.
 * Uses pdfjs-dist (Mozilla PDF.js) directly for reliable serverless PDF parsing.
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
      return await extractPdfText(buffer);
    }

    if (extension === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      if (result && result.value && result.value.trim().length > 0) {
        return result.value.trim();
      }
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileName}:`, error);
  }

  return null;
}

/**
 * Extract text from a PDF buffer using pdfjs-dist (Mozilla PDF.js).
 * Uses the legacy build which does not require a worker thread — ideal for serverless.
 */
async function extractPdfText(buffer: Buffer): Promise<string | null> {
  try {
    // Use legacy build (no web worker required — works in Node.js & serverless)
    const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

    const data = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({
      data,
      useSystemFonts: true,
    }).promise;

    const pageTexts: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ");
      pageTexts.push(pageText);
    }

    const fullText = pageTexts.join("\n").trim();
    return fullText.length > 0 ? fullText : null;
  } catch (error) {
    console.error("pdfjs-dist extraction error:", error);
    return null;
  }
}
