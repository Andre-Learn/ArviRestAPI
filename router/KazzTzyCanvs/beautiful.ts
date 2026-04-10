import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import assets from "@putuofc/assetsku"

async function generateBeautiful(imageUrl: string) {
  const img = await loadImage(imageUrl)
  const base = await loadImage(
    assets.image.get("BEAUTIFUL")
  )

  const canvas = createCanvas(376, 400)
  const ctx = canvas.getContext("2d")

  ctx.drawImage(base, 0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 258, 28, 84, 95)
  ctx.drawImage(img, 258, 229, 84, 95)

  return canvas.toBuffer("image/png")
}

export default async function beautiful(req: Request, res: Response) {
  const image = req.query.image as string

  if (!image) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'image' diperlukan"
    })
  }

  try {
    const buffer = await generateBeautiful(image)

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal memproses gambar"
    })
  }
}