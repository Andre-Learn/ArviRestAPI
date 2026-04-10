import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import axios from "axios"
import path from "path"


try { registerFont(path.join(__dirname, "Arial Bold.ttf"), { family: "ArialBold" }) } catch(e) { /* font fallback */ }

export default async function fakecall(req: Request, res: Response) {
  const nama = (req.query.nama as string)?.trim()
  const waktu = (req.query.waktu as string)?.trim()
  const imageUrl = (req.query.image as string)?.trim()

  if (!nama || !waktu || !imageUrl) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'nama', 'waktu', dan 'image' (URL) wajib diisi"
    })
  }

  try {
    const userBuffer = await axios.get(imageUrl, { responseType: "arraybuffer" }).then(r => r.data)
    const avatar = await loadImage(userBuffer)
    const background = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772795447473.jpeg")

    const canvas = createCanvas(background.width, background.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    const avatarSize = 220
    const avatarX = (canvas.width - avatarSize) / 2
    const avatarY = 430
    ctx.save()
    ctx.beginPath()
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize)
    ctx.restore()

    ctx.textAlign = "center"
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 32px ArialBold"
    ctx.fillText(nama, canvas.width / 2, 100)

    ctx.font = "18px ArialBold"
    ctx.fillStyle = "#dddddd"
    ctx.fillText(waktu, canvas.width / 2, 140)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    console.error("[FAKECALL ERROR]", err)
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat Fake Call"
    })
  }
}