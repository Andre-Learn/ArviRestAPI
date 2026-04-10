import { Request, Response } from "express"
import axios from "axios"
import { zencf } from "zencf"

function randomUserAgent() {
  const list = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Mozilla/5.0 (X11; Linux x86_64)",
    "Mozilla/5.0 (Android 13; Mobile)"
  ]
  return list[Math.floor(Math.random() * list.length)]
}

function baseHeaders(extra: any = {}) {
  return {
    "user-agent": randomUserAgent(),
    "content-type": "application/json",
    origin: "https://spotidownloader.com",
    referer: "https://spotidownloader.com/",
    ...extra
  }
}

async function getToken() {
  const { token } = await zencf.turnstileMin(
    "https://spotidownloader.com/en13",
    "0x4AAAAAAA8QAiFfE5GuBRRS"
  )

  const res = await axios.post(
    "https://api.spotidownloader.com/session",
    { token },
    { headers: baseHeaders() }
  )

  return res.data.token
}

async function searchSpotify(query: string, bearer: string) {
  const res = await axios.post(
    "https://api.spotidownloader.com/search",
    { query },
    {
      headers: baseHeaders({
        authorization: `Bearer ${bearer}`
      })
    }
  )

  return res.data
}

async function downloadSpotify(id: string, bearer: string) {
  const res = await axios.post(
    "https://api.spotidownloader.com/download",
    { id },
    {
      headers: baseHeaders({
        authorization: `Bearer ${bearer}`
      })
    }
  )

  return res.data
}

async function spotify(input: string) {
  const bearer = await getToken()

  if (/spotify\.com\/track\//i.test(input)) {
    const id = input.split("/track/")[1].split("?")[0]
    return downloadSpotify(id, bearer)
  }

  if (/^[a-zA-Z0-9]{22}$/.test(input)) {
    return downloadSpotify(input, bearer)
  }

  return searchSpotify(input, bearer)
}

export default async function spotifyHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await spotify(q)

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