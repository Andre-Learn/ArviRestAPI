import { Request, Response } from "express"
import * as cheerio from "cheerio"
import axios from "axios"

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function searchAnidb(query: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(
        `https://anidb.net/anime/?adb.search=${encodeURIComponent(query)}&do.search=1`,
        {
          timeout: 15000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/91.0.4472.77 Mobile Safari/537.36",
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9"
          }
        }
      )

      const $ = cheerio.load(data)
      const results: any[] = []

      $("#animelist tbody tr").each((_, row) => {
        const $row = $(row)

        const id = $row.attr("id")?.replace("a", "")
        const title = $row.find("td.name a").first().text().trim()
        const url = "https://anidb.net" + $row.find("td.name a").attr("href")
        const type = $row.find("td.type").text().trim()
        const eps = $row.find("td.eps").text().trim()
        const rating = $row.find("td.rating.weighted").text().trim()
        const aired = $row.find("td.airdate").text().trim()
        const ended = $row.find("td.enddate").text().trim()
        const thumb = $row.find("img").attr("src") || null

        if (title) {
          results.push({
            id,
            title,
            url,
            type,
            eps,
            rating,
            aired,
            ended,
            thumb
          })
        }
      })

      return results
    } catch (e) {
      if (i < retries - 1) await sleep(2000 * (i + 1))
      else throw e
    }
  }
}

export default async function anidbHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await searchAnidb(q)

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