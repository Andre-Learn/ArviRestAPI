import fs from "fs"
import path from "path"
import fetch from "node-fetch"
import { createCanvas, loadImage, registerFont } from "canvas"

registerFont(path.join(__dirname, "CartoonVibes.otf"), { family: "CartoonVibes" })

async function generate(angka: string | number) {
  const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772994351989.jpeg")
  const logo = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772994319333.png")

  const canvas = createCanvas(bg.width, bg.height)
  const ctx = canvas.getContext("2d")

  ctx.drawImage(bg, 0, 0)

  ctx.font = '205px "CartoonVibes"'
  ctx.fillStyle = "white"
  ctx.textBaseline = "top"

  const x = 664
  const y = 293

  ctx.fillText(String(angka), x, y)

  const textWidth = ctx.measureText(String(angka)).width
  const jarak = 11
  const logoSize = 370
  const offsetY = -31

  const logoX = x + textWidth + jarak
  const logoY = y + offsetY

  ctx.drawImage(logo, logoX, logoY, logoSize, logoSize)

  return canvas.toBuffer("image/png")
}

export default async function fakedanaHandler(req: any, res: any) {
  try {
    const text = (req.query.text || req.body?.text) as string
    if (!text || !text.trim())
      return res.status(400).json({ status: false, message: "Parameter text diperlukan" })

    const angka = Number(text.replace(/\./g, "")).toLocaleString("id-ID")
    const buffer = await generate(angka)

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)
  } catch (e: any) {
    res.status(500).json({ status: false, message: e.message || "Gagal membuat gambar" })
  }
}