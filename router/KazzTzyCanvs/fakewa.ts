import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"


try { registerFont(path.join(__dirname, "arial.ttf"), { family: "Arial" }) } catch(e) { /* font fallback */ }

export default async function fakewa(req: Request, res: Response) {
  const nama = (req.query.nama as string)?.trim()
  let nomor = (req.query.nomor as string)?.trim()
  const status = (req.query.status as string)?.trim() || "Busy"
  const imageUrl = (req.query.image as string)?.trim()

  if (!nama || !nomor) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'nama' dan 'nomor' diperlukan"
    })
  }

  if (nomor.startsWith("08")) nomor = "62" + nomor.slice(1)

  try {
    const avatarUrl = imageUrl || "https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg"
    const [avatar, background] = await Promise.all([
      loadImage(avatarUrl),
      loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230249397.jpeg")
    ])

    const canvas = createCanvas(background.width, background.height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(background, 0, 0)

    const avatarSize = 350
    const avatarX = (canvas.width - avatarSize) / 2
    const avatarY = 163
    ctx.save()
    ctx.beginPath()
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize)
    ctx.restore()

    ctx.fillStyle = "#25D366"
    ctx.font = "25px Arial"
    ctx.textAlign = "center"
    ctx.fillText("Edit", avatarX + avatarSize / 2, avatarY + avatarSize + 104)

    const startY = 760
    const gapY = 150
    ctx.textAlign = "left"
    ctx.font = "30px Arial"
    ctx.fillStyle = "#a7a4a4"
    ctx.fillText(nama, 165, startY + 25)
    ctx.fillText(status, 165, startY + gapY + 25)

    function formatNomor(n: string) {
      if (n.startsWith("62") && n.length >= 10) return `+62 ${n.slice(2,5)}-${n.slice(5,9)}-${n.slice(9)}`
      else if (n.startsWith("+")) return n
      else if (/^\d+$/.test(n)) return `+${n}`
      else return n
    }

    ctx.fillText(formatNomor(nomor), 165, startY + gapY * 2 + 25)
    ctx.fillStyle = "#25D366"
    ctx.fillText("Instagram", 165, startY + gapY * 3 + 26)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat Fake WhatsApp Profile"
    })
  }
}