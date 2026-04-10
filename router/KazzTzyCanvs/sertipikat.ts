import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"


registerFont(
  path.join(__dirname, "Arial Bold.ttf"),
  { family: "ArialBold" }
)

export default async function sertipikat(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' diperlukan"
    })
  }

  try {
    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230776645.jpeg")

    const canvas = createCanvas(900, 500)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#ffffff"

    const maxWidth = 700
    let fontSize = 48
    const minFont = 26

    while (fontSize > minFont) {
      ctx.font = `bold ${fontSize}px ArialBold`
      if (ctx.measureText(text).width <= maxWidth) break
      fontSize -= 2
    }

    ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 10)

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