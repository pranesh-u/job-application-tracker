import mammoth from "mammoth";

/**
 * Extracts raw text from PDF, DOCX, or TXT buffer.
 * Uses `unpdf` for PDF extraction — purpose-built for serverless/edge runtimes.
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
 * Extract text from a PDF buffer using unpdf.
 * unpdf is specifically built for serverless/edge runtimes (no worker, no native deps).
 */
async function extractPdfText(buffer: Buffer): Promise<string | null> {
  try {
    const { extractText } = await import("unpdf");

    // unpdf requires Uint8Array, not Buffer
    const data = new Uint8Array(buffer);
    const result = await extractText(data);

    // result.text is an array of strings (one per page)
    const fullText = Array.isArray(result.text)
      ? result.text.join("\n").trim()
      : String(result.text || "").trim();

    return fullText.length > 0 ? fullText : null;
  } catch (error) {
    console.error("unpdf extraction error:", error);
    return null;
  }
}
