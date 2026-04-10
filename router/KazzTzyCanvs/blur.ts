import { Request, Response } from "express"
import * as Canvas from "canvas"
import axios from "axios"

export default async function blur(req: Request, res: Response) {
  const image = (req.query.image as string)?.trim()

  if (!image) {
    return res.status(400).json({
      status: false,
      message: "parameter 'image' diperlukan"
    })
  }

  try {
    const imgBuffer = (await axios.get(image, { responseType: "arraybuffer" })).data
    const img = await Canvas.loadImage(imgBuffer)

    const canvas = Canvas.createCanvas(img.width, img.height)
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.imageSmoothingEnabled = true
    ctx.drawImage(img, 0, 0, canvas.width / 4, canvas.height / 4)
    ctx.drawImage(
      canvas,
      0,
      0,
      canvas.width / 4,
      canvas.height / 4,
      0,
      0,
      canvas.width + 5,
      canvas.height + 5
    )

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "gagal memproses gambar"
    })
  }
}