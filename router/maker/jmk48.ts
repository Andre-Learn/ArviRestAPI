import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"

export default async function jmk48(req: Request, res: Response) {
  const imageUrl = req.query.image as string
  if (!imageUrl) return res.status(400).json({ status: false, message: "Parameter 'image' diperlukan" })

  try {
    const frameURL = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230335511.png"

    const [userBuffer, frameBuffer] = await Promise.all([
      axios.get(imageUrl, { responseType: "arraybuffer" }).then(r => r.data),
      axios.get(frameURL, { responseType: "arraybuffer" }).then(r => r.data)
    ])

    const [userImg, frameImg] = await Promise.all([
      loadImage(userBuffer),
      loadImage(frameBuffer)
    ])

    const canvas = createCanvas(frameImg.width, frameImg.height)
    const ctx = canvas.getContext("2d")

    const centerX = canvas.width / 2
    const centerY = Math.round(canvas.height * 0.5)
    const radius = Math.round(canvas.width * 0.4)

    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(userImg, centerX - radius, centerY - radius, radius * 2, radius * 2)
    ctx.restore()

    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message || "Gagal membuat frame JMK48" })
  }
}