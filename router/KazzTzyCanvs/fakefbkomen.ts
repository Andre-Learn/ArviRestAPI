import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"

function roundedRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function wrapText(ctx: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ")
  let line = ""

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " "
    const testWidth = ctx.measureText(testLine).width

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y)
      line = words[n] + " "
      y += lineHeight
    } else {
      line = testLine
    }
  }

  ctx.fillText(line, x, y)
}

export default async function fakefbcomment(req: Request, res: Response) {
  try {
    const { nama, komentar, image } = req.body
    if (!nama || !komentar || !image) {
      return res.status(400).json({ error: "nama, komentar, dan image diperlukan" })
    }

    const avatar = await loadImage(image)
    const canvas = createCanvas(1280, 780)
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = "#1877f2"
    ctx.fillRect(0, 0, canvas.width, 60)

    ctx.fillStyle = "#f0f2f5"
    ctx.fillRect(0, 60, canvas.width, canvas.height - 60)

    const postWidth = 800
    const postX = (canvas.width - postWidth) / 2
    const postY = 100

    ctx.fillStyle = "#fff"
    ctx.shadowColor = "rgba(0,0,0,0.1)"
    ctx.shadowBlur = 10
    ctx.shadowOffsetY = 2
    roundedRect(ctx, postX, postY, postWidth, 600, 10)
    ctx.fill()
    ctx.shadowColor = "transparent"

    const postHeaderY = postY + 20
    ctx.save()
    ctx.beginPath()
    ctx.arc(postX + 30, postHeaderY + 20, 25, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, postX + 5, postHeaderY, 50, 50)
    ctx.restore()

    ctx.fillStyle = "#050505"
    ctx.font = "600 15px sans-serif"
    ctx.fillText(nama, postX + 70, postHeaderY + 25)

    ctx.fillStyle = "#65676b"
    ctx.font = "400 13px sans-serif"
    ctx.fillText("baru saja · 🌍", postX + 70, postHeaderY + 45)

    const imgX = postX + 30
    const imgY = postHeaderY + 80
    const imgW = postWidth - 60
    const imgH = 300
    ctx.drawImage(avatar, imgX, imgY, imgW, imgH)

    ctx.fillStyle = "#050505"
    ctx.font = "400 16px sans-serif"
    wrapText(ctx, komentar, imgX, imgY + imgH + 40, imgW, 28)

    ctx.fillStyle = "#65676b"
    ctx.font = "600 15px sans-serif"
    ctx.fillText("👍 Suka · 💬 Komentar · ↗️ Bagikan", postX + 30, postY + 580)

    const buffer = canvas.toBuffer()

    res.setHeader("Content-Type", "image/png")
    return res.send(buffer)
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
}