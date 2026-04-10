import { Request, Response } from "express"
import axios from "axios"
import { createCanvas, loadImage } from "canvas"

export default async function faketelegram(req: Request, res: Response) {

const name = (req.query.name as string)?.trim() || "Nama"
const number = (req.query.number as string)?.trim() || ""
const bio = (req.query.bio as string)?.trim() || ""
const username = (req.query.username as string)?.trim() || ""
const image = (req.query.image as string)?.trim()

if (!image) {
return res.status(400).json({
status: false,
message: "Parameter 'image' diperlukan"
})
}

try {

const bgRes = await axios.get(
"https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1773149444510.jpeg",
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

const ppR = Math.round(W*0.130)
const CX = W/2
const ppCY = Math.round(H*0.150)

ctx.save()
ctx.beginPath()
ctx.arc(CX,ppCY,ppR,0,Math.PI*2)
ctx.closePath()
ctx.clip()

ctx.drawImage(ppImg,CX-ppR,ppCY-ppR,ppR*2,ppR*2)

ctx.restore()

const nameY = ppCY+ppR+Math.round(H*0.045)

ctx.textAlign="center"
ctx.fillStyle="#ffffff"
ctx.font=`bold ${Math.round(H*0.028)}px sans-serif`

ctx.fillText(name,CX,nameY)

ctx.fillStyle="#4fa3e0"
ctx.font=`${Math.round(H*0.020)}px sans-serif`

ctx.fillText("online",CX,nameY+Math.round(H*0.033))

const leftPad=Math.round(W*0.063)

if(number){
ctx.fillStyle="#ffffff"
ctx.font=`${Math.round(H*0.022)}px sans-serif`
ctx.textAlign="left"
ctx.fillText(number,leftPad,Math.round(H*0.495))
}

if(bio){
ctx.fillStyle="#ffffff"
ctx.font=`${Math.round(H*0.022)}px sans-serif`
ctx.textAlign="left"
ctx.fillText(bio,leftPad,Math.round(H*0.590))
}

if(username){
ctx.fillStyle="#ffffff"
ctx.font=`${Math.round(H*0.022)}px sans-serif`
ctx.textAlign="left"
ctx.fillText(username,leftPad,Math.round(H*0.680))
}

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