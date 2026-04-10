import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage, registerFont } from "canvas"
import assets from "@putuofc/assetsku"

export default async function bree(req: Request, res: Response) {
  const text1 = (req.query.text1 as string)?.trim()
  const text2 = (req.query.text2 as string)?.trim()

  if (!text1 || !text2) {
    return res.status(400).json({
      status: false,
      message: "parameter 'text1' dan 'text2' diperlukan"
    })
  }

  try {
    registerFont(assets.font.get("ARRIAL"), { family: "Arial" })

    const bgUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229516482.jpeg"
    const imgRes = await axios.get(bgUrl, { responseType: "arraybuffer" })
    const background = await loadImage(Buffer.from(imgRes.data))

    const canvas = createCanvas(background.width, background.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

    let longest = text1.length > text2.length ? text1 : text2
    let fontSize = 280
    if (longest.length > 5) fontSize = 200
    if (longest.length > 10) fontSize = 150
    if (longest.length > 15) fontSize = 110
    if (longest.length > 20) fontSize = 85
    if (longest.length > 30) fontSize = 65

    const drawText = (txt: string, x: number, y: number, size: number) => {
      ctx.font = `bold ${size}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "#000000"

      const words = txt.trim().split(" ")
      let lines: string[] = []
      let current = words[0]
      const maxWidth = canvas.width * 0.45

      for (let i = 1; i < words.length; i++) {
        const test = current + " " + words[i]
        if (ctx.measureText(test).width < maxWidth) {
          current = test
        } else {
          lines.push(current)
          current = words[i]
        }
      }
      lines.push(current)

      const lineHeight = size * 1.1
      const total = lines.length * lineHeight
      let start = y - total / 2 + lineHeight / 2

      lines.forEach((line, i) => {
        ctx.fillText(line, x, start + i * lineHeight)
      })
    }

    drawText(text1, canvas.width * 0.74, canvas.height * 0.25, fontSize)
    drawText(text2, canvas.width * 0.74, canvas.height * 0.75, fontSize)

    const buffer = canvas.toBuffer("image/jpeg")
    res.setHeader("Content-Type", "image/jpeg")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "gagal memproses gambar"
    })
  }
}