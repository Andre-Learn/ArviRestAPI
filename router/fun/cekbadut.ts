import { Request, Response } from "express"
import axios from "axios"

export default async function handler(req: Request, res: Response) {
  const name = (req.query.name as string)?.trim()

  if (!name) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'name' diperlukan"
    })
  }

  try {
    const { data } = await axios.get(
      "https://raw.githubusercontent.com/KazzTzyPrivat7777/database2/main/cekbadut.json"
    )

    const random = Math.floor(Math.random() * Object.keys(data).length) + 1
    const template =
      data[random.toString()] || "{nama} memiliki hasil misterius."

    const result = template.replace("{nama}", name)

    res.json({
      status: true,
      name,
      result
    })

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal memproses request"
    })
  }
}
