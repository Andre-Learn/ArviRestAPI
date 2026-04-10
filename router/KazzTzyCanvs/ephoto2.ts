import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import assets from "./assetsku"

function autoSize(ctx: any, text: string, maxWidth: number, start = 190) {
  let size = start
  do {
    ctx.font = `bold ${size}px Arial Black`
    size--
  } while (ctx.measureText(text).width > maxWidth && size > 50)
  return size
}

export default async function ephoto2(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' wajib diisi"
    })
  }

  try {


    registerFont(assets.font.get("ARRIAL"), { family: "Arial Black" })

    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229623623.jpeg")

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const maxWidth = canvas.width - 160
    const finalText = text.toUpperCase()

    const fontSize = autoSize(ctx, finalText, maxWidth)

    ctx.font = `bold ${fontSize}px Arial Black`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const x = canvas.width / 2
    const y = canvas.height / 2

    const gold = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gold.addColorStop(0, "#fff9c4")
    gold.addColorStop(0.5, "#ffd54f")
    gold.addColorStop(1, "#ffb300")

    ctx.shadowColor = "#ffe066"
    ctx.shadowBlur = 60
    ctx.fillStyle = gold
    ctx.fillText(finalText, x, y)

    ctx.shadowBlur = 25
    ctx.strokeStyle = "#fff4b0"
    ctx.lineWidth = 6
    ctx.strokeText(finalText, x, y)

    ctx.shadowBlur = 0
    ctx.shadowColor = "transparent"
    ctx.lineWidth = 8
    ctx.strokeStyle = "rgba(0,0,0,0.45)"
    ctx.strokeText(finalText, x + 6, y + 6)

    const buffer = canvas.toBuffer("image/png")

    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal memproses gambar"
    })
  }
}