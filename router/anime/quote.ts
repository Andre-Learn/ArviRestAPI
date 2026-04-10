import { Request, Response } from 'express'
import axios from 'axios'
import cheerio from 'cheerio'

async function fetchAnimeQuotes() {
  try {
    const page = Math.floor(Math.random() * 184)
    const { data } = await axios.get('https://otakotaku.com/quote/feed/' + page)
    const $ = cheerio.load(data)

    const kotodamaLinks = $('div.kotodama-list').map((i, el) => {
      return $(el).find('a.kuroi').attr('href')
    }).get()

    const results = await Promise.all(
      kotodamaLinks.map(async (url) => {
        const { data: quotePage } = await axios.get(url)
        const $q = cheerio.load(quotePage)

        return {
          char: $q('.char-info .tebal a[href*="/character/"]').text().trim() || '-',
          from_anime: $q('.char-info a[href*="/anime/"]').text().trim() || '-',
          episode: $q('.char-info span.meta').text().trim().replace('- ', '') || '-',
          quote: $q('.post-content blockquote p').text().trim() || '-'
        }
      })
    )

    return results
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export default async function animeQuoteHandler(req: Request, res: Response) {
  try {
    const data = await fetchAnimeQuotes()
    const randomQuote = data[Math.floor(Math.random() * data.length)]

    res.json({
      status: true,
      data: randomQuote
    })
  } catch (e: any) {
    res.status(500).json({
      status: false,
      message: '⚠️ Gagal mengambil quote anime',
      error: e.message
    })
  }
}
