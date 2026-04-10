import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"

registerFont(
  path.join(__dirname, "Arial Bold.ttf"),
  { family: "ArialBold" }
)

export default async function ktHandler(req: Request, res: Response) {
  const image = (req.query.image as string)?.trim()
  const text = (req.query.text as string)?.trim()

  if (!image || !text) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'image' dan 'text' (Nama|Quote) diperlukan"
    })
  }

  try {
    const [sideName, quote] = text.split("|").map(v => v.trim())
    const userImg = await loadImage(image)
    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230433382.jpeg")

    const canvas = createCanvas(1080, 1920)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    ctx.save()
    ctx.beginPath()
    ctx.arc(540, 1180, 170, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(userImg, 370, 1010, 340, 340)
    ctx.restore()

    const isLong = quote.length > 50
    ctx.fillStyle = "#111111"
    ctx.font = isLong ? "bold 54px ArialBold" : "bold 64px ArialBold"

    const maxWidth = 720
    const words = quote.split(" ")
    let lines: string[] = []
    let line = ""

    words.forEach(w => {
      const t = line + w + " "
      if (ctx.measureText(t).width > maxWidth) {
        lines.push(line)
        line = w + " "
      } else line = t
    })
    lines.push(line)

    const startY = isLong ? 380 : 450
    const lineGap = isLong ? 66 : 78

    ctx.save()
    ctx.translate(180, startY)
    ctx.rotate(-0.3)
    lines.forEach((l, i) => {
      const y = i * lineGap
      if (startY + y < 950) ctx.fillText(l.trim(), 0, y)
    })
    ctx.restore()

    ctx.save()
    ctx.translate(370, 1200)
    ctx.rotate(-Math.PI / 2)
    ctx.font = "28px ArialBold"
    ctx.fillStyle = "#555555"
    ctx.fillText(sideName || "", 0, 0)
    ctx.restore()

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