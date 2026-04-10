import { Request, Response } from "express";
import * as cheerio from "cheerio";

async function searchSfile(query: string, page: number = 1) {
  const res = await fetch(
    `https://sfile.co/search.php?q=${encodeURIComponent(query)}&page=${page}`
  );

  const $ = cheerio.load(await res.text());
  const results: any[] = [];

  $(".group.px-2").each((_, el) => {
    const title = $(el).find(".min-w-0 a").text().trim();
    const link = $(el).find("a").attr("href");
    const meta = $(el).find(".mt-1").text().split("•");

    if (link) {
      results.push({
        title,
        size: meta[0]?.trim() || null,
        upload_at: meta[1]?.trim() || null,
        link
      });
    }
  });

  return results;
}

export default async function sfileSearchHandler(
  req: Request,
  res: Response
) {
  const q = (req.query.q || req.body.q) as string;
  const page = parseInt((req.query.page || req.body.page) as string) || 1;

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    });
  }

  try {
    const result = await searchSfile(q, page);

    return res.json({
      status: true,
      total: result.length,
      result
    });
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      message: err.message
    });
  }
}