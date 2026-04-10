import { Request, Response } from "express"
import axios from "axios"
import * as cheerio from "cheerio"

const hdrs = {
  "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://www.iq.com/"
}

const typeOf: any = { 1: "Movie", 2: "Drama", 3: "Anime", 4: "Variety" }

async function searchIQ(query: string) {
  const res = await axios.get(`https://www.iq.com/search?query=${encodeURIComponent(query)}&originInput=Drama`, { headers: hdrs })
  const $ = cheerio.load(res.data)

  const raw = $("#__NEXT_DATA__").text()
  if (!raw) throw new Error("fail error")

  const parsed = JSON.parse(raw)
  const result = parsed?.props?.initialState?.search?.result
  if (!result) throw new Error("gada hasilnya")

  const videos = (result.videos || []).slice(0, 15)

  return videos.map((v: any) => ({
    title: v.name?.replace(/<[^>]+>/g, "").trim(),
    year: v.publishYear || "",
    type: typeOf[v.chnId] || "Other",
    episodes: v.marks?.left_bottom?.text || "",
    rating: v.marks?.right_top?.num || "",
    url: "https:" + (v.albumUrl || v.url || "")
  }))
}

export default async function iqHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await searchIQ(q)

    return res.json({
      status: true,
      total: result.length,
      result
    })
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      message: err.message
    })
  }
}