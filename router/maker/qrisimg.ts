import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"

registerFont(
  path.join(__dirname, "Arial Bold.ttf"),
  { family: "ArialBold" }
)

export default async function qrisimg(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "Masukan nama! Contoh: ?text=SHANNZ STORE"
    })
  }

  if (text.length > 30) {
    return res.status(400).json({
      status: false,
      message: "Nama terlalu panjang!"
    })
  }

  try {
    const backgroundUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230728772.jpeg"
    const bg = await loadImage(backgroundUrl)
    
    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    ctx.font = "bold 32px ArialBold"
    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    ctx.fillText(text.toUpperCase(), canvas.width / 2, 275)

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