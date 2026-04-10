import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import axios from "axios"
import assets from "./assetsku"

function roundedRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}

export default async function chatBubbleHandler(req: Request, res: Response) {
    const name = (req.query.name as string)?.trim() || "User"
    const text = (req.query.text as string)?.trim()
    const colorStr = (req.query.color as string)?.trim() || "#ffffff"
    const profileUrl = (req.query.url as string)?.trim()

    if (!text) {
        res.status(400)
        res.setHeader("Content-Type", "text/plain")
        return res.send("Parameter 'text' wajib diisi")
    }

    try {
        registerFont(assets.font.get("ARRIAL"), { family: "Arial" })

        const scale = 2
        const canvasWidth = 800 * scale
        const padding = 25 * scale
        const profileSize = 60 * scale
        const profileGap = 20 * scale
        const messageX = padding + profileSize + profileGap
        
        const tempCanvas = createCanvas(canvasWidth, 200)
        const tempCtx = tempCanvas.getContext('2d')
        const nameFontSize = 20 * scale
        const messageFontSize = 24 * scale
        
        tempCtx.font = `${messageFontSize}px Arial`
        const words = text.split(' ')
        let line = ''
        const lines = []
        const maxTextWidth = canvasWidth - messageX - padding - (40 * scale)

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' '
            if (tempCtx.measureText(testLine).width > maxTextWidth && n > 0) {
                lines.push(line)
                line = words[n] + ' '
            } else {
                line = testLine
            }
        }
        lines.push(line)

        const lineHeight = messageFontSize * 1.5
        const bubbleHeight = (lines.length * lineHeight) + (40 * scale)
        const totalHeight = Math.max(padding + 40 * scale + bubbleHeight + padding, (padding * 2) + profileSize)

        const canvas = createCanvas(canvasWidth, totalHeight)
        const ctx = canvas.getContext('2d')

        if (profileUrl) {
            try {
                const imgBuffer = await axios.get(profileUrl, { responseType: 'arraybuffer' })
                const img = await loadImage(Buffer.from(imgBuffer.data))
                ctx.save()
                ctx.beginPath()
                ctx.arc(padding + profileSize/2, padding + profileSize/2, profileSize/2, 0, Math.PI * 2)
                ctx.clip()
                ctx.drawImage(img, padding, padding, profileSize, profileSize)
                ctx.restore()
            } catch (e) {
                ctx.fillStyle = '#cccccc'
                ctx.beginPath()
                ctx.arc(padding + profileSize/2, padding + profileSize/2, profileSize/2, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        ctx.fillStyle = '#333333'
        ctx.font = `bold ${nameFontSize}px Arial`
        ctx.fillText(name, messageX, padding + nameFontSize)

        const bubbleY = padding + nameFontSize + (10 * scale)
        const colors = colorStr.split(',')
        if (colors.length > 1) {
            const grad = ctx.createLinearGradient(messageX, bubbleY, messageX + 200, bubbleY + bubbleHeight)
            colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c.trim()))
            ctx.fillStyle = grad
        } else {
            ctx.fillStyle = colorStr
        }

        let maxW = 0
        lines.forEach(l => {
            const w = tempCtx.measureText(l).width
            if (w > maxW) maxW = w
        })
        const bubbleWidth = maxW + (50 * scale)

        roundedRect(ctx, messageX, bubbleY, bubbleWidth, bubbleHeight, 20 * scale)
        ctx.fill()

        ctx.fillStyle = '#000000'
        ctx.font = `${messageFontSize}px Arial`
        let currentY = bubbleY + (30 * scale) + (messageFontSize * 0.5)
        lines.forEach(l => {
            ctx.fillText(l.trim(), messageX + (25 * scale), currentY)
            currentY += lineHeight
        })

        const buffer = canvas.toBuffer('image/png')
        res.setHeader("Content-Type", "image/png")
        res.send(buffer)

    } catch (err: any) {
        console.error(err)
        res.status(500)
        res.setHeader("Content-Type", "text/plain")
        res.send("Gagal membuat Chat Bubble: " + err.message)
    }
}