import { Request, Response } from "express"
import { createCanvas } from "canvas"

export default async function pornhubLogo(req: Request, res: Response) {
  const text1 = (req.query.text1 as string)?.trim()
  const text2 = (req.query.text2 as string)?.trim()

  if (!text1 || !text2) {
    return res.status(400).json({
      status: false,
      message: "parameter 'text1' dan 'text2' diperlukan"
    })
  }

  try {
    const canvas = createCanvas(1000, 300)
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    let fontSize = 100
    const maxWidth = 900

    ctx.textBaseline = "middle"
    ctx.fillStyle = "#ffffff"

    do {
      ctx.font = `bold ${fontSize}px sans-serif`
      fontSize--
    } while (ctx.measureText(text1 + " " + text2).width > maxWidth && fontSize > 30)

    const padding = 80
    const y = canvas.height / 2

    ctx.fillText(text1, padding, y)

    const width1 = ctx.measureText(text1).width
    const rectX = padding + width1 + 20
    const rectWidth = ctx.measureText(text2).width + 60
    const rectHeight = fontSize + 20
    const rectY = (canvas.height - rectHeight) / 2
    const radius = 20

    ctx.fillStyle = "#ff9900"
    ctx.beginPath()
    ctx.moveTo(rectX + radius, rectY)
    ctx.lineTo(rectX + rectWidth - radius, rectY)
    ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius)
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius)
    ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight)
    ctx.lineTo(rectX + radius, rectY + rectHeight)
    ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius)
    ctx.lineTo(rectX, rectY + radius)
    ctx.quadraticCurveTo(rectX, rectY, rectX + radius, rectY)
    ctx.closePath()
    ctx.fill()

    ctx.fillStyle = "#000000"
    ctx.fillText(text2, rectX + 30, y)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "gagal membuat logo"
    })
  }
}