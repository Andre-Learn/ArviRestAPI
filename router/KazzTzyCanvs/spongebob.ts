import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"

async function generateSpongeBob(text: string) {
    const imageUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230812753.jpeg"
    
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' })
    const img = await loadImage(Buffer.from(response.data))

    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(img, 0, 0, img.width, img.height)

    const boardX = img.width * 0.55
    const boardY = img.height * 0.18
    const boardW = img.width * 0.35
    const boardH = img.height * 0.42

    ctx.fillStyle = "#000000"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"

    function wrapText(context: any, txt: string, x: number, y: number, maxWidth: number, lineHeight: number, fill: boolean) {
        const words = txt.split(" ")
        let line = ""
        let lines = []

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + " "
            const metrics = context.measureText(testLine)
            if (metrics.width > maxWidth && i > 0) {
                lines.push(line)
                line = words[i] + " "
            } else {
                line = testLine
            }
        }
        lines.push(line)

        if (fill) {
            lines.forEach((l, i) => context.fillText(l, x, y + i * lineHeight))
        }
        return lines.length * lineHeight
    }

    let fontSize = 52
    let textHeight = Infinity

    while (fontSize > 16) {
        ctx.font = `bold ${fontSize}px Arial`
        const lineHeight = fontSize + 6
        textHeight = wrapText(ctx, text, -9999, -9999, boardW, lineHeight, false)
        if (textHeight <= boardH) break
        fontSize--
    }

    ctx.font = `bold ${fontSize}px Arial`
    wrapText(ctx, text, boardX + boardW / 2, boardY, boardW, fontSize + 6, true)

    return canvas.toBuffer("image/png")
}

export default async function spongebobHandler(req: Request, res: Response) {
    const text = (req.query.text || req.body.text) as string

    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' diperlukan"
        })
    }

    try {
        const buffer = await generateSpongeBob(text)

        res.setHeader("Content-Type", "image/png")
        res.setHeader("Cache-Control", "public, max-age=3600")
        res.send(buffer)
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message || "Gagal membuat meme"
        })
    }
}