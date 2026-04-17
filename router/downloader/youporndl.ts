import axios from "axios";
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
    const urlParam = req.query.url as string;

    if (!urlParam) {
      return res.json({
        status: false,
        message: "url required"
      });
    }

    const url = urlParam.startsWith("http")
      ? urlParam
      : `https://www.youporn.com/watch/${urlParam}/`;

    const { data: html } = await client.get(url);

    const match = html.match(/mediaDefinition\s*:\s*(\[[\s\S]*?\])/);

    if (!match) {
      return res.json({
        status: false,
        message: "video not found"
      });
    }

    let mediaDefinition;

    try {
      mediaDefinition = eval(match[1]);
    } catch {
      return res.json({
        status: false,
        message: "parse error"
      });
    }

    const mp4 = mediaDefinition.find((v: any) => v.format === "mp4")?.videoUrl;
    const hls = mediaDefinition.find((v: any) => v.format === "hls")?.videoUrl;

    res.json({
      status: true,
      result: {
        mp4,
        hls
      }
    });

  } catch (err: any) {
    res.json({
      status: false,
      message: err.message
    });
  }
}