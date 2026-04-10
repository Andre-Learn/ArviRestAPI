import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"
import assets from "./assetsku"

export default async function artemis(req: Request, res: Response) {
const text = (req.query.text as string)?.trim()

if (!text) {
return res.status(400).json({
status: false,
message: "Parameter 'text' diperlukan"
})
}

try {
const bg = await loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772225866720.jpeg")
const canvas = createCanvas(bg.width, bg.height)
const ctx = canvas.getContext("2d")
ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

const maxWidth = 460
let fontSize = 62
ctx.fillStyle = "#000000"
ctx.textAlign = "left"

do {
ctx.font = `bold ${fontSize}px Sans`
fontSize--
} while (ctx.measureText(text).width > maxWidth && fontSize > 30)

ctx.fillText(text.toUpperCase(), 580, 245)

const buffer = canvas.toBuffer("image/png")
res.setHeader("Content-Type", "image/png")
res.send(buffer)

} catch (err: any) {
res.status(500).json({
status: false,
message: err.message || "Gagal membuat Artemis"
})
}
}