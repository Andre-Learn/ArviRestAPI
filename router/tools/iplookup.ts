import { Request, Response } from "express"
import axios from "axios"

async function ipLookup(query: string) {
  const res = await axios.get(`https://whoisjson.com/api/v1/whois?domain=${query}`, {
    headers: {
      Authorization: "Token=557187f3affef2235eb0ed83a407200a08450e81deb4adead2b278af003754ca"
    }
  })

  const data = res.data
  const result: any = {}

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      result[key] = value.join(", ")
    } else {
      result[key] = value || null
    }
  }

  return result
}

export default async function ipLookupHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await ipLookup(q)

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