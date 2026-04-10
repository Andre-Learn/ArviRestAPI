import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import axios from "axios"
import path from "path"

try { registerFont(path.join(__dirname, "Roboto.ttf"), { family: "Roboto" }) } catch(e) { /* font fallback */ }

export default async function fakeml(req: Request, res: Response) {
  const text = req.query.text as string
  const imageUrl = req.query.image as string

  if (!text || !imageUrl) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' dan 'image' diperlukan"
    })
  }

  try {
    const userBuffer = await axios.get(imageUrl, { responseType: "arraybuffer" }).then(r => r.data)
    const userImage = await loadImage(userBuffer)

    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229850158.jpeg")
    const frameOverlay = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229884471.png")

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const avatarSize = 205
    const frameSize = 293
    const centerX = (canvas.width - frameSize) / 2
    const centerY = (canvas.height - frameSize) / 2 - 282
    const avatarX = centerX + (frameSize - avatarSize) / 2
    const avatarY = centerY + (frameSize - avatarSize) / 2 - 3

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

    ctx.drawImage(frameOverlay, centerX, centerY, frameSize, frameSize)

    let fontSize = 36
    if (text.length > 11) fontSize = Math.max(24, fontSize - (text.length - 11) * 2)

    ctx.font = `${fontSize}px Roboto`
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"
    ctx.fillText(text, canvas.width / 2 + 13, centerY + frameSize + 15)

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