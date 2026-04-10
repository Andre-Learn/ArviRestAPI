import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"

export default async function affinitasml(req: Request, res: Response) {
  const bgNum = req.query.bg as string
  const imageUrl = req.query.image as string

  if (!imageUrl) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'image' diperlukan"
    })
  }

  const backgrounds = [
    "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772225640136.png",
    "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772225645439.png",
    "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772225653904.png",
    "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772225659927.png",
    "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772225664898.png",
    "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772225669507.png"
  ]

  let index = Math.floor(Math.random() * backgrounds.length)
  if (bgNum) {
    const n = parseInt(bgNum)
    if (!isNaN(n) && n >= 1 && n <= backgrounds.length) {
      index = n - 1
    }
  }

  try {
    const avatarBuffer = await axios
      .get(imageUrl, { responseType: "arraybuffer" })
      .then(r => r.data)

    const userImage = await loadImage(avatarBuffer)
    const bg = await loadImage(backgrounds[index])
    const avatarBorder = await loadImage(
      "https://c.termai.cc/i128/BOc3D5a.png"
    )

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const frame = { x: 444, y: 847, w: 205, h: 205 }
    const avatarSize = 300

    const avatarX = frame.x + (frame.w - avatarSize) / 2
    const avatarY = frame.y + (frame.h - avatarSize) / 2

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

    const pad = 55
    ctx.drawImage(
      avatarBorder,
      avatarX - pad,
      avatarY - pad,
      avatarSize + pad * 2,
      avatarSize + pad * 2
    )

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