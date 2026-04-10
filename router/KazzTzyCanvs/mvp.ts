import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"

async function generateSertifikat(name: string) {
    const backgroundUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230577235.jpeg"
    
    const response = await axios.get(backgroundUrl, { responseType: 'arraybuffer' })
    const bg = await loadImage(Buffer.from(response.data))

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    ctx.font = "bold 32px Arial"
    ctx.fillStyle = "#918A81"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    ctx.fillText(name, 640, 530)

    return canvas.toBuffer("image/png")
}

export default async function sertifikatHandler(req: Request, res: Response) {
    const text = (req.query.text || req.body.text) as string

    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' diperlukan"
        })
    }

    if (text.length > 20) {
        return res.status(400).json({
            status: false,
            message: "Nama terlalu panjang! Maksimal 20 karakter."
        })
    }

    try {
        const buffer = await generateSertifikat(text)

        res.setHeader("Content-Type", "image/png")
        res.setHeader("Cache-Control", "public, max-age=3600")
        res.send(buffer)
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message || "Gagal membuat sertifikat"
        })
    }
}