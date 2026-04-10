import { Request, Response } from 'express'
import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'

try { registerFont(path.join(__dirname, 'Roboto.ttf'), { family: 'Roboto' }) } catch(e) { /* font fallback */ }

const backgrounds = [
  "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229966454.png",
  "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229977051.png",
  "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229982405.png",
  "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229989170.png",
  "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229995515.png"
]

export default async function fakemlHandler(req: Request, res: Response) {
  const text = (req.query.text || req.body.text) as string
  const imageUrl = (req.query.image || req.body.image) as string

  if (!text || !imageUrl) {
    return res.status(400).json({
      creator: "KayzzAoshi",
      status: false,
      message: "Parameter 'text' dan 'image' diperlukan"
    })
  }

  const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)]

  try {
    const avatar = await loadImage(imageUrl)
    const bg = await loadImage(bgUrl)
    const frameOverlay = await loadImage("https://c.termai.cc/i171/086KtH.png")

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const avatarSize = 250
    const frameSize = 345
    const centerX = (canvas.width - frameSize) / 2
    const centerY = (canvas.height - frameSize) / 2 - 358
    const avatarX = centerX + (frameSize - avatarSize) / 2
    const avatarY = centerY + (frameSize - avatarSize) / 2 - 3

    const minSide = Math.min(avatar.width, avatar.height)
    const cropX = (avatar.width - minSide) / 2
    const cropY = (avatar.height - minSide) / 2

    ctx.drawImage(avatar, cropX, cropY, minSide, minSide, avatarX, avatarY, avatarSize, avatarSize)
    ctx.drawImage(frameOverlay, centerX, centerY, frameSize, frameSize)

    let fontSize = 44
    if (text.length > 11) fontSize -= (text.length - 11) * 2
    if (fontSize < 24) fontSize = 24

    ctx.font = `${fontSize}px Roboto`
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"
    ctx.fillText(text, canvas.width / 2 + 5, centerY + frameSize + 18)

    res.setHeader('Content-Type', 'image/png')
    res.send(canvas.toBuffer('image/png'))
  } catch (err: any) {
    res.status(500).json({ creator: "KayzzAoshi", status: false, message: err.message })
  }
}