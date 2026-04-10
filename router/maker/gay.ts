import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage } from "canvas"
import assets from "@putuofc/assetsku"

export default async function gayHandler(req: Request, res: Response) {
  try {
    const { name, avatar, num } = req.query

    if (!name || !avatar || !num) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'name', 'avatar', dan 'num' diperlukan."
      })
    }

    const bg = assets.image.get("BGAY")
    const frame = assets.image.get("GYF")

    const avatarRes = await axios.get(avatar as string, {
      responseType: "arraybuffer"
    })

    const avatarBuffer = Buffer.from(avatarRes.data)

    const [background, avatarImg, frameImg] = await Promise.all([
      loadImage(bg),
      loadImage(avatarBuffer),
      loadImage(frame)
    ])

    const canvas = createCanvas(600, 450)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(background, 0, 0, 600, 450)

    ctx.save()
    ctx.beginPath()
    ctx.strokeStyle = "white"
    ctx.lineWidth = 3
    ctx.arc(300, 160, 100, 0, Math.PI * 2)
    ctx.stroke()
    ctx.clip()

    ctx.drawImage(avatarImg, 200, 60, 200, 200)
    ctx.restore()

    ctx.drawImage(frameImg, 200, 60, 200, 200)

    const username =
      name.toString().length > 16
        ? name.toString().substring(0, 16) + " "
        : name.toString()

    ctx.font = "30px Arial"
    ctx.textAlign = "center"
    ctx.fillStyle = "#ffffff"
    ctx.fillText(`~${username}~`, 300, 300)

    ctx.font = "bold 48px Arial"
    ctx.fillStyle = "#ff4b74"
    ctx.fillText(`~ ${num} ~`, 300, 370)

    const buffer = canvas.toBuffer("image/png")

    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}