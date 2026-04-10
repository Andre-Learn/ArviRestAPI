import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

async function happyModSearch(keyword: string) {
  if (!keyword) throw new Error("Keyword wajib diisi");

  const { data: html } = await axios.post(
    "https://id.happymod.cloud/search.html",
    new URLSearchParams({ q: keyword }).toString(),
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        origin: "https://id.happymod.cloud",
        referer: "https://id.happymod.cloud/"
      },
      timeout: 60000
    }
  );

  const $ = cheerio.load(html);
  const results: any[] = [];

  $("li.list-item").each((_, el) => {
    const item = $(el);
    const anchor = item.find("a.list-box");

    const title =
      item.find(".list-info-title").text().trim() || null;

    const link = anchor.attr("href")
      ? "https://id.happymod.cloud" + anchor.attr("href")
      : null;

    const icon =
      item.find(".list-icon img").attr("data-src") ||
      item.find(".list-icon img").attr("src") ||
      null;

    const description =
      item.find(".list-info-desc").text().trim() ||
      item.find(".list-info-text").first().text().trim() ||
      null;

    const infoTexts: string[] = [];
    item.find(".list-info-text").each((_, t) => {
      const text = $(t).text().trim();
      if (text) infoTexts.push(text);
    });

    if (title && link) {
      results.push({
        title,
        url: link,
        icon,
        description,
        info: infoTexts
      });
    }
  });

  return results;
}

export default async function happymodHandler(
  req: Request,
  res: Response
) {
  const q = (req.query.q || req.body.q) as string;
  const apikey = (req.query.apikey || req.body.apikey) as string;

  if (!q) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'q' diperlukan"
    });
  }

  if (!apikey) {
    return res.status(403).json({
      status: false,
      message: "Parameter 'apikey' diperlukan"
    });
  }

  try {
    const result = await happyModSearch(q);

    return res.json({
      status: true,
      creator: "Aoshi",
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