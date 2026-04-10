import { Request, Response } from "express"
import * as Canvas from "canvas"

function applyCircleMask(
  ctx: Canvas.CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.globalCompositeOperation = "destination-in"
  ctx.beginPath()
  ctx.arc(
    width / 2,
    height / 2,
    Math.min(width, height) / 2,
    0,
    Math.PI * 2
  )
  ctx.closePath()
  ctx.fill()
}

async function generateCircle(source: string) {
  const img = await Canvas.loadImage(source)
  const canvas = Canvas.createCanvas(img.width, img.height)
  const ctx = canvas.getContext("2d")

  ctx.drawImage(img, 0, 0)
  applyCircleMask(ctx, canvas.width, canvas.height)

  return canvas.toBuffer("image/png")
}

export default async function circle(req: Request, res: Response) {
  const image = req.query.image as string

  if (!image) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'image' diperlukan",
    })
  }

  try {
    const buffer = await generateCircle(image)

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