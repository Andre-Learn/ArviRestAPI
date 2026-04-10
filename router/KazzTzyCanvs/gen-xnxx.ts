import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage } from "canvas"

export default async function fakeXnxxHandler(req: Request, res: Response) {
  try {
    const { title, image } = req.query

    if (!title || !image) {
      return res.status(400).json({
        status: false,
        message: "Parameter 'title' dan 'image' diperlukan."
      })
    }

    const bgUrl = "https://files.catbox.moe/d4moy2.png"

    const [bgRes, imgRes] = await Promise.all([
      axios.get(bgUrl, { responseType: "arraybuffer" }),
      axios.get(image as string, { responseType: "arraybuffer" })
    ])

    const bgBuffer = Buffer.from(bgRes.data)
    const imgBuffer = Buffer.from(imgRes.data)

    const [background, userImg] = await Promise.all([
      loadImage(bgBuffer),
      loadImage(imgBuffer)
    ])

    const canvas = createCanvas(720, 790)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    ctx.drawImage(userImg, 0, 20, 720, 457)

    const text =
      title.toString().length > 20
        ? title.toString().substring(0, 20) + "..."
        : title.toString()

    ctx.font = "700 45px Arial"
    ctx.textAlign = "left"
    ctx.fillStyle = "white"
    ctx.fillText(text, 30, 535)

    const buffer = canvas.toBuffer("image/png")

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