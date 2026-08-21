import mammoth from "mammoth";

/**
 * Safely extracts raw text from PDF, DOCX, or TXT buffer.
 * Supports both pdf-parse v1 (function) and v2 (PDFParse class).
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
      const pdfModule = require("pdf-parse");

      // Handle pdf-parse v2 (PDFParse class)
      const PDFParseClass = pdfModule.PDFParse || pdfModule.default?.PDFParse;
      if (PDFParseClass) {
        try {
          const parser = new PDFParseClass({ data: buffer });
          await parser.load();
          const parsedText = await parser.getText();
          const textValue =
            typeof parsedText === "string"
              ? parsedText
              : parsedText?.text ||
                (Array.isArray(parsedText?.pages)
                  ? parsedText.pages.map((p: any) => p.text || p.content || "").join("\n")
                  : null);

          if (textValue && textValue.trim().length > 0) {
            return textValue.trim();
          }
        } catch (v2Err) {
          console.warn("pdf-parse v2 parser error, trying v1 fallback:", v2Err);
        }
      }

      // Handle pdf-parse v1 (function fallback)
      if (typeof pdfModule === "function") {
        const data = await pdfModule(buffer);
        if (data && data.text && data.text.trim().length > 0) {
          return data.text.trim();
        }
      }
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
