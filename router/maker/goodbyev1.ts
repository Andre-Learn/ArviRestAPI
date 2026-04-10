import { Request, Response } from 'express'
import axios from "axios"
import { createCanvas, loadImage, registerFont } from "canvas"
import assets from "@putuofc/assetsku"

registerFont(assets.font.get("THEBOLDFONT"), { family: "Bold" })

async function getImage(urlOrBuffer: string | Buffer): Promise<any> {
    if (Buffer.isBuffer(urlOrBuffer)) return await loadImage(urlOrBuffer)
    const response = await axios.get(urlOrBuffer, { responseType: 'arraybuffer' })
    return await loadImage(Buffer.from(response.data))
}

async function generateGoodbyeImage(
  username: string,
  guildName: string,
  guildIcon: string,
  memberCount: number,
  avatar: string,
  background: string,
  quality: number,
): Promise<Buffer> {
  const canvas = createCanvas(1024, 450)
  const ctx = canvas.getContext("2d")

  const colorUsername = "#ffffff"
  const colorMemberCount = "#ffffff"
  const colorMessage = "#ffffff"
  const colorAvatar = "#ffffff"
  const colorBackground = "#000000"
  const textMemberCount = "- {count}th member !"
  const assent = assets.image.get("GOODBYE")

  ctx.fillStyle = colorBackground
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  const [bg, overlay, av, gIcon] = await Promise.all([
      getImage(background),
      loadImage(assent),
      getImage(avatar),
      getImage(guildIcon)
  ])

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)
  ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height)

  ctx.font = "45px Bold"
  ctx.textAlign = "center"
  ctx.fillStyle = colorUsername
  ctx.fillText(username, canvas.width - 890, canvas.height - 60)

  ctx.fillStyle = colorMemberCount
  ctx.font = "22px Bold"
  ctx.fillText(textMemberCount.replace(/{count}/g, memberCount.toString()), 90, canvas.height - 15)

  ctx.font = "45px Bold"
  ctx.textAlign = "center"
  ctx.fillStyle = colorMessage
  const name = guildName.length > 13 ? guildName.substring(0, 10) + "..." : guildName
  ctx.fillText(name, canvas.width - 225, canvas.height - 44)

  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = 10
  ctx.strokeStyle = colorAvatar
  ctx.arc(180, 160, 110, 0, Math.PI * 2, true)
  ctx.stroke()
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(av, 45, 40, 270, 270)
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  ctx.lineWidth = 10
  ctx.strokeStyle = colorAvatar
  ctx.arc(canvas.width - 150, canvas.height - 200, 80, 0, Math.PI * 2, true)
  ctx.stroke()
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(gIcon, canvas.width - 230, canvas.height - 280, 160, 160)
  ctx.restore()

  return canvas.toBuffer("image/jpeg", { quality: quality / 100 })
}

export default async function goodbyeHandler(req: Request, res: Response) {
  try {
    const { username, guildName, guildIcon, memberCount, avatar, background, quality } = req.query

    if (!username || !guildName || !guildIcon || !memberCount || !avatar || !background) {
        return res.status(400).json({
            status: false,
            error: "Parameter username, guildName, guildIcon, memberCount, avatar, dan background wajib diisi."
        })
    }

    const q = parseInt(quality as string) || 100
    const mCount = parseInt(memberCount as string)

    const buffer = await generateGoodbyeImage(
        username as string,
        guildName as string,
        guildIcon as string,
        mCount,
        avatar as string,
        background as string,
        q
    )

    res.set({
      "Content-Type": "image/jpeg",
      "Content-Length": buffer.length,
      "Cache-Control": "public, max-age=3600"
    })

    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      error: err.message || "Internal Server Error"
    })
  }
}