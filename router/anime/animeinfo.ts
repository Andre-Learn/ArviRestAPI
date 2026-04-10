import { Request, Response } from 'express'
import fetch from 'node-fetch'

export default async function animeInfoHandler(req: Request, res: Response) {
  const query = (req.query.q || req.body.q) as string

  if (!query) {
    return res.status(400).json({
      creator: "KayzzAoshi",
      status: false,
      message: "Parameter 'q' (judul anime) wajib diisi"
    })
  }

  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`)

    if (!response.ok) throw new Error('Tidak ditemukan')

    const json = await response.json()
    const animeData = json.data[0]

    if (!animeData) throw new Error('Anime tidak ditemukan')

    const {
      title_japanese,
      url,
      type,
      score,
      members,
      status,
      synopsis,
      favorites,
      images,
      genres,
    } = animeData

    const genreList = genres.map((genre: any) => genre.name).join(', ')

    res.json({
      creator: "KayzzAoshi",
      status: true,
      data: {
        title: title_japanese,
        type,
        genres: genreList,
        score,
        members,
        status,
        favorites,
        url,
        synopsis,
        image: images.jpg.image_url
      }
    })
  } catch (e: any) {
    res.status(500).json({
      creator: "KayzzAoshi",
      status: false,
      message: e.message
    })
  }
}
