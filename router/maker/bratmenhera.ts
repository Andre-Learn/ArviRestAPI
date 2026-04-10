import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage, registerFont } from "canvas"
import assets from "@putuofc/assetsku"

export default async function bratmenhera(req: Request, res: Response) {
    const text = (req.query.text as string)?.trim()

    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' wajib diisi"
        })
    }

    try {
        registerFont(assets.font.get("ARRIAL"), { family: "Arial" })

        const resImg = await axios.get("https://c.termai.cc/i145/qJsN.jpg", { responseType: "arraybuffer" })
        const background = await loadImage(Buffer.from(resImg.data, "binary"))

        const canvas = createCanvas(background.width, background.height)
        const ctx = canvas.getContext("2d")
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height)

        let fontSize = 400
        const maxWidth = 480
        const maxHeight = 310
        const centerX = canvas.width / 2 + 25
        const centerY = 260

        const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu

        const getSegments = (str: string) => {
            const segments: any[] = []
            let lastIdx = 0
            let match
            while ((match = emojiRegex.exec(str)) !== null) {
                if (match.index > lastIdx) {
                    segments.push({ type: "text", content: str.slice(lastIdx, match.index) })
                }
                segments.push({ type: "emoji", content: match[0] })
                lastIdx = emojiRegex.lastIndex
            }
            if (lastIdx < str.length) {
                segments.push({ type: "text", content: str.slice(lastIdx) })
            }
            return segments
        }

        const segments = getSegments(text)
        const uniqueEmojis = [...new Set(segments.filter((s) => s.type === "emoji").map((s) => s.content))]
        const emojiImages: Record<string, any> = {}

        await Promise.all(
            uniqueEmojis.map(async (emoji) => {
                try {
                    const codePoint = emoji.codePointAt(0)?.toString(16)
                    const apiUrl = `https://cdn.jsdelivr.net/gh/realityripple/emoji/apple/${codePoint}.png`
                    const response = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 5000 })
                    emojiImages[emoji] = await loadImage(Buffer.from(response.data))
                } catch {}
            })
        )

        let lines: any[] = []
        let currentFontSize = fontSize

        const wrapLines = (fSize: number) => {
            ctx.font = `bold ${fSize}px Arial`
            let resultLines: any[] = []
            let currentLine: any[] = []
            let currentWidth = 0

            for (const seg of segments) {
                if (seg.type === "text") {
                    const words = seg.content.split(" ")
                    for (let i = 0; i < words.length; i++) {
                        let word = words[i] + (i === words.length - 1 ? "" : " ")
                        let wordWidth = ctx.measureText(word).width

                        if (wordWidth > maxWidth) {
                            for (let char of word) {
                                let charWidth = ctx.measureText(char).width
                                if (currentWidth + charWidth > maxWidth) {
                                    resultLines.push({ segments: currentLine, width: currentWidth })
                                    currentLine = []
                                    currentWidth = 0
                                }
                                currentLine.push({ type: "text", content: char, width: charWidth })
                                currentWidth += charWidth
                            }
                        } else if (currentWidth + wordWidth > maxWidth && currentLine.length > 0) {
                            resultLines.push({ segments: currentLine, width: currentWidth })
                            currentLine = [{ type: "text", content: word, width: wordWidth }]
                            currentWidth = wordWidth
                        } else {
                            currentLine.push({ type: "text", content: word, width: wordWidth })
                            currentWidth += wordWidth
                        }
                    }
                } else {
                    let emojiSize = fSize * 1.15
                    if (currentWidth + emojiSize > maxWidth && currentLine.length > 0) {
                        resultLines.push({ segments: currentLine, width: currentWidth })
                        currentLine = []
                        currentWidth = 0
                    }
                    currentLine.push({ type: "emoji", content: seg.content, width: emojiSize })
                    currentWidth += emojiSize
                }
            }

            if (currentLine.length > 0) resultLines.push({ segments: currentLine, width: currentWidth })
            return resultLines
        }

        while (currentFontSize > 25) {
            lines = wrapLines(currentFontSize)
            let totalH = lines.length * (currentFontSize * 0.92)
            if (totalH <= maxHeight) break
            currentFontSize -= 2
        }

        const lineHeight = currentFontSize * 0.92
        const totalBlockHeight = lines.length * lineHeight
        let startY = centerY - totalBlockHeight / 2 + currentFontSize / 2

        ctx.fillStyle = "#000000"
        ctx.textBaseline = "middle"

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i]
            let xOffset = centerX - line.width / 2
            let yPos = startY + i * lineHeight

            for (const seg of line.segments) {
                if (seg.type === "text") {
                    ctx.font = `bold ${currentFontSize}px Arial`
                    ctx.fillText(seg.content, xOffset, yPos)
                    xOffset += seg.width
                } else {
                    const img = emojiImages[seg.content]
                    const size = currentFontSize * 1.15
                    if (img) {
                        ctx.drawImage(img, xOffset, yPos - size / 2, size, size)
                        xOffset += size
                    } else {
                        ctx.font = `${currentFontSize}px Arial`
                        ctx.fillText(seg.content, xOffset, yPos)
                        xOffset += ctx.measureText(seg.content).width
                    }
                }
            }
        }

        const buffer = canvas.toBuffer("image/png")

        res.setHeader("Content-Type", "image/png")
        res.send(buffer)

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message || "Gagal memproses gambar"
        })
    }
}