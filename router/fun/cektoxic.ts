import { Request, Response } from "express"
import axios from "axios"

export default async function cektoxic(req: Request, res: Response) {
  const name = (req.query.name as string)?.trim()

  if (!name) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'name' diperlukan"
    })
  }

  try {
    const { data } = await axios.get(
      "https://raw.githubusercontent.com/KazzTzyPrivat7777/database2/main/cektoxic.json"
    )

    const level = Math.floor(Math.random() * 100) + 1
    const template = data[level.toString()] || "{nama} memiliki tingkat toxic yang misterius..."

    const result = template.replace("{nama}", name)

    res.json({
      status: true,
      name,
      level,
      result
    })

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal memproses cek toxic"
    })
  }
}
