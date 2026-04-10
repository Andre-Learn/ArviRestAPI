import { Request, Response } from "express"
import { createCanvas, loadImage } from "canvas"
import axios from "axios"
import assets from "./assetsku"

export default async function fakedev(req: Request, res: Response) {
const text = req.query.text as string
const verified = (req.query.verified as string)?.toLowerCase() === "true"
const imageUrl = req.query.image as string

if (!text || !imageUrl) {
return res.status(400).json({
status: false,
message: "Parameter 'text' dan 'image' diperlukan"
})
}

try {

const userImgRes = await axios.get(imageUrl, { responseType: "arraybuffer" })
const userImage = await loadImage(Buffer.from(userImgRes.data))

const bgURL = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772226320613.jpeg"
const blueTick = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772220719294.jpeg"

const [bgRes, tickRes] = await Promise.all([
axios.get(bgURL, { responseType: "arraybuffer" }),
axios.get(blueTick, { responseType: "arraybuffer" })
])

const bgImg = await loadImage(Buffer.from(bgRes.data))
const tickImg = await loadImage(Buffer.from(tickRes.data))

const canvas = createCanvas(1080, 1080)
const ctx = canvas.getContext("2d")

ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height)

const centerX = canvas.width / 2
const centerY = canvas.height / 2
const radius = 263

ctx.save()
ctx.beginPath()
ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
ctx.closePath()
ctx.clip()
ctx.drawImage(userImage, centerX - radius, centerY - radius, radius * 2, radius * 2)
ctx.restore()

ctx.strokeStyle = "#000"
ctx.lineWidth = 6
ctx.beginPath()
ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
ctx.stroke()

ctx.save()
ctx.font = "bold 72px 'Segoe UI', 'Arial Black', Arial"
ctx.fillStyle = "#fff"
ctx.textAlign = "center"
ctx.textBaseline = "middle"

const arcSpan = Math.PI * 0.55
const textRadius = radius + 75
const chars = text.toUpperCase().split("")
const n = chars.length
const angleIncrement = n > 1 ? arcSpan / (n - 1) : 0
const start = Math.PI / 2 + arcSpan / 2

for (let i = 0; i < n; i++) {
const angle = start - i * angleIncrement
const x = centerX + Math.cos(angle) * textRadius
const y = centerY + Math.sin(angle) * textRadius

ctx.save()
ctx.translate(x, y)
ctx.rotate(angle - Math.PI / 2)
ctx.strokeStyle = "#000"
ctx.lineWidth = 3
ctx.strokeText(chars[i], 0, 0)
ctx.fillText(chars[i], 0, 0)
ctx.restore()
}

ctx.restore()

if (verified) {
ctx.drawImage(
tickImg,
centerX + Math.cos(0) * (radius + 60) - 35,
centerY - 35,
70,
70
)
}

const buffer = canvas.toBuffer("image/png")
res.setHeader("Content-Type", "image/png")
res.send(buffer)

} catch (err: any) {
res.status(500).json({
status: false,
message: err.message || "Gagal membuat Fakedev"
})
}
}