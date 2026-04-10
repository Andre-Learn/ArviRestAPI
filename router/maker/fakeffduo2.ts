import { Request, Response } from "express"
import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"
import axios from "axios"

registerFont(path.join(__dirname, "Teuton.otf"), { family: "TeutonNormal" })

const backgroundList = [
  "https://c.termai.cc/i175/Ndfd77.png",
  "https://c.termai.cc/i164/bdnffju.png",
  "https://c.termai.cc/i131/4wN1.png",
  "https://c.termai.cc/i145/q5i.png",
  "https://c.termai.cc/i110/T8E30.png",
  "https://c.termai.cc/i152/6nE.png",
  "https://c.termai.cc/i133/GXNy.png",
  "https://c.termai.cc/i159/tlsd3.png",
  "https://c.termai.cc/i107/ISYzi.png",
  "https://c.termai.cc/i134/QidVBXY.png",
  "https://c.termai.cc/i193/dCFnhz.png",
  "https://c.termai.cc/i157/lTloB.png",
  "https://c.termai.cc/i196/HShrLCn.png",
  "https://c.termai.cc/i147/QoueNU.png",
  "https://c.termai.cc/i173/4rXxXa.png",
  "https://c.termai.cc/i160/WK3.png",
  "https://c.termai.cc/i185/ndo.png",
  "https://c.termai.cc/i106/IAd.png",
  "https://c.termai.cc/i162/oG52.png",
  "https://c.termai.cc/i155/pPqxDM.png",
  "https://c.termai.cc/i107/OmCL9Z.png",
  "https://c.termai.cc/i193/ZV70w.png",
  "https://c.termai.cc/i181/64WZ.png",
  "https://c.termai.cc/i107/81YdaWd.png",
  "https://c.termai.cc/i192/k2Bax.png",
  "https://c.termai.cc/i158/mQYG8.png",
  "https://c.termai.cc/i102/JejsTc.png",
  "https://c.termai.cc/i151/Gwj.png",
  "https://c.termai.cc/i133/pDruK0.png",
  "https://c.termai.cc/i138/TuW.png"
]

export default async function fakeffduo(req: Request, res: Response) {
  const name1 = req.query.name1 as string
  const name2 = req.query.name2 as string
  const bgRaw = req.query.bg as string

  if (!name1 || !name2) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'name1' dan 'name2' diperlukan"
    })
  }

  try {
    const max = backgroundList.length
    let index: number

    if (!bgRaw || bgRaw === "rand" || bgRaw === "random") {
      index = Math.floor(Math.random() * max)
    } else {
      const n = parseInt(bgRaw)
      if (isNaN(n) || n < 1 || n > max) {
        return res.status(400).json({
          status: false,
          message: `Background harus 1 - ${max}`
        })
      }
      index = n - 1
    }

    const bgBuffer = await axios.get(backgroundList[index], { responseType: "arraybuffer" }).then(r => r.data)
    const bg = await loadImage(bgBuffer)

    const canvas = createCanvas(bg.width, bg.height)
    const ctx = canvas.getContext("2d")

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height)

    ctx.font = 'bold 38px "TeutonNormal"'
    ctx.textAlign = "center"

    ctx.fillStyle = "#ffffff"
    ctx.fillText(name1, 212, canvas.height - 314)
    ctx.fillStyle = "#ffb300"
    ctx.fillText(name1, 212, canvas.height - 314)
    ctx.strokeStyle = "rgba(0,0,0,0.8)"
    ctx.lineWidth = 1.6
    ctx.strokeText(name1, 212, canvas.height - 314)

    ctx.fillStyle = "#ffffff"
    ctx.fillText(name2, 740, canvas.height - 434)
    ctx.fillStyle = "#ffb300"
    ctx.fillText(name2, 740, canvas.height - 434)
    ctx.strokeStyle = "rgba(0,0,0,0.8)"
    ctx.lineWidth = 1.6
    ctx.strokeText(name2, 740, canvas.height - 434)

    const buffer = canvas.toBuffer("image/png")
    res.setHeader("Content-Type", "image/png")
    res.send(buffer)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}