import { Request, Response } from "express"
import * as canvafy from "canvafy"

async function generateWelcomeImageV4(
  avatar: string,
  background: string,
  description: string
): Promise<Buffer> {

  const image = await new canvafy.WelcomeLeave()
    .setAvatar(avatar)
    .setBackground("image", background)
    .setDescription(description)
    .setBorder("#2a2e35")
    .setAvatarBorder("#2a2e35")
    .setOverlayOpacity(0.3)
    .build()

  return image
}

export default async function welcomev4(req: Request, res: Response) {

  const { avatar, background, description } = req.query

  if (!avatar || !background || !description) {
    return res.status(400).json({
      status: false,
      message: "Parameter avatar, background, dan description wajib diisi"
    })
  }

  try {

    const buffer = await generateWelcomeImageV4(
      avatar as string,
      background as string,
      description as string
    )

    res.setHeader("Content-Type", "image/png")
    res.setHeader("Cache-Control", "public, max-age=3600")
    res.send(buffer)

  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message
    })
  }
}