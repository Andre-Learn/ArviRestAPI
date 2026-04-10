import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"

try { registerFont(path.join(__dirname, "Arial Bold.ttf"), { family: "Arial" }) } catch(e) { /* font fallback */ }

export default async function fakeigstory(req: Request, res: Response) {
  const nama = (req.query.nama as string)?.trim()
  const imageUrl = (req.query.image as string)?.trim()

  if (!nama || !imageUrl) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'nama' dan 'image' diperlukan"
    })
  }

  try {
    const [background, userImage, profilePic] = await Promise.all([
      loadImage("https://files.catbox.moe/p8kg6c.jpg"),
      loadImage(imageUrl),
      loadImage("https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg")
    ])

    const canvas = createCanvas(1080, 1910)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    const imgWidth = 1025
    const imgHeight = 865
    const imgX = (canvas.width - imgWidth) / 2
    const imgY = 520
    ctx.drawImage(userImage, imgX, imgY, imgWidth, imgHeight)

    const profileY = 410
    const profileSize = 100
    ctx.save()
    ctx.beginPath()
    ctx.arc(100, profileY + profileSize / 2, profileSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(profilePic, 50, profileY, profileSize, profileSize)
    ctx.restore()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 36px Arial"
    ctx.fillText(nama, 170, profileY + 60)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat Fake IG Story"
    })
  }
}