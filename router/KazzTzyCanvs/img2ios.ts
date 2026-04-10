import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"

export default async function img2ios(req: Request, res: Response) {
  const imageUrl = req.query.image as string
  if (!imageUrl) return res.status(400).json({ status: false, message: "Parameter 'image' diperlukan" })

  try {
    const templateURL = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230291185.jpeg"

    const [userBuffer, templateBuffer] = await Promise.all([
      axios.get(imageUrl, { responseType: "arraybuffer" }).then(r => r.data),
      axios.get(templateURL, { responseType: "arraybuffer" }).then(r => r.data)
    ])

    const [userImg, template] = await Promise.all([
      loadImage(userBuffer),
      loadImage(templateBuffer)
    ])

    const canvas = createCanvas(template.width, template.height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(template, 0, 0)

    const bubbleX = 36
    const bubbleY = 363
    const bubbleW = 616
    const bubbleH = 860
    const radius = 21

    const imgRatio = userImg.width / userImg.height
    const bubbleRatio = bubbleW / bubbleH
    let drawW, drawH

    if (imgRatio > bubbleRatio) {
      drawH = bubbleH
      drawW = drawH * imgRatio
    } else {
      drawW = bubbleW
      drawH = drawW / imgRatio
    }

    const offsetX = bubbleX - (drawW - bubbleW) / 2
    const offsetY = bubbleY - (drawH - bubbleH) / 2

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(bubbleX + radius, bubbleY)
    ctx.lineTo(bubbleX + bubbleW - radius, bubbleY)
    ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY, bubbleX + bubbleW, bubbleY + radius)
    ctx.lineTo(bubbleX + bubbleW, bubbleY + bubbleH - radius)
    ctx.quadraticCurveTo(bubbleX + bubbleW, bubbleY + bubbleH, bubbleX + bubbleW - radius, bubbleY + bubbleH)
    ctx.lineTo(bubbleX + radius, bubbleY + bubbleH)
    ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleH, bubbleX, bubbleY + bubbleH - radius)
    ctx.lineTo(bubbleX, bubbleY + radius)
    ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(userImg, offsetX, offsetY, drawW, drawH)
    ctx.restore()

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message || "Gagal membuat gaya iOS" })
  }
}