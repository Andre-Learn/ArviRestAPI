import { Request, Response } from "express"
import axios from "axios"

async function githubDl(url: string) {
  const cleanUrl = url.replace(/\.git$/, "")

  const { data } = await axios.get("https://api.siputzx.my.id/api/d/github", {
    params: { url: cleanUrl }
  })

  if (!data.status || !data.data?.download_url) {
    throw new Error("Gagal mendapatkan file repository")
  }

  return {
    repo: data.data.repo,
    download: data.data.download_url
  }
}

export default async function githubHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await githubDl(q)

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

