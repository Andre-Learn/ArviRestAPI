import { Request, Response } from "express"
import axios from "axios"

export default async function bratvidHandler(req: Request, res: Response) {
  const text = (req.query.text || req.body?.text) as string
  const delay = (req.query.delay || req.body?.delay || 700) as any

  if (!text || typeof text !== "string" || !text.trim()) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' diperlukan.",
    })
  }

  try {
    const delayMs = Math.max(100, Math.min(1500, parseInt(delay) || 700))
    const cleanText = text.trim().split(/\s+/).slice(0, 10).join(" ")

    const url = `https://brat.siputzx.my.id/gif?text=${encodeURIComponent(
      cleanText
    )}&delay=${delayMs}`

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
        Accept: "image/gif,image/*,*/*;q=0.8",
      },
      timeout: 30000,
    })

    res.set("Content-Type", "image/gif")
    res.set("Cache-Control", "public, max-age=3600")
    res.send(response.data)
  } catch (error: any) {
    res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    })
  }
}