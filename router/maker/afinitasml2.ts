import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"

export default async function afinitasml(req: Request, res: Response) {
  const imageUrl = req.query.image as string
  if (!imageUrl) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'image' diperlukan"
    })
  }

  try {
    const bgURL = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772821724016.png"


    const [userBuffer, bgBuffer] = await Promise.all([
      axios.get(imageUrl, { responseType: "arraybuffer" }).then(r => r.data),
      axios.get(bgURL, { responseType: "arraybuffer" }).then(r => r.data)
    ])

    const [userImage, bg] = await Promise.all([
      loadImage(userBuffer),
      loadImage(bgBuffer)
    ])

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    const frame = { x: 450, y: 847, width: 205, height: 205 }
    const avatarSize = 300
    const avatarX = frame.x + (frame.width - avatarSize) / 2
    const avatarY = frame.y + (frame.height - avatarSize) / 2

    const minSide = Math.min(userImage.width, userImage.height)
    const cropX = (userImage.width - minSide) / 2
    const cropY = (userImage.height - minSide) / 2

    ctx.drawImage(
      userImage,
      cropX,
      cropY,
      minSide,
      minSide,
      avatarX,
      avatarY,
      avatarSize,
      avatarSize
    )

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat Affinitas ML"
    })
  }
}