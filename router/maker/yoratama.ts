import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage, registerFont } from "canvas"
import assets from "./assetsku"

export default async function yoratama(req: Request, res: Response) {
    const text = (req.query.text as string)?.trim()

    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' wajib diisi"
        })
    }

    try {
        registerFont(assets.font.get("ARRIAL"), { family: "Arial" })

        const bgUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230850644.jpeg"
        const resImg = await axios.get(bgUrl, { responseType: "arraybuffer" })
        const background = await loadImage(Buffer.from(resImg.data, "binary"))

        const canvas = createCanvas(background.width, background.height)
        const ctx = canvas.getContext("2d")

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

        const txt = text.toUpperCase()

        let fontSize = 145
        if (txt.length > 7) fontSize = 120
        if (txt.length > 10) fontSize = 95
        if (txt.length > 15) fontSize = 75
        if (txt.length > 20) fontSize = 60

        ctx.font = `bold ${fontSize}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const centerX = canvas.width * 0.845
        const centerY = canvas.height * 0.185
        const angle = 41.5 * Math.PI / 180

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(angle)

        ctx.lineJoin = "round"
        ctx.miterLimit = 2
        ctx.strokeStyle = "#40B7E5"
        ctx.lineWidth = fontSize * 0.2
        ctx.strokeText(txt, 0, 0)

        ctx.fillStyle = "#FFFFFF"
        ctx.fillText(txt, 0, 0)

        ctx.restore()

        const buffer = canvas.toBuffer("image/jpeg")

        res.setHeader("Content-Type", "image/jpeg")
        res.send(buffer)

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message || "Gagal memproses gambar"
        })
    }
}