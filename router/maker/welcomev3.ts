import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage } from "canvas"
import assets from "@putuofc/assetsku"

async function getImage(url: string, fallback: string) {
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" })
    return await loadImage(Buffer.from(res.data))
  } catch {
    return await loadImage(fallback)
  }
}

async function generateWelcomeV3Image(
  username: string,
  avatar: string
): Promise<Buffer> {

  const canvas = createCanvas(650, 300)
  const ctx = canvas.getContext("2d")

  const bg = assets.image.get("WELCOME3")

  const [background, avatarImg] = await Promise.all([
    loadImage(bg).catch(() => loadImage(assets.image.get("DEFAULT_BG"))),
    getImage(avatar, assets.image.get("DEFAULT_AVATAR"))
  ])

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

  const name = username.length > 10 ? username.substring(0, 10) + "..." : username

  ctx.font = "700 45px Courier New"
  ctx.textAlign = "left"
  ctx.fillStyle = "#ffffff"
  ctx.fillText(name, 290, 338)

  ctx.font = "700 30px Courier New"
  ctx.textAlign = "center"
  ctx.fillStyle = "#000000"
  ctx.fillText(name, 325, 273)

  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = 6
  ctx.strokeStyle = "white"
  ctx.arc(325, 150, 75, 0, Math.PI * 2)
  ctx.stroke()
  ctx.clip()
  ctx.drawImage(avatarImg, 250, 75, 150, 150)
  ctx.restore()

  return canvas.toBuffer("image/png")
}

export default async function welcomeV3Handler(req: Request, res: Response) {

  const { username, avatar } = req.query

  if (!username || !avatar) {
    return res.status(400).json({
      status: false,
      message: "Parameter username dan avatar wajib diisi"
    })
  }

  try {

    const buffer = await generateWelcomeV3Image(
      username as string,
      avatar as string
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