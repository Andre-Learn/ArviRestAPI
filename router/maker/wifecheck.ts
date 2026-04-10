import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"

export default async function wifeCheckAPI(req: Request, res: Response) {
    const imageUrl = (req.query.image as string)?.trim()
    if (!imageUrl) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'image' diperlukan. Contoh: /api/wifecheck?image=URL_GAMBAR"
        })
    }

    try {

        const [userImg, template] = await Promise.all([
            loadImage(imageUrl),
            loadImage('https://files.catbox.moe/ns0e1n.jpg')
        ])

        const canvas = createCanvas(template.width, template.height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(template, 0, 0)


        const boxX = 740
        const boxY = 380
        const boxW = 600
        const boxH = 600
        const aspect = userImg.width / userImg.height
        let srcX, srcY, srcW, srcH

        if (aspect > boxW / boxH) {
            srcH = userImg.height
            srcW = srcH * (boxW / boxH)
            srcX = (userImg.width - srcW) / 2
            srcY = 0
        } else {
            srcW = userImg.width
            srcH = srcW / (boxW / boxH)
            srcX = 0
            srcY = (userImg.height - srcH) / 2
        }


        ctx.shadowColor = '#00FFFF'
        ctx.shadowBlur = 25

        ctx.drawImage(userImg, srcX, srcY, srcW, srcH, boxX, boxY, boxW, boxH)

        const buffer = canvas.toBuffer("image/png")
        res.setHeader("Content-Type", "image/png")
        res.send(buffer)
    } catch (err: any) {
        console.error("[WIFECHECK API ERROR]", err)
        res.status(500).json({
            status: false,
            message: err.message || "Gagal membuat Wife Detector"
        })
    }
}
