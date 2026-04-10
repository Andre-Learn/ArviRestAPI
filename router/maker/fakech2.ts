import { Request, Response } from "express"
import * as Canvas from "canvas"
import axios from "axios"

export default async function fakech2(req: Request, res: Response) {
  const image = (req.query.image as string)?.trim()
  const chName = (req.query.name as string)?.trim() || "Channel Name"
  const followers = parseInt((req.query.followers as string) || "0")
  const deskripsi = (req.query.desc as string)?.trim() || ""
  const tanggal = (req.query.date as string)?.trim() || ""
  const akun = (req.query.reach as string)?.trim() || ""
  const bersih = (req.query.clean as string)?.trim() || ""

  if (!image) {
    return res.status(400).json({
      status: false,
      message: "parameter 'image' diperlukan"
    })
  }

  try {
    const imgBuffer = (await axios.get(image, { responseType: "arraybuffer" })).data
    const bgBuffer = (await axios.get(
      "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1773145191597.jpeg",
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
    const ppR = Math.round(W * 0.155)
    const ppCY = Math.round(H * 0.115)

    ctx.save()
    ctx.beginPath()
    ctx.arc(CX, ppCY, ppR, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(ppImg, CX - ppR, ppCY - ppR, ppR * 2, ppR * 2)
    ctx.restore()

    const nameY = ppCY + ppR + Math.round(H * 0.030)

    ctx.textAlign = "center"
    ctx.fillStyle = "#ffffff"

    let nameFontSize = Math.round(H * 0.028)
    ctx.font = `300 ${nameFontSize}px sans-serif`

    while (ctx.measureText(chName).width > W * 0.9 && nameFontSize > 22) {
      nameFontSize -= 2
      ctx.font = `300 ${nameFontSize}px sans-serif`
    }

    ctx.fillText(chName, CX, nameY)

    const subY = nameY + Math.round(H * 0.040)
    ctx.fillStyle = "#cccccc"
    ctx.font = `300 ${Math.round(H * 0.020)}px sans-serif`
    ctx.fillText(`Saluran • ${followers} pengikut`, CX, subY)

    const leftPad = Math.round(W * 0.05)

    if (deskripsi) {
      const descY = Math.round(H * 0.478)

      ctx.fillStyle = "#ffffff"
      ctx.font = `100 ${Math.round(H * 0.021)}px sans-serif`
      ctx.textAlign = "left"

      const maxW = W - leftPad * 2
      const words = deskripsi.split(" ")

      let line = ""
      let ly = descY
      const lh = Math.round(H * 0.028)

      for (let word of words) {
        let test = line ? line + " " + word : word

        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, leftPad, ly)
          line = word
          ly += lh
        } else {
          line = test
        }
      }

      if (line) ctx.fillText(line, leftPad, ly)
    }

    if (tanggal) {
      const dibuatY = Math.round(H * 0.522)

      ctx.textAlign = "left"
      ctx.fillStyle = "#aaaaaa"
      ctx.font = `300 ${Math.round(H * 0.019)}px sans-serif`

      ctx.fillText(`Dibuat pada ${tanggal}`, leftPad, dibuatY)
    }

    if (akun) {
      const akunNumY = Math.round(H * 0.660)

      ctx.fillStyle = "#ffffff"
      ctx.font = `300 ${Math.round(H * 0.022)}px sans-serif`
      ctx.fillText(akun, Math.round(W * 0.08), akunNumY)

      ctx.font = `300 ${Math.round(H * 0.018)}px sans-serif`
      ctx.fillText("Akun dijangkau", Math.round(W * 0.08), akunNumY + Math.round(H * 0.025))
    }

    if (bersih) {
      const bersihNumY = Math.round(H * 0.660)

      ctx.fillStyle = "#ffffff"
      ctx.font = `300 ${Math.round(H * 0.022)}px sans-serif`
      ctx.fillText(bersih, Math.round(W * 0.55), bersihNumY)

      ctx.font = `300 ${Math.round(H * 0.018)}px sans-serif`
      ctx.fillText("Pengikut bersih", Math.round(W * 0.55), bersihNumY + Math.round(H * 0.025))
    }

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