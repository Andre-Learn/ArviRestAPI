import { Request, Response } from "express";
import axios from "axios";
import cheerio from "cheerio";

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function mfsearch(query: string) {
  if (!query) throw new Error('Query is required');

  const { data: html } = await axios.get(`https://mediafiretrend.com/?q=${encodeURIComponent(query)}&search=Search`);
  const $ = cheerio.load(html);

  const links = shuffle(
    $('tbody tr a[href*="/f/"]').map((_, el) => $(el).attr('href')).get()
  ).slice(0, 5);

  const results = await Promise.all(
    links.map(async (link) => {
      try {
        const { data } = await axios.get(`https://mediafiretrend.com${link}`);
        const $page = cheerio.load(data);

        const raw = $page('div.info tbody tr:nth-child(4) td:nth-child(2) script').text();
        const match = raw.match(/unescape\(['"`]([^'"`]+)['"`]\)/);
        
        let downloadUrl = null;
        if (match) {
          const decoded = cheerio.load(decodeURIComponent(match[1]));
          downloadUrl = decoded('a').attr('href');
        }

        return {
          filename: $page('tr:nth-child(2) td:nth-child(2) b').text().trim(),
          filesize: $page('tr:nth-child(3) td:nth-child(2)').text().trim(),
          url: downloadUrl,
          source_url: $page('tr:nth-child(5) td:nth-child(2)').text().trim(),
          source_title: $page('tr:nth-child(6) td:nth-child(2)').text().trim()
        };
      } catch (err) {
        return null;
      }
    })
  );

  return results.filter(res => res !== null);
}

export default async function mediafireHandler(req: Request, res: Response) {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ status: false, message: "Parameter 'q' diperlukan." });

    const results = await mfsearch(q as string);

    if (!results.length) {
      return res.status(404).json({ 
        status: false, 
        message: "Tidak ada hasil ditemukan" 
      });
    }

    res.status(200).json({ 
      status: true, 
      query: q, 
      total: results.length, 
      results 
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: false, 
      message: "Gagal mengambil data MediaFire", 
      error: error.message 
    });
  }
}