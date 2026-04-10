import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"

export default async function iqc2(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()
  const posisiRaw = (req.query.posisi as string)?.toLowerCase()
  const posisi = posisiRaw === "kanan" ? "right" : "left"

  if (!text) {
    res.status(400)
    res.setHeader("Content-Type", "text/plain")
    return res.send("Parameter 'text' diperlukan")
  }

  if (text.length > 50) {
    res.status(400)
    res.setHeader("Content-Type", "text/plain")
    return res.send("Teks maksimal 50 karakter")
  }

  try {
    const templateUrl = "https://files.catbox.moe/twko3b.jpg"
    const templateImg = await loadImage(templateUrl)

    const canvas = createCanvas(templateImg.width, templateImg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(templateImg, 0, 0)

    ctx.font = "24px sans-serif"
    ctx.fillStyle = "#ffffff"
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)"
    ctx.lineWidth = 1.2
    ctx.textBaseline = "top"

    const maxWidth = 390
    const xStart = posisi === "right"
      ? canvas.width - maxWidth - 45
      : 45

    let y = 412
    const lineHeight = 32

    const wrapTextAny = (txt: string) => {
      let line = ""
      for (let i = 0; i < txt.length; i++) {
        line += txt[i]
        if (ctx.measureText(line).width > maxWidth) {
          const out = line.slice(0, -1)
          ctx.strokeText(out, xStart, y)
          ctx.fillText(out, xStart, y)
          line = txt[i]
          y += lineHeight
        }
      }
      ctx.strokeText(line, xStart, y)
      ctx.fillText(line, xStart, y)
    }

    wrapTextAny(text)

    const buffer = canvas.toBuffer("image/jpeg")
    res.setHeader("Content-Type", "image/jpeg")
    res.send(buffer)

  } catch (err) {
    res.status(500)
    res.setHeader("Content-Type", "text/plain")
    res.send("Gagal membuat IQC2 image")
  }
}


