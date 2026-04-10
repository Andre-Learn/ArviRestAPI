import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

export default async function bohaysmaHandler(req: Request, res: Response) {
  try {
    const filePath = path.join(__dirname, 'bdsm.json')
    const rawData = fs.readFileSync(filePath, 'utf-8')
    const urls: string[] = JSON.parse(rawData)

    if (!Array.isArray(urls) || urls.length === 0) throw new Error('List gambar kosong')

    const randomUrl = urls[Math.floor(Math.random() * urls.length)]
    const imageResponse = await fetch(randomUrl)
    if (!imageResponse.ok) throw new Error('Gagal mengambil gambar')

    const buffer = Buffer.from(await imageResponse.arrayBuffer())
    const contentType = imageResponse.headers.get('content-type') || 'image/png'
    res.setHeader('Content-Type', contentType)
    res.send(buffer)
  } catch (error: any) {
    res.status(500).json({ status: false, message: error?.message || 'Internal Server Error' })
  }
}


