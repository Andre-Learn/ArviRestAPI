import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage } from "canvas"

async function getImage(url: string) {
  const res = await axios.get(url, { responseType: "arraybuffer" })
  return await loadImage(Buffer.from(res.data))
}

async function generateProfile(
  backgroundURL: string,
  avatarURL: string,
  rankName: string,
  rankId: string,
  exp: number,
  requireExp: number,
  level: number,
  name: string
): Promise<Buffer> {

  const width = 850
  const height = 300

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  const [bg, avatar] = await Promise.all([
    getImage(backgroundURL),
    getImage(avatarURL)
  ])

  ctx.drawImage(bg, 0, 0, width, height)

  const overlayX = 20
  const overlayY = 20
  const overlayWidth = width - 40
  const overlayHeight = height - 40
  const radius = 30

  ctx.fillStyle = "rgba(0,0,0,0.7)"
  ctx.beginPath()
  ctx.moveTo(overlayX + radius, overlayY)
  ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, radius)
  ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, radius)
  ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, radius)
  ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, radius)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = "#FFCC33"
  ctx.lineWidth = 4
  ctx.stroke()

  const avatarSize = 120

  ctx.save()
  ctx.beginPath()
  ctx.arc(100, height / 2, avatarSize / 2, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(avatar, 40, height / 2 - avatarSize / 2, avatarSize, avatarSize)
  ctx.restore()

  ctx.beginPath()
  ctx.arc(100, height / 2, avatarSize / 2, 0, Math.PI * 2)
  ctx.strokeStyle = "#FFCC33"
  ctx.lineWidth = 4
  ctx.stroke()

  ctx.font = "bold 36px Arial"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(name, 180, height / 2 - 20)

  ctx.font = "bold 28px Arial"
  ctx.fillText(`LEVEL ${level}`, width - 180, 80)

  ctx.font = "bold 22px Arial"
  ctx.fillText(`${rankName} ${rankId}`, width - 180, 120)

  const barWidth = 600
  const barHeight = 30
  const barX = 180
  const barY = height / 2 + 20

  const progress = Math.min(1, Math.max(0, exp / requireExp))

  ctx.fillStyle = "#363636"
  ctx.fillRect(barX, barY, barWidth, barHeight)

  ctx.fillStyle = "#FFCC33"
  ctx.fillRect(barX, barY, barWidth * progress, barHeight)

  ctx.strokeStyle = "#FFCC33"
  ctx.lineWidth = 2
  ctx.strokeRect(barX, barY, barWidth, barHeight)

  ctx.font = "bold 18px Arial"
  ctx.textAlign = "center"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(`${exp} / ${requireExp} XP`, barX + barWidth / 2, barY + 20)

  return canvas.toBuffer("image/png")
}

export default async function profileHandler(req: Request, res: Response) {
  const { backgroundURL, avatarURL, rankName, rankId, exp, requireExp, level, name } = req.query

  if (!backgroundURL || !avatarURL || !rankName || !rankId || !exp || !requireExp || !level || !name) {
    return res.status(400).json({
      status: false,
      message: "Semua parameter wajib diisi."
    })
  }

  try {
    const buffer = await generateProfile(
      backgroundURL as string,
      avatarURL as string,
      rankName as string,
      rankId as string,
      parseInt(exp as string),
      parseInt(requireExp as string),
      parseInt(level as string),
      name as string
    )

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat gambar profile"
    })
  }
}