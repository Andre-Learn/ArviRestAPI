import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import assets from "./assetsku"

export default async function ephotoHandler(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()

  if (!text) {
    res.status(400)
    res.setHeader("Content-Type", "text/plain")
    return res.send("Parameter 'text' wajib diisi")
  }

  try {

    registerFont(assets.font.get("ARRIAL"), { family: "Arial" })

    const bgUrl = 'https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229581407.jpeg'
    const image = await loadImage(bgUrl)
    
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)

    let fontSize = text.length < 5 ? 230 : 175
    const maxWidth = 550 
    const x = 690 
    const y = 390 
    

    ctx.font = `italic bold ${fontSize}px Arial`
    
    while (ctx.measureText(text).width > maxWidth && fontSize > 40) {
      fontSize -= 2
      ctx.font = `italic bold ${fontSize}px Arial`
    }

    ctx.save() 
    ctx.translate(x, y)
    ctx.transform(1, -0.05, 0.1, 1, 0, 0) 
    
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'


    ctx.strokeStyle = '#050505'
    ctx.lineWidth = 22
    ctx.lineJoin = 'round'
    ctx.strokeText(text, 0, 0)


    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 6
    ctx.strokeText(text, 0, 0)


    ctx.fillStyle = '#a64200'
    ctx.fillText(text, 0, 0)


    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillText(text, 4, 6)

    ctx.restore() 

    const buffer = canvas.toBuffer('image/png')
    
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    console.error(err)
    res.status(500)
    res.setHeader("Content-Type", "text/plain")
    res.send("Gagal memproses gambar: " + err.message)
  }
}