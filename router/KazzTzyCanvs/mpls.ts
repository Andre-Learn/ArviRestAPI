import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"

export default async function mpls(req: Request, res: Response) {
  const imageUrl = req.query.image as string
  if (!imageUrl) return res.status(400).json({ status: false, message: "Parameter 'image' diperlukan" })

  try {
    const twibbonURL = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230464821.png"

    const [userBuffer, twibbonBuffer] = await Promise.all([
      axios.get(imageUrl, { responseType: "arraybuffer" }).then(r => r.data),
      axios.get(twibbonURL, { responseType: "arraybuffer" }).then(r => r.data)
    ])

    const [fotoUser, twibbon] = await Promise.all([
      loadImage(userBuffer),
      loadImage(twibbonBuffer)
    ])

    const canvas = createCanvas(twibbon.width, twibbon.height)
    const ctx = canvas.getContext("2d")

    const circleX = 600
    const circleY = 533
    const radius = 420

    const aspect = fotoUser.width / fotoUser.height
    let srcX, srcY, srcW, srcH

    if (aspect > 1) {
      srcH = fotoUser.height
      srcW = fotoUser.height
      srcX = (fotoUser.width - srcW) / 2
      srcY = 0
    } else {
      srcW = fotoUser.width
      srcH = fotoUser.width
      srcX = 0
      srcY = (fotoUser.height - srcH) / 2
    }

    ctx.save()
    ctx.beginPath()
    ctx.arc(circleX, circleY, radius, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(fotoUser, srcX, srcY, srcW, srcH, circleX - radius, circleY - radius, radius * 2, radius * 2)
    ctx.restore()

    ctx.drawImage(twibbon, 0, 0)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message || "Gagal membuat Twibbon MPLS" })
  }
}


