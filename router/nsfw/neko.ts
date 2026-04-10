import { Request, Response } from 'express'

export default async function nekoHandler(req: Request, res: Response) {
  try {
    const r = await fetch('https://api.waifu.pics/nsfw/neko')
    const j = await r.json()
    const img = await fetch(j.url)
    const buf = Buffer.from(await img.arrayBuffer())
    res.set('Content-Type', 'image/png')
    res.send(buf)
  } catch {
    res.status(500).json({ status: false })
  }
}