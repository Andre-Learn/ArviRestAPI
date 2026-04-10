import { Request, Response } from "express"
import * as Canvas from "canvas"

function applyDarkness(
  ctx: Canvas.CanvasRenderingContext2D,
  width: number,
  height: number,
  amount: number
) {
  const img = ctx.getImageData(0, 0, width, height)

  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = Math.max(0, img.data[i] - amount)
    img.data[i + 1] = Math.max(0, img.data[i + 1] - amount)
    img.data[i + 2] = Math.max(0, img.data[i + 2] - amount)
  }

  ctx.putImageData(img, 0, 0)
}

async function generateDarkness(source: string, amount: number) {
  const img = await Canvas.loadImage(source)
  const canvas = Canvas.createCanvas(img.width, img.height)
  const ctx = canvas.getContext("2d")

  ctx.drawImage(img, 0, 0)
  applyDarkness(ctx, canvas.width, canvas.height, amount)

  return canvas.toBuffer("image/png")
}

export default async function darkness(req: Request, res: Response) {
  const image = req.query.image as string
  const amount = parseInt(String(req.query.amount || "50"), 10)

  if (!image) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'image' diperlukan",
    })
  }

  if (isNaN(amount) || amount < 0 || amount > 255) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'amount' harus 0 - 255",
    })
  }

  try {
    const buffer = await generateDarkness(image, amount)

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal memproses gambar",
    })
  }
}