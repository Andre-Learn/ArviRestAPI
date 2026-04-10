import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"


try { registerFont(path.join(__dirname, "nulis.ttf"), { family: "Nulis" }) } catch(e) { /* font fallback */ }

export default async function nulis(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' diperlukan"
    })
  }

  try {
    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230615261.jpeg")
    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const startX = canvas.width * 0.142
    const startY = canvas.height * 0.095
    const maxWidth = canvas.width * 0.748

    let fontSize = 18
    const lineHeight = 28

    ctx.fillStyle = "#000000"
    ctx.textBaseline = "top"
    ctx.font = `bold ${fontSize}px Nulis`

    const wrapText = (txt: string, maxW: number) => {
      const words = txt.split(" ")
      const lines: string[] = []
      let line = ""

      for (const w of words) {
        const test = line + w + " "
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line.trim())
          line = w + " "
        } else {
          line = test
        }
      }

      if (line) lines.push(line.trim())
      return lines
    }

    let lines = wrapText(text, maxWidth)

    while (lines.length * lineHeight > canvas.height * 0.78 && fontSize > 14) {
      fontSize--
      ctx.font = `bold ${fontSize}px Nulis`
      lines = wrapText(text, maxWidth)
    }

    let y = startY
    for (const line of lines) {
      ctx.fillText(line, startX, y)
      y += lineHeight
    }

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}


