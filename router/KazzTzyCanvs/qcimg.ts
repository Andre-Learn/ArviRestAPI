import { Request, Response } from 'express'
import { createCanvas, loadImage, registerFont } from 'canvas'
import path from 'path'

try { registerFont(path.join(__dirname, 'Poppins-Bold.ttf'), { family: 'Poppins' }) } catch(e) { /* font fallback */ }

const waifuImages = [
  'https://files.catbox.moe/3rtvux.jpg',
  'https://files.catbox.moe/lo2ykk.jpg',
  'https://files.catbox.moe/v5ks10.jpg',
  'https://files.catbox.moe/oawwlm.jpg',
  'https://files.catbox.moe/c2kief.jpg'
]

export default async function qcimgHandler(req: Request, res: Response) {
  const textTop = (req.query.textTop || req.body.textTop) as string
  const textBottom = (req.query.textBottom || req.body.textBottom) as string
  const textThird = (req.query.textThird || req.body.textThird) as string
  const bgIndex = parseInt((req.query.bg || req.body.bg) as string) - 1

  if (!textTop) {
    return res.status(400).json({ status: false, message: "Parameter 'textTop' diperlukan." })
  }

  const bgUrl = (bgIndex >= 0 && bgIndex < waifuImages.length) ? waifuImages[bgIndex] : waifuImages[Math.floor(Math.random() * waifuImages.length)]

  try {
    const bg = await loadImage(bgUrl)
    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(bg, 0, 0)
    ctx.font = 'bold 34px Poppins'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'left'
    ctx.fillText(textTop, 450, 215)

    if (textBottom) {
      ctx.font = 'italic bold 24px Poppins'
      ctx.fillText(textBottom, 450, 265)
    }

    if (textThird) {
      ctx.font = 'normal 20px Poppins'
      ctx.fillText(textThird, 450, 295)
    }

    res.setHeader('Content-Type', 'image/png')
    res.send(canvas.toBuffer('image/png'))
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message })
  }
}