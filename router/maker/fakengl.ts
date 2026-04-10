import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import axios from "axios"
import path from "path"

try { registerFont(path.join(__dirname, "Poppins-Bold.ttf"), { family: "Poppins" }) } catch(e) { /* font fallback */ }

export default async function fakengl(req: Request, res: Response) {
  const text = (req.query.text as string) || req.body.text
  if (!text) return res.status(400).json({ status: false, message: "Parameter 'text' diperlukan" })

  try {
    const bgUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230087815.jpeg"
    const bgBuffer = await axios.get(bgUrl, { responseType: "arraybuffer" }).then(r => r.data)
    const bgImage = await loadImage(bgBuffer)

    const width = 1440
    const height = 1164
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bgImage, 0, 0, width, height)

    ctx.fillStyle = "black"
    ctx.font = "bold 65px Poppins"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const maxWidth = 1200
    const lineHeight = 85
    const centerY = 705

    const words = text.split(" ")
    let lines: string[] = []
    let currentLine = ""

    for (const word of words) {
      const testLine = currentLine ? currentLine + " " + word : word
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth) {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    const totalHeight = lines.length * lineHeight
    const startY = centerY - totalHeight / 2 + lineHeight / 2

    lines.forEach((line, i) => {
      const y = startY + i * lineHeight
      ctx.fillText(line, width / 2, y)
    })

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message })
  }
}