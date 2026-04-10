import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"

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

async function fetchImage(url: string) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" })
    return Buffer.from(res.data)
  } catch {
    return null
  }
}

function wrapLines(ctx: any, text: string, maxWidth: number) {
  const words = text.split(" ")
  const lines: string[] = []
  let line = ""

  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + " "
    if (ctx.measureText(test).width > maxWidth && i > 0) {
      lines.push(line.trim())
      line = words[i] + " "
    } else {
      line = test
    }
  }

  if (line) lines.push(line.trim())
  return lines
}

export default async function chatBubble(req: Request, res: Response) {
  try {
    const { name, message, color, profile } = req.query as Record<string, string>

    if (!name || !message) {
      return res.status(400).json({
        status: false,
        message: "parameter name dan message wajib"
      })
    }

    const scale = 2
    const canvasWidth = 800 * scale
    const padding = 25 * scale
    const profileSize = 60 * scale
    const gap = 20 * scale
    const messageX = padding + profileSize + gap

    const temp = createCanvas(canvasWidth, 200)
    const tctx = temp.getContext("2d")
    const messageFont = 24 * scale

    tctx.font = `${messageFont}px sans-serif`
    const maxText = canvasWidth - messageX - padding - 40

    const lines = wrapLines(tctx, message, maxText)
    const lineHeight = messageFont * 1.5
    const bubbleHeight = lines.length * lineHeight + 40 * scale
    const totalHeight = Math.max(padding * 2 + profileSize, padding + 40 * scale + bubbleHeight + padding)

    const canvas = createCanvas(canvasWidth, totalHeight)
    const ctx = canvas.getContext("2d")

    // profile
    if (profile) {
      const imgBuffer = await fetchImage(profile)
      if (imgBuffer) {
        const img = await loadImage(imgBuffer)
        ctx.save()
        ctx.beginPath()
        ctx.arc(padding + profileSize / 2, padding + profileSize / 2, profileSize / 2, 0, Math.PI * 2)
        ctx.clip()
        ctx.drawImage(img, padding, padding, profileSize, profileSize)
        ctx.restore()
      }
    }

    // name
    ctx.fillStyle = "#333"
    ctx.font = `bold ${20 * scale}px sans-serif`
    ctx.fillText(name, messageX, padding + 20 * scale)

    // bubble
    const bubbleY = padding + 20 * scale + 10
    const colors = color?.split(",") || ["#ffffff"]

    if (colors.length > 1) {
      const grad = ctx.createLinearGradient(messageX, bubbleY, messageX + 200, bubbleY + bubbleHeight)
      colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c.trim()))
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = color || "#ffffff"
    }

    let maxW = 0
    lines.forEach(l => {
      const w = tctx.measureText(l).width
      if (w > maxW) maxW = w
    })

    const bubbleWidth = maxW + (50 * scale)
    roundedRect(ctx, messageX, bubbleY, bubbleWidth, bubbleHeight, 20 * scale)
    ctx.fill()

    // text
    ctx.fillStyle = "#000"
    ctx.font = `${messageFont}px sans-serif`
    let y = bubbleY + 30 * scale + messageFont * 0.5

    for (const l of lines) {
      ctx.fillText(l, messageX + 25 * scale, y)
      y += lineHeight
    }

    res.setHeader("Content-Type", "image/png")
    return res.send(canvas.toBuffer())
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      message: err.message || "internal error"
    })
  }
}