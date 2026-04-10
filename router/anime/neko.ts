import { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  try {
    const r = await fetch("https://waifu.pics/api/sfw/neko");
    const j = await r.json();
    const img = await fetch(j.url);
    const buf = Buffer.from(await img.arrayBuffer());
    res.set("Content-Type", "image/png");
    res.send(buf);
  } catch {
    res.status(500).json({ status: false });
  }
}