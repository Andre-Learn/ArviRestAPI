import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"

export default async function fakedev(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()
  const image = (req.query.image as string)?.trim()
  const verified = (req.query.verified as string)?.toLowerCase() === "true"

  if (!text || !image) {
    return res.status(400).json({
      status: false,
      message: "parameter 'text' dan 'image' diperlukan"
    })
  }

  try {
    const imgBuffer = (await axios.get(image, { responseType: "arraybuffer" })).data
    const userImage = await loadImage(imgBuffer)
    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772797781960.jpeg")
    const badge = verified
      ? await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772797710490.png")
      : null

    const canvas = createCanvas(1080, 1080)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 263

    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(userImage, centerX - radius, centerY - radius, radius * 2, radius * 2)
    ctx.restore()

    drawCircularTextTop(ctx, text.toUpperCase(), centerX, centerY, radius, badge)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "gagal membuat fakedev"
    })
  }
}

function drawCircularTextTop(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  radius: number,
  badgeImage: any
) {
  const fontSize = 72
  const strokeWidth = 3
  const arcSpan = Math.PI * 0.7

  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.fillStyle = "#FFFFFF"
  ctx.strokeStyle = "#000000"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  const textRadius = radius + 75
  const chars = text.split("")
  const n = chars.length
  const angleIncrement = n > 1 ? arcSpan / (n - 1) : 0
  const start = Math.PI / 2 + arcSpan / 2

  for (let i = 0; i < n; i++) {
    const char = chars[i]
    const angle = start - i * angleIncrement
    const x = centerX + Math.cos(angle) * textRadius
    const y = centerY + Math.sin(angle) * textRadius

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle - Math.PI / 2)
    ctx.lineWidth = strokeWidth
    ctx.strokeText(char, 0, 0)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }

  if (badgeImage) {
    const endAngle = start - (n - 1) * angleIncrement
    const badgeAngle = endAngle - angleIncrement
    const badgeSize = Math.round(fontSize * 0.9)
    const bx = centerX + Math.cos(badgeAngle) * textRadius
    const by = centerY + Math.sin(badgeAngle) * textRadius
    ctx.drawImage(badgeImage, bx - badgeSize / 2, by - badgeSize / 2, badgeSize, badgeSize)
  }
}