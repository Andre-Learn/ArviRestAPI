import { Request, Response } from "express"
import axios from "axios"

export default async function iqc(req: Request, res: Response) {
  const text = (req.query.text as string)?.trim()
  const chatTime = (req.query.chatTime as string)?.trim()
  const statusBarTime = (req.query.statusBarTime as string)?.trim()

  if (!text || !chatTime || !statusBarTime) {
    res.status(400)
    res.setHeader("Content-Type", "text/plain")
    return res.send("Parameter 'text', 'chatTime', dan 'statusBarTime' wajib diisi")
  }

  try {
    const url = `https://api.deline.web.id/maker/iqc?text=${encodeURIComponent(
      text
    )}&chatTime=${encodeURIComponent(
      chatTime
    )}&statusBarTime=${encodeURIComponent(statusBarTime)}`

    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/png,image/*,*/*;q=0.8",
        "Referer": "https://api.deline.web.id/"
      }
    })

    res.setHeader("Content-Type", "image/png")
    res.send(response.data)

  } catch (err) {
    res.status(500)
    res.setHeader("Content-Type", "text/plain")
    res.send("Gagal membuat IQC image")
  }
}

