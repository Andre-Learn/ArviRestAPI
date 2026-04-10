import { Request, Response } from "express"
import axios from "axios"
import * as canvafy from "canvafy"

async function generateShipImage(
  avatar1: string,
  avatar2: string,
  background: string,
  persen: string
): Promise<Buffer> {

  const image = await new canvafy.Ship()
    .setAvatars(avatar1, avatar2)
    .setBackground("image", background)
    .setBorder("#f0f0f0")
    .setCustomNumber(parseInt(persen))
    .setOverlayOpacity(0.5)
    .build()

  return image
}

export default async function shipHandler(req: Request, res: Response) {

  const { avatar1, avatar2, background, persen } = req.query

  if (!avatar1 || !avatar2 || !background || !persen) {
    return res.status(400).json({
      status: false,
      message: "Parameter avatar1, avatar2, background, dan persen wajib diisi"
    })
  }

  try {

    const buffer = await generateShipImage(
      avatar1 as string,
      avatar2 as string,
      background as string,
      persen as string
    )

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message || "Gagal membuat gambar ship"
    })
  }
}