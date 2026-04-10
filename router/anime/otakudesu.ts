import { Request, Response } from "express"
import fetch from "node-fetch"
import * as cheerio from "cheerio"

async function searchOtakuDesu(query: string) {
  const url = `https://otakudesu.blog/?s=${encodeURIComponent(query)}&post_type=anime`

  const res = await fetch(url)
  const html = await res.text()
  const $ = cheerio.load(html)

  const results: any[] = []

  $("ul.chivsrc li").each((i, el) => {
    const title = $(el).find("h2 a").text().trim()
    const link = $(el).find("h2 a").attr("href")
    const thumb = $(el).find("img").attr("src")

    const status = $(el)
      .find(".set")
      .filter((i, e) => $(e).text().includes("Status"))
      .text()
      .replace("Status :", "")
      .trim()

    const rating = $(el)
      .find(".set")
      .filter((i, e) => $(e).text().includes("Rating"))
      .text()
      .replace("Rating :", "")
      .trim()

    const genres = $(el)
      .find(".set a[href*='/genres/']")
      .map((i, e) => $(e).text())
      .get()
      .join(", ")

    if (title) {
      results.push({
        title,
        link,
        thumb,
        status,
        rating,
        genres
      })
    }
  })

  return results
}

export default async function otakudesuHandler(
  req: Request,
  res: Response
) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await searchOtakuDesu(q)

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