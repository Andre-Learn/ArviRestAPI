import { Request, Response } from 'express'
import { createCanvas, loadImage } from 'canvas'
import axios from 'axios'

async function generateLevelUp(
    backgroundURL: string,
    avatarURL: string,
    fromLevel: string,
    toLevel: string,
    name: string
): Promise<Buffer> {
    const width = 600
    const height = 150
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext("2d")

    const [bgImg, avImg] = await Promise.all([
        axios.get(backgroundURL, { responseType: 'arraybuffer' }).then(res => loadImage(Buffer.from(res.data))),
        axios.get(avatarURL, { responseType: 'arraybuffer' }).then(res => loadImage(Buffer.from(res.data)))
    ])

    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(bgImg, 0, 0, width, height)

    const overlayX = 10
    const overlayY = 10
    const overlayWidth = width - 20
    const overlayHeight = height - 20
    const overlayRadius = 40

    ctx.save()
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.beginPath()
    ctx.moveTo(overlayX + overlayRadius, overlayY)
    ctx.arcTo(overlayX + overlayWidth, overlayY, overlayX + overlayWidth, overlayY + overlayHeight, overlayRadius)
    ctx.arcTo(overlayX + overlayWidth, overlayY + overlayHeight, overlayX, overlayY + overlayHeight, overlayRadius)
    ctx.arcTo(overlayX, overlayY + overlayHeight, overlayX, overlayY, overlayRadius)
    ctx.arcTo(overlayX, overlayY, overlayX + overlayWidth, overlayY, overlayRadius)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = "#FFCC33"
    ctx.lineWidth = 8
    ctx.stroke()
    ctx.restore()

    const avatarSize = 100
    const avatarX = overlayX + overlayRadius + 10
    ctx.save()
    ctx.beginPath()
    ctx.arc(avatarX + avatarSize / 2, height / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    ctx.drawImage(avImg, avatarX, height / 2 - avatarSize / 2, avatarSize, avatarSize)
    ctx.restore()

    ctx.beginPath()
    ctx.arc(avatarX + avatarSize / 2, height / 2, avatarSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.strokeStyle = "#FFCC33"
    ctx.lineWidth = 4
    ctx.stroke()

    ctx.font = "bold 28px Arial"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "left"
    ctx.fillText(name, avatarX + avatarSize + 20, height / 2 + 10)

    const circleSize = 55
    const circleX1 = width - circleSize * 4 + 10
    const circleX2 = width - circleSize * 2 - 8
    const arrowX = circleX1 + circleSize + 10

    ctx.beginPath()
    ctx.arc(circleX1 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = "rgba(255, 204, 51, 0.3)"
    ctx.fill()
    ctx.strokeStyle = "#FFCC33"
    ctx.lineWidth = 4
    ctx.stroke()

    ctx.font = "bold 24px Arial"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.fillText(fromLevel, circleX1 + circleSize / 2, height / 2 + 8)

    ctx.beginPath()
    ctx.moveTo(arrowX, height / 2 - 8)
    ctx.lineTo(arrowX + 20, height / 2)
    ctx.lineTo(arrowX, height / 2 + 8)
    ctx.closePath()
    ctx.fillStyle = "#FFCC33"
    ctx.fill()

    ctx.beginPath()
    ctx.arc(circleX2 + circleSize / 2, height / 2, circleSize / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = "rgba(255, 204, 51, 0.3)"
    ctx.fill()
    ctx.strokeStyle = "#FFCC33"
    ctx.lineWidth = 4
    ctx.stroke()

    ctx.font = "bold 24px Arial"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.fillText(toLevel, circleX2 + circleSize / 2, height / 2 + 8)

    return canvas.toBuffer("image/png")
}

export default async function levelUpHandler(req: Request, res: Response) {
    try {
        const { backgroundURL, avatarURL, fromLevel, toLevel, name } = req.query

        if (!backgroundURL || !avatarURL || !fromLevel || !toLevel || !name) {
            return res.status(400).json({
                status: false,
                error: "Semua parameter (backgroundURL, avatarURL, fromLevel, toLevel, name) wajib diisi."
            })
        }

        const buffer = await generateLevelUp(
            backgroundURL as string,
            avatarURL as string,
            fromLevel as string,
            toLevel as string,
            name as string
        )

        res.set({
            "Content-Type": "image/png",
            "Content-Length": buffer.length,
            "Cache-Control": "public, max-age=3600"
        })

        res.send(buffer)
    } catch (err: any) {
        res.status(500).json({
            status: false,
            error: err.message || "Internal Server Error"
        })
    }
}