import { Request, Response } from "express"
import * as Canvas from "canvas"
import assets from "@putuofc/assetsku"

async function generateFacepalm(source: string) {
  const avatar = await Canvas.loadImage(source)
  const layer = await Canvas.loadImage(assets.image.get("FACEPALM"))

  const canvas = Canvas.createCanvas(632, 357)
  const ctx = canvas.getContext("2d")

  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, 632, 357)
  ctx.drawImage(avatar, 199, 112, 235, 235)
  ctx.drawImage(layer, 0, 0, 632, 357)

  return canvas.toBuffer("image/png")
}

export default async function facepalm(req: Request, res: Response) {
  const image = req.query.image as string

  if (!image) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'image' diperlukan",
    })
  }

  try {
    const buffer = await generateFacepalm(image)

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