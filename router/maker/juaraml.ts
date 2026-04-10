import { Request, Response } from "express"
import * as Canvas from "canvas"
import assets from "@putuofc/assetsku"

async function generateCertificate(name: string) {
  Canvas.registerFont(assets.font.get("ARRIAL"), { family: "Times New Roman" })

  const backgroundUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230373362.jpeg"
  const bg = await Canvas.loadImage(backgroundUrl)

  const canvas = Canvas.createCanvas(bg.width, bg.height)
  const ctx = canvas.getContext("2d")

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

  let fontSize = 45
  ctx.font = `bold italic ${fontSize}px "Times New Roman"`
  ctx.fillStyle = "#e6c85e"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"

  let maxTextWidth = 480
  while (ctx.measureText(name.toUpperCase()).width > maxTextWidth && fontSize > 10) {
    fontSize--
    ctx.font = `bold italic ${fontSize}px "Times New Roman"`
  }

  let certX = canvas.width * 0.665
  let certY = canvas.height * 0.555

  ctx.save()
  ctx.fillStyle = "#090909"
  ctx.fillRect(certX - 250, certY - 40, 500, 80)
  ctx.restore()

  ctx.fillText(name.toUpperCase(), certX, certY)

  return canvas.toBuffer("image/png")
}

export default async function mlWinnerHandler(req: Request, res: Response) {
  const { name } = req.query

  if (!name) {
    return res.status(400).json({
      status: false,
      message: "Parameter name wajib diisi."
    })
  }

  if ((name as string).length > 50) {
    return res.status(400).json({
      status: false,
      message: "Nama terlalu panjang! Maksimal 50 huruf."
    })
  }

  try {
    const buffer = await generateCertificate(name as string)

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat gambar sertifikat."
    })
  }
}