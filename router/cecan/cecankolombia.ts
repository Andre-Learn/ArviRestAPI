import { Request, Response } from "express"
import path from "path"
import fs from "fs"

export default async function handler(req: Request, res: Response) {
  try {
    const filePath = path.join(process.cwd(), "data", "cecan", "cecankolombia.json")
    const raw = fs.readFileSync(filePath, "utf-8")
    const data = JSON.parse(raw)

    const random = Math.floor(Math.random() * data.length)
    const imageUrl = data[random].url

    const axios = require("axios")
    const image = await axios.get(imageUrl, { responseType: "stream" })
    const contentType = image.headers["content-type"] || "image/jpeg"

    res.setHeader("Content-Type", contentType)
    image.data.pipe(res)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal memproses request"
    })
  }
}
