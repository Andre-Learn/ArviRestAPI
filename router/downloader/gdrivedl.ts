import { Request, Response } from "express"
import axios from "axios"

async function gdriveDl(url: string) {
  const { data } = await axios.get("https://api.siputzx.my.id/api/d/gdrive", {
    params: { url }
  })

  if (!data.status || !data.data) {
    throw new Error("Gagal mengambil data Google Drive")
  }

  const { name, download, link } = data.data

  return {
    name,
    download: link || download
  }
}

export default async function gdriveHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await gdriveDl(q)

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