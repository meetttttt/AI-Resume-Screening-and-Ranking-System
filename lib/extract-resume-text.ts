import mammoth from "mammoth"
import { PDFParse } from "pdf-parse"

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim()
}

export async function extractResumeText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const name = file.name.toLowerCase()
  const type = file.type

  if (name.endsWith(".pdf") || type === "application/pdf") {
    const parser = new PDFParse({ data: buffer })
    try {
      const result = await parser.getText()
      return normalizeWhitespace(result.text ?? "")
    } finally {
      await parser.destroy()
    }
  }

  if (
    name.endsWith(".docx") ||
    type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const { value } = await mammoth.extractRawText({ buffer })
    return normalizeWhitespace(value ?? "")
  }

  throw new Error(`Unsupported file type: ${file.name}`)
}
