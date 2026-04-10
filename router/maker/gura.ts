import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"

async function gura(image) {

  const backgroundImg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772958827300.png")
  const inputImg = await loadImage(image)

  const canvas = createCanvas(backgroundImg.width, backgroundImg.height)
  const ctx = canvas.getContext("2d")

  ctx.drawImage(backgroundImg, 0, 0)

  const boxX = 395
  const boxY = 200
  const boxWidth = 310
  const boxHeight = 310

  const imgAspectRatio = inputImg.width / inputImg.height

  let sourceX, sourceY, sourceWidth, sourceHeight

  if (imgAspectRatio > 1) {
    sourceHeight = inputImg.height
    sourceWidth = inputImg.height
    sourceX = (inputImg.width - sourceWidth) / 2
    sourceY = 0
  } else {
    sourceWidth = inputImg.width
    sourceHeight = inputImg.width
    sourceX = 0
    sourceY = (inputImg.height - sourceHeight) / 2
  }

  ctx.drawImage(
    inputImg,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    boxX,
    boxY,
    boxWidth,
    boxHeight
  )

  return canvas.toBuffer("image/png")
}

export default async function guraHandler(req: Request, res: Response) {
  try {

    const { image } = req.query

    if (!image) {
      return res.status(400).json({
        status: false,
        message: "Parameter image wajib diisi"
      })
    }

    const buffer = await gura(image)

    res.set({
      "Content-Type": "image/png",
      "Content-Length": buffer.length,
      "Cache-Control": "public, max-age=3600"
    })

    res.send(buffer)

  } catch (err) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}