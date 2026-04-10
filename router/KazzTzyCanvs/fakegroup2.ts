import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage } from "canvas"

export default async function fakegroup2(req: Request, res: Response) {

const name = (req.query.name as string)?.trim() || "Area Developer"
const members = (req.query.members as string)?.trim() || "999"
const image = (req.query.image as string)?.trim()

if (!image) {
return res.status(400).json({
status: false,
message: "Parameter 'image' diperlukan"
})
}

try {

const bgRes = await axios.get(
"https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1773121459438.jpeg",
{ responseType: "arraybuffer" }
)

const imgRes = await axios.get(image,{ responseType:"arraybuffer" })

const bg = await loadImage(Buffer.from(bgRes.data))
const ppImg = await loadImage(Buffer.from(imgRes.data))

const W = bg.width
const H = bg.height

const canvas = createCanvas(W,H)
const ctx = canvas.getContext("2d")

ctx.drawImage(bg,0,0,W,H)

const CX = W/2
const ppR = Math.round(W*0.17)
const ppCY = Math.round(H*0.225)

ctx.save()
ctx.beginPath()
ctx.arc(CX,ppCY,ppR,0,Math.PI*2)
ctx.closePath()
ctx.clip()

ctx.drawImage(ppImg,CX-ppR,ppCY-ppR,ppR*2,ppR*2)

ctx.restore()

const nameY = ppCY+ppR+Math.round(H*0.048)

ctx.textAlign="center"
ctx.fillStyle="#ffffff"

let nameFontSize = Math.round(H*0.038)

ctx.font=`bold ${nameFontSize}px sans-serif`

while(ctx.measureText(name).width>W*0.88 && nameFontSize>24){
nameFontSize-=2
ctx.font=`bold ${nameFontSize}px sans-serif`
}

ctx.fillText(name,CX,nameY)

const subY = nameY+Math.round(H*0.038)

ctx.fillStyle="#9e9e9e"
ctx.font=`300 ${Math.round(H*0.022)}px sans-serif`

ctx.fillText(`Group • ${members} anggota`,CX,subY)

const buffer = canvas.toBuffer("image/jpeg")

res.setHeader("Content-Type","image/jpeg")
res.send(buffer)

} catch(err:any){

res.status(500).json({
status:false,
message: err.message || "Gagal membuat gambar"
})

}

}