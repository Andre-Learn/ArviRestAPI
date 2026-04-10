import { Request, Response } from "express"
import * as cheerio from "cheerio"

async function tiktokDl(url: string) {
  const body = new URLSearchParams({
    q: url,
    cursor: "0",
    page: "0",
    lang: "id"
  }).toString()

  const res = await fetch("https://savetik.io/api/ajaxSearch", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "x-requested-with": "XMLHttpRequest",
      "user-agent": "Mozilla/5.0",
      "origin": "https://savetik.io",
      "referer": "https://savetik.io/id/download-tiktok-photos",
      "accept": "*/*"
    },
    body
  })

  const json = await res.json()
  const html = typeof json.data === "string" ? json.data : ""

  if (!html) throw new Error("Gagal mengambil data")

  const $ = cheerio.load(html)

  const mp4 =
    $('a:contains("Unduh MP4 [1]")').attr("href") ||
    $('a:contains("Unduh MP4 [2]")').attr("href") ||
    $('a:contains("Unduh MP4 HD")').attr("href") ||
    null

  const mp3 = $('a:contains("Unduh MP3")').attr("href") || null

  const images: string[] = []
  $(".photo-list ul.download-box li").each((_, el) => {
    const img = $(el).find("a[title='Unduh Gambar']").attr("href")
    if (img) images.push(img)
  })

  return {
    video: mp4,
    audio: mp3,
    images
  }
}

export default async function tiktokHandler(req: Request, res: Response) {
  const q = (req.query.q || req.body.q) as string

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    })
  }

  try {
    const result = await tiktokDl(q)

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