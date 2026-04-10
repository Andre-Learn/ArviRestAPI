import { Request, Response } from "express"
import axios from "axios"

export default async function handler(req: Request, res: Response) {
  try {
    const { data: links } = await axios.get("https://raw.githubusercontent.com/Leoo7z/Image-Source/main/image/boruto.json")
    if (!links || !links.length) throw new Error("List gambar kosong")
    const random = links[Math.floor(Math.random() * links.length)]
    const imageUrl = typeof random === "string" ? random : random.url
    if (!imageUrl) throw new Error("URL gambar tidak ditemukan")
    const image = await axios.get(imageUrl, { responseType: "stream" })
    const contentType = image.headers["content-type"] || "image/jpeg"
    res.setHeader("Content-Type", contentType)
    image.data.pipe(res)
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message || "Internal Server Error" })
  }
}
