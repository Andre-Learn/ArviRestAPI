import { Request, Response } from 'express'

const fetchFn = (...args: any[]) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args))

export default async function ytPlayProxy(req: Request, res: Response) {
  const query = (req.query.query || req.body.query) as string

  if (!query) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'query' diperlukan"
    })
  }

  try {
    const data = await fetchFn(
      `https://api.deline.web.id/downloader/ytplay?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'user-agent': 'Mozilla/5.0',
          accept: 'application/json'
        }
      }
    ).then(r => r.json())

    if (!data || !data.status) {
      throw new Error('Gagal mengambil data')
    }


    return res.json({
      status: true,
      result: data.result ?? data.data ?? data
    })

  } catch (err: any) {
    return res.status(500).json({
      status: false,
      message: err.message || 'API error'
    })
  }
}
