import { Request, Response } from "express"
import axios from "axios"
import FormData from "form-data"

export default async function carbon(req: Request, res: Response) {
  const code = req.query.code as string

  if (!code) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'code' diperlukan"
    })
  }

  try {
    const form = new FormData()
    form.append("code", code)

    const img = await axios.post(
      "https://carbonara.solopov.dev/api/cook",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Accept: "image/png"
        },
        responseType: "arraybuffer"
      }
    )

    res.set("Content-Type", "image/png")
    res.send(img.data)
  } catch (e: any) {
    res.status(500).json({
      status: false,
      message: e.message
    })
  }
}