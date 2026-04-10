import { Request, Response } from "express"
import * as Canvas from "canvas"
import axios from "axios"
import moment from "moment-timezone"

export default async function fakegroup(req: Request, res: Response) {
  const image = (req.query.image as string)?.trim()
  const name = (req.query.name as string)?.trim() || "SiwakPrst"
  const members = parseInt((req.query.members as string) || "100")
  const desc = (req.query.desc as string)?.trim() || ""
  const date = (req.query.date as string)?.trim() || ""

  if (!image) {
    return res.status(400).json({
      status: false,
      message: "parameter 'image' diperlukan"
    })
  }

  try {

    const imgBuffer = (await axios.get(image, { responseType: "arraybuffer" })).data
    const bgBuffer = (await axios.get(
      "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1773085031352.jpeg",
      { responseType: "arraybuffer" }
    )).data

    const bg = await Canvas.loadImage(bgBuffer)
    const ppImg = await Canvas.loadImage(imgBuffer)

    const W = bg.width
    const H = bg.height

    const canvas = Canvas.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, W, H)

    const CX = W / 2
    const ppCY = Math.round(H * 0.128)
    const ppR = Math.round(H * 0.082)

    ctx.save()
    ctx.beginPath()
    ctx.arc(CX, ppCY, ppR, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(ppImg, CX - ppR, ppCY - ppR, ppR * 2, ppR * 2)
    ctx.restore()

    const nameY = ppCY + ppR + Math.round(H * 0.052)

    ctx.textAlign = "center"
    ctx.fillStyle = "#ffffff"
    ctx.font = `300 ${Math.round(H * 0.030)}px sans-serif`
    ctx.fillText(name, CX, nameY)

    const subY = nameY + Math.round(H * 0.042)

    ctx.fillStyle = "#9e9e9e"
    ctx.font = `300 ${Math.round(H * 0.021)}px sans-serif`
    ctx.fillText(`Grup • ${members} anggota`, CX, subY)

    const descBlockY = Math.round(H * 0.515)
    const leftPad = Math.round(W * 0.035)
    const fontSize = Math.round(H * 0.021)
    const smallFontSize = Math.round(H * 0.018)
    const lineH = Math.round(H * 0.028)

    ctx.textAlign = "left"

    if (desc) {

      ctx.fillStyle = "#ffffff"
      ctx.font = `300 ${fontSize}px sans-serif`

      const maxWidth = W - leftPad * 2
      const words = desc.split(" ")

      let line = ""
      let lineY = descBlockY

      for (let word of words) {
        let test = line ? line + " " + word : word

        if (ctx.measureText(test).width > maxWidth && line) {
          ctx.fillText(line, leftPad, lineY)
          line = word
          lineY += lineH
        } else {
          line = test
        }
      }

      if (line) ctx.fillText(line, leftPad, lineY)

    } else {

      ctx.fillStyle = "#25D366"
      ctx.font = `300 ${fontSize}px sans-serif`
      ctx.fillText("Tambah deskripsi grup", leftPad, descBlockY)

    }

    const time = moment().tz("Asia/Jakarta").format("HH.mm")

    const dibuatLabel = date
      ? `Dibuat pada ${date}`
      : `Dibuat oleh Anda, hari ini pukul ${time}`

    const dibuatY = descBlockY + Math.round(H * 0.042)

    ctx.fillStyle = "#9e9e9e"
    ctx.font = `300 ${smallFontSize}px sans-serif`
    ctx.fillText(dibuatLabel, leftPad, dibuatY)

    const buffer = canvas.toBuffer("image/jpeg")

    res.setHeader("Content-Type", "image/jpeg")
    res.setHeader("Cache-Control", "public, max-age=3600")

    res.send(buffer)

  } catch (err: any) {

    res.status(500).json({
      status: false,
      message: err.message || "gagal memproses gambar"
    })

  }
}