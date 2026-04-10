import { Request, Response } from "express"
import axios from "axios"

export default async function animeSearchText(req: Request, res: Response) {
  const query = (req.query.q as string)?.trim()

  if (!query) {
    res.status(400)
    res.setHeader("Content-Type", "application/json")
    return res.json({ status: false, message: "Parameter 'q' (judul anime) wajib diisi" })
  }

  try {
    const apiUrl = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`
    const response = await axios.get(apiUrl)
    const results = response.data.data

    if (!results || results.length === 0) {
      res.status(404)
      return res.json({ status: false, message: "Anime tidak ditemukan" })
    }

    const data = results.map((anime: any) => ({
      title: anime.title,
      title_english: anime.title_english,
      type: anime.type,
      episodes: anime.episodes,
      status: anime.status,
      score: anime.score,
      season: anime.season,
      year: anime.year,
      url: anime.url,
      image: anime.images.jpg.large_image_url,
      synopsis: anime.synopsis
    }))

    res.setHeader("Content-Type", "application/json")
    res.json({
      status: true,
      total_results: data.length,
      results: data
    })

  } catch (err: any) {
    console.error(err)
    res.status(500)
    res.setHeader("Content-Type", "application/json")
    res.json({ 
      status: false, 
      message: "Gagal mengambil data dari MyAnimeList",
      error: err.message 
    })
  }
}
