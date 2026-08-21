import mammoth from "mammoth";

/**
 * Safely extracts raw text from PDF, DOCX, or TXT buffer.
 * Supports pdf-parse v2 (PDFParse class) which returns { pages, text, total }.
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

      // pdf-parse v2: PDFParse class
      const PDFParseClass = pdfModule.PDFParse || pdfModule.default?.PDFParse;
      if (PDFParseClass) {
        try {
          const parser = new PDFParseClass({ data: buffer });
          await parser.load();
          const result = await parser.getText();

          // getText() returns { pages: [...], text: string, total: number }
          let textValue: string | null = null;

          if (typeof result === "string") {
            textValue = result;
          } else if (result && typeof result === "object") {
            // Primary: use .text property (full concatenated text)
            if (typeof result.text === "string" && result.text.trim().length > 0) {
              textValue = result.text;
            }
            // Fallback: concatenate page texts
            else if (Array.isArray(result.pages)) {
              textValue = result.pages
                .map((p: any) => {
                  if (typeof p === "string") return p;
                  return p?.text || p?.content || "";
                })
                .join("\n");
            }
          }

          if (textValue && textValue.trim().length > 0) {
            return textValue.trim();
          }
        } catch (v2Err) {
          console.warn("pdf-parse v2 extraction error:", v2Err);
        }
      }

      // Fallback: pdf-parse v1 (default function export)
      if (typeof pdfModule === "function") {
        try {
          const data = await pdfModule(buffer);
          if (data && data.text && data.text.trim().length > 0) {
            return data.text.trim();
          }
        } catch (v1Err) {
          console.warn("pdf-parse v1 extraction error:", v1Err);
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
