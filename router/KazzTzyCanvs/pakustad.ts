import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"


registerFont(
  path.join(__dirname, "Arial Bold.ttf"),
  { family: "ArialBold" }
)

export default async function pakustad(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' diperlukan"
    })
  }


  if (text.length > 45) {
    return res.status(400).json({
      status: false,
      message: "Teks maksimal 45 karakter"
    })
  }

  try {
    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230666369.jpeg")
    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)


    const boxX = canvas.width * 0.08
    const boxY = canvas.height * 0.115
    const boxW = canvas.width * 0.84
    const boxH = canvas.height * 0.24

    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

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

    let fontSize = 28
    const minFont = 10
    const lineGap = 4
    let lines: string[] = []

    while (fontSize >= minFont) {
      ctx.font = `bold ${fontSize}px ArialBold`
      lines = wrapText(text, boxW - 40)

      const totalH = lines.length * (fontSize + lineGap)
      if (totalH <= boxH) break
      fontSize--
    }

    const totalHeight = lines.length * (fontSize + lineGap)
    let y = boxY + (boxH - totalHeight) / 2 + 10

    for (const line of lines) {
      ctx.fillText(line, boxX + boxW / 2, y)
      y += fontSize + lineGap
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