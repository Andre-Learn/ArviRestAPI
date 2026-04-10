import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"

try { registerFont(path.join(__dirname, "Arial Bold.ttf"), { family: "Arial" }) } catch(e) { /* font fallback */ }

export default async function fakecall2(req: Request, res: Response) {
  const nama = (req.query.nama as string)?.trim()
  const waktu = (req.query.waktu as string)?.trim()
  const imageUrl = (req.query.image as string)?.trim()

  if (!nama || !waktu || !imageUrl) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'nama', 'waktu', dan 'image' diperlukan"
    })
  }

  try {
    const canvas = createCanvas(1080, 1920)
    const ctx = canvas.getContext("2d")

    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772795506424.png")
    ctx.drawImage(bg, 0, 0, 1080, 1920)

    const pp = await loadImage(imageUrl)
    const ppSize = 440
    const centerX = 540
    const centerY = 1040

    ctx.save()
    ctx.beginPath()
    ctx.arc(centerX, centerY, ppSize / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(pp, centerX - ppSize / 2, centerY - ppSize / 2, ppSize, ppSize)
    ctx.restore()

    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"

    ctx.font = "bold 72px Arial"
    ctx.fillText(nama, 540, 260)

    ctx.font = "40px Arial"
    ctx.fillText(waktu, 540, 320)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat Fake Call"
    })
  }
}