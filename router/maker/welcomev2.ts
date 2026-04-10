import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage, registerFont } from "canvas"
import assets from "@putuofc/assetsku"

registerFont(assets.font.get("CUBESTMEDIUM"), { family: "CubestMedium" })

async function getImage(url: string, fallback: string) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" })
    return await loadImage(Buffer.from(res.data))
  } catch {
    return await loadImage(fallback)
  }
}

async function generateWelcomeV2Image(
  username: string,
  guildName: string,
  memberCount: number,
  avatar: string,
  background: string
): Promise<Buffer> {

  const canvas = createCanvas(512, 256)
  const ctx = canvas.getContext("2d")

  const frame = assets.image.get("WELCOME2")

  const [bg, frameImg, avatarImg] = await Promise.all([
    getImage(background, assets.image.get("DEFAULT_BG")),
    loadImage(frame),
    getImage(avatar, assets.image.get("DEFAULT_AVATAR"))
  ])

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)
  ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.beginPath()
  ctx.rotate((-17 * Math.PI) / 180)
  ctx.strokeStyle = "white"
  ctx.lineWidth = 3
  ctx.drawImage(avatarImg, -4, 110, 96, 96)
  ctx.strokeRect(-4, 110, 96, 96)
  ctx.restore()

  const guild = guildName.length > 10 ? guildName.substring(0, 10) + "..." : guildName

  ctx.font = "18px CubestMedium"
  ctx.textAlign = "center"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(guild, 336, 158)

  ctx.font = "700 18px Courier New"
  ctx.textAlign = "left"
  ctx.fillText(`${memberCount}th member`, 214, 248)

  const user = username.length > 12 ? username.substring(0, 15) + "..." : username

  ctx.font = "700 24px Courier New"
  ctx.fillText(user, 208, 212)

  return canvas.toBuffer("image/png")
}

export default async function welcomeV2Handler(req: Request, res: Response) {

  const { username, guildName, memberCount, avatar, background } = req.query

  if (!username || !guildName || !memberCount || !avatar || !background) {
    return res.status(400).json({
      status: false,
      message: "Parameter username, guildName, memberCount, avatar, dan background wajib diisi"
    })
  }

  try {

    const buffer = await generateWelcomeV2Image(
      username as string,
      guildName as string,
      parseInt(memberCount as string),
      avatar as string,
      background as string
    )

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}