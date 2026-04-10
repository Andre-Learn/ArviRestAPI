import { Request, Response } from 'express'
import { Tweet } from 'canvafy'

export default async function tweetHandler(req: Request, res: Response) {
  try {
    const name = (req.query.name || req.body.name) as string
    const username = (req.query.username || req.body.username) as string
    const comment = (req.query.comment || req.body.comment) as string
    const avatar = (req.query.avatar || req.body.avatar) as string || 'https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg'

    if (!name || !username || !comment) {
      return res.status(400).json({
        status: false,
        error: "Parameter 'name', 'username', dan 'comment' wajib diisi."
      })
    }

    const tweetBuffer = await new Tweet()
      .setTheme('dim')
      .setUser({ displayName: name, username: username })
      .setVerified(true)
      .setComment(comment)
      .setAvatar(avatar)
      .build()

    res.set({
      "Content-Type": "image/png",
      "Content-Length": tweetBuffer.length,
      "Cache-Control": "public, max-age=3600"
    })

    res.send(tweetBuffer)
  } catch (err: any) {
    res.status(500).json({
      status: false,
      error: err.message || "Internal Server Error"
    })
  }
}