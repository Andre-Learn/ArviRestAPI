import { Request, Response } from "express"
import axios from "axios"
import path from "path"
import fs from "fs"

export default async function handler(req: Request, res: Response) {
  try {
    const filePath = path.join(__dirname, "bike.json")
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
    if (!data.length) throw new Error("List gambar kosong")
    const random = data[Math.floor(Math.random() * data.length)]
    const imageUrl = typeof random === "string" ? random : random.url
    if (!imageUrl) throw new Error("URL tidak ditemukan")
    const image = await axios.get(imageUrl, { responseType: "stream" })
    const contentType = image.headers["content-type"] || "image/jpeg"
    res.setHeader("Content-Type", contentType)
    image.data.pipe(res)
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message || "Internal Server Error" })
  }
}
