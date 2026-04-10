import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage, registerFont } from "canvas"
import assets from "@putuofc/assetsku"

registerFont(assets.font.get("THEBOLDFONT"), { family: "Bold" })

async function getImage(url: string) {
  const res = await axios.get(url, { responseType: "arraybuffer" })
  return await loadImage(Buffer.from(res.data))
}

async function generateWelcomeImage(
  username: string,
  guildName: string,
  guildIcon: string,
  memberCount: number,
  avatar: string,
  background: string,
  quality: number
): Promise<Buffer> {

  const canvas = createCanvas(1024, 450)
  const ctx = canvas.getContext("2d")

  const assent = assets.image.get("WELCOME")

  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const [bg, avatarImg, guildIconImg, overlay] = await Promise.all([
    getImage(background),
    getImage(avatar),
    getImage(guildIcon),
    loadImage(assent)
  ])

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)
  ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height)

  ctx.textAlign = "center"

  ctx.font = "45px Bold"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(username, canvas.width - 890, canvas.height - 60)

  ctx.font = "22px Bold"
  ctx.fillText(`- ${memberCount}th member !`, 90, canvas.height - 15)

  const name = guildName.length > 13 ? guildName.substring(0, 10) + "..." : guildName

  ctx.font = "45px Bold"
  ctx.fillText(name, canvas.width - 225, canvas.height - 44)

  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = 10
  ctx.strokeStyle = "#ffffff"
  ctx.arc(180, 160, 110, 0, Math.PI * 2)
  ctx.stroke()
  ctx.clip()
  ctx.drawImage(avatarImg, 45, 40, 270, 270)
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = 10
  ctx.strokeStyle = "#ffffff"
  ctx.arc(canvas.width - 150, canvas.height - 200, 80, 0, Math.PI * 2)
  ctx.stroke()
  ctx.clip()
  ctx.drawImage(guildIconImg, canvas.width - 230, canvas.height - 280, 160, 160)
  ctx.restore()

  return canvas.toBuffer("image/jpeg", { quality: quality / 100 })
}

export default async function welcomeHandler(req: Request, res: Response) {

  const {
    username,
    guildName,
    guildIcon,
    memberCount,
    avatar,
    background,
    quality
  } = req.query

  if (!username || !guildName || !guildIcon || !memberCount || !avatar || !background) {
    return res.status(400).json({
      status: false,
      message: "Semua parameter wajib diisi"
    })
  }

  try {

    const buffer = await generateWelcomeImage(
      username as string,
      guildName as string,
      guildIcon as string,
      parseInt(memberCount as string),
      avatar as string,
      background as string,
      parseInt((quality as string) || "90")
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