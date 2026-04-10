import { Request, Response } from 'express'
import * as canvafy from "canvafy"

export default async function goodbyeV4Handler(req: Request, res: Response) {
  try {
    const { avatar, background, description } = req.query

    if (!avatar || !background || !description) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'avatar', 'background', dan 'description' wajib diisi."
      })
    }

    const image = await new canvafy.WelcomeLeave()
      .setAvatar(avatar as string)
      .setBackground("image", background as string)
      .setTitle("Goodbye")
      .setDescription(description as string)
      .setBorder("#2a2e35")
      .setAvatarBorder("#2a2e35")
      .setOverlayOpacity(0.3)
      .build()

    res.set({
      "Content-Type": "image/png",
      "Content-Length": image.length,
      "Cache-Control": "public, max-age=3600"
    })

    res.send(image)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      error: err.message || "Internal Server Error"
    })
  }
}