import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"


registerFont(
  path.join(__dirname, "Arial Bold.ttf"),
  { family: "ArialBold" }
)

export default async function musiccard(req: Request, res: Response) {
  const image = (req.query.image as string)?.trim()
  const judul = (req.query.judul as string)?.trim()
  const nama = (req.query.nama as string)?.trim()

  if (!image || !judul || !nama) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'image', 'judul', dan 'nama' diperlukan"
    })
  }

  try {
    const userImg = await loadImage(image)
    const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230520824.jpeg")

    const canvas = createCanvas(512, 900)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    const frameX = 64
    const frameY = 130
    const frameSize = 384

    const imgRatio = userImg.width / userImg.height
    let drawW, drawH

    if (imgRatio > 1) {
      drawH = frameSize
      drawW = frameSize * imgRatio
    } else {
      drawW = frameSize
      drawH = frameSize / imgRatio
    }

    drawW *= 1.25
    drawH *= 1.25

    const dx = frameX - (drawW - frameSize) / 2
    const dy = frameY - (drawH - frameSize) / 2

    ctx.save()
    ctx.beginPath()
    ctx.roundRect(frameX, frameY, frameSize, frameSize, 28)
    ctx.clip()
    ctx.drawImage(userImg, dx, dy, drawW, drawH)
    ctx.restore()

    const textX = 70
    ctx.textAlign = "left"

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 20px ArialBold"
    ctx.fillText(judul, textX, 565)

    ctx.fillStyle = "#c7c7cc"
    ctx.font = "bold 17px ArialBold"
    ctx.fillText(nama, textX, 593)

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