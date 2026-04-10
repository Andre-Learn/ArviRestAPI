import { Request, Response } from "express"
import axios from "axios"
import * as cheerio from "cheerio"

async function gsmArenaSearch(query: string) {
  const searchUrl = "https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=" + encodeURIComponent(query)

  const { data } = await axios.get(searchUrl, {
    headers: { "User-Agent": "Mozilla/5.0" }
  })

  const $ = cheerio.load(data)
  const first = $(".makers li").first()

  if (!first.length) throw new Error("Tidak ditemukan")

  const href = first.find("a").attr("href")
  const detailUrl = "https://www.gsmarena.com/" + href

  const { data: detailData } = await axios.get(detailUrl, {
    headers: { "User-Agent": "Mozilla/5.0" }
  })

  const $$ = cheerio.load(detailData)

  const name = $$("h1").first().text().trim()
  const image = $$(".specs-photo-main img").attr("src")

  const specs: any = {}

  $$("#specs-list table").each((_, table) => {
    const category = $$(table).find("th").first().text().trim()
    if (!category) return

    specs[category] = {}

    $$(table).find("tr").each((_, row) => {
      const key = $$(row).find("td").first().text().trim()
      const val = $$(row).find("td").last().text().trim()
      if (key && val) specs[category][key] = val
    })
  })

  return { name, image, specs }
}

export default async function gsmHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await gsmArenaSearch(q)

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