import { Request, Response } from "express"
import { createCanvas } from "canvas"
import moment from "moment"

export default async function fakexnxx(req: Request, res: Response) {
  const name = (req.query.name as string)?.trim()
  const quote = (req.query.quote as string)?.trim()
  const likes = (req.query.likes as string) || "0"
  const dislikes = (req.query.dislikes as string) || "0"

  if (!name || !quote) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'name' dan 'quote' diperlukan"
    })
  }

  try {
    const date = moment().format("MMM D, YYYY, h:mm A")

    const canvas = createCanvas(650, 320)
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = "#00008B"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, "rgba(10,35,81,1)")
    gradient.addColorStop(1, "rgba(8,28,65,1)")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "#FF0000"
    ctx.fillRect(35, 50, 40, 15)

    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(35, 65, 40, 15)

    ctx.font = "bold 24px sans-serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "left"
    ctx.fillText(name, 85, 75)

    ctx.font = "16px sans-serif"
    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.textAlign = "right"
    ctx.fillText(date, canvas.width - 45, 75)

    ctx.font = "22px sans-serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "left"

    wrapText(ctx, quote, 45, 140, canvas.width - 90, 32)

    ctx.font = "bold 20px sans-serif"
    ctx.fillStyle = "#FFFFFF"
    ctx.fillText(`👍 ${likes}`, 60, 265)

    ctx.fillStyle = "rgba(255,255,255,0.7)"
    ctx.fillText(`👎 ${dislikes}`, 140, 265)

    ctx.fillText("Reply", 220, 265)
    ctx.fillText("Report", 310, 265)

    const buffer = canvas.toBuffer("image/png")

    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat fake xnxx"
    })
  }
}

function wrapText(
  ctx: any,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ")
  let line = ""

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " "
    const width = ctx.measureText(testLine).width

    if (width > maxWidth && n > 0) {
      ctx.fillText(line, x, y)
      line = words[n] + " "
      y += lineHeight
    } else {
      line = testLine
    }
  }

  ctx.fillText(line, x, y)
}