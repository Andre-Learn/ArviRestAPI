import { Request, Response } from "express"
import baLogo from "ba-logo"

export default async function balogo(req: Request, res: Response) {
  const text = req.query.text as string

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' diperlukan"
    })
  }

  try {
    const image = await baLogo(text)
    const buffer = await image.toBuffer()

    res.setHeader("Content-Type", "image/png")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat BA Logo"
    })
  }
}