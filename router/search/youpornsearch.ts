import axios from "axios";
import cheerio from "cheerio";
import https from "https";
import { Request, Response } from "express";

const client = axios.create({
  headers: {
    "User-Agent": "Mozilla/5.0"
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

export default async function handler(req: Request, res: Response) {
  try {
    const q = req.query.q as string;

    if (!q) {
      return res.json({
        status: false,
        message: "query required"
      });
    }

    const { data } = await client.get(
      `https://www.youporn.com/search/?query=${encodeURIComponent(q)}`
    );

    const $ = cheerio.load(data);
    const results: any[] = [];

    $("article.video-box").each((i, el) => {
      const article = $(el);

      const videoId = article.attr("data-video-id");
      const uploader = article.attr("data-uploader-name");
      const title = article.attr("aria-label");

      const linkPath = article.find("a.video-title-text").attr("href");
      const link = linkPath
        ? `https://www.youporn.com${linkPath}`
        : null;

      const views = article.find(".info-views").first().text().trim();

      results.push({
        videoId,
        uploader,
        title,
        link,
        views
      });
    });

    res.json({
      status: true,
      result: results
    });

  } catch (err: any) {
    res.json({
      status: false,
      message: err.message
    });
  }
}