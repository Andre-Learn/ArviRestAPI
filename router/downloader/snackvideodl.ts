import { Request, Response } from "express"
import axios from "axios"

async function snackVideo(url: string) {
  const { data } = await axios.get("https://api.deline.web.id/downloader/snackvideo", {
    params: { url }
  })

  if (!data.status || !data.result?.video) {
    throw new Error("Gagal mendapatkan link video")
  }

  return {
    video: data.result.video
  }
}

export default async function snackHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await snackVideo(q)

    return res.json({
      status: true,
      result
    })
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      message: err.message
    })
  }
}