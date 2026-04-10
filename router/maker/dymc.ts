import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"

export default async function dymc(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()
  const imageUrl = (req.query.image as string)?.trim()

  if (!text || !imageUrl) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' dan 'image' diperlukan"
    })
  }

  try {
    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771157829363.jpeg")
    const userImg = await loadImage(imageUrl)

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const size = 489
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2 - 12

    const minSide = Math.min(userImg.width, userImg.height)
    const sx = (userImg.width - minSide) / 2
    const sy = (userImg.height - minSide) / 2

    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(
      userImg,
      sx,
      sy,
      minSide,
      minSide,
      centerX - size / 2,
      centerY - size / 2,
      size,
      size
    )
    ctx.restore()

    ctx.beginPath()
    ctx.arc(centerX, centerY, size / 2 + 18, 0, Math.PI * 2)
    ctx.lineWidth = 12
    ctx.strokeStyle = "white"
    ctx.stroke()

    ctx.save()
    const maxFontSize = 80
    const minFontSize = 40
    let fontSize = maxFontSize
    if (text.length > 10) fontSize = Math.max(minFontSize, maxFontSize - (text.length - 10) * 2)
    ctx.font = `bold ${fontSize}px serif`
    ctx.fillStyle = "white"
    ctx.strokeStyle = "black"
    ctx.lineWidth = 5

    const radius = size / 2 + 80
    drawCircularText(ctx, text.toUpperCase(), centerX, centerY + 50, radius)
    ctx.restore()

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat Dynamic Circular"
    })
  }
}

function drawCircularText(ctx: any, text: string, centerX: number, centerY: number, radius: number) {
  const chars = text.split('')
  const n = chars.length
  const arcSpan = Math.PI * 0.7
  const angleIncrement = n > 1 ? arcSpan / (n - 1) : 0
  const start = Math.PI / 2 + arcSpan / 2

  for (let i = 0; i < n; i++) {
    const char = chars[i]
    const angle = start - i * angleIncrement
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle - Math.PI / 2)
    ctx.strokeText(char, 0, 0)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }
}