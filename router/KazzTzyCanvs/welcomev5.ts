import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import assets from "./assetsku"

try {
  registerFont(assets.font.get("MONTSERRAT-BOLD"), { family: "Montserrat" })
} catch {}

function applyText(
  canvas: ReturnType<typeof createCanvas>,
  text: string,
  defaultFontSize: number,
  width: number,
  font: string
) {
  const ctx = canvas.getContext("2d")
  do {
    defaultFontSize -= 1
    ctx.font = `${defaultFontSize}px ${font}`
  } while (ctx.measureText(text).width > width)
  return ctx.font
}

async function generateWelcomeV5(
  username: string,
  guildName: string,
  memberCount: number,
  avatar: string,
  background: string,
  quality: number
): Promise<Buffer> {

  const canvas = createCanvas(1024, 450)
  const ctx = canvas.getContext("2d")

  const bg = await loadImage(background)
  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

  const avatarSize = 180
  const avatarX = canvas.width / 2
  const avatarY = 140

  ctx.save()
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  const av = await loadImage(avatar)
  ctx.drawImage(av, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize)
  ctx.restore()

  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarSize / 2 + 5, 0, Math.PI * 2)
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 10
  ctx.stroke()

  ctx.font = "bold 60px Montserrat"
  ctx.textAlign = "center"
  ctx.fillStyle = "#ffffff"

  if (ctx.measureText(username).width > canvas.width - 100) {
    ctx.font = applyText(canvas, username, 60, canvas.width - 100, "Montserrat")
  }

  ctx.fillText(username, canvas.width / 2, 290)

  ctx.font = "bold 30px Montserrat"
  ctx.fillText(`Welcome To ${guildName}`, canvas.width / 2, 340)

  ctx.font = "bold 24px Montserrat"
  ctx.fillText(`Member ${memberCount}`, canvas.width / 2, 380)

  return canvas.toBuffer("image/jpeg", { quality: quality / 100 })
}

export default async function welcomev5(req: Request, res: Response) {

  const { username, guildName, memberCount, avatar, background, quality } = req.query

  if (!username || !guildName || !memberCount || !avatar || !background) {
    return res.status(400).json({
      status: false,
      message: "Parameter username, guildName, memberCount, avatar, background wajib diisi"
    })
  }

  try {

    let q = parseInt(quality as string) || 100
    if (q < 1) q = 1
    if (q > 100) q = 100

    const buffer = await generateWelcomeV5(
      username as string,
      guildName as string,
      parseInt(memberCount as string),
      avatar as string,
      background as string,
      q
    )

    res.setHeader("Content-Type", "image/jpeg")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}