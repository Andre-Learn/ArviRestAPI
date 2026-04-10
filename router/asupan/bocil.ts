import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export default async function bocilHandler(req: Request, res: Response) {
  try {
    const jsonPath = path.join(__dirname, "bocil.json");
    const data = fs.readFileSync(jsonPath, "utf-8");
    const links: { url: string }[] = JSON.parse(data);

    if (!links.length) {
      return res.status(404).json({
        status: false,
        message: "Tidak ada video"
      });
    }

    const randomItem = links[Math.floor(Math.random() * links.length)];
    res.json({
      status: true,
      url: randomItem.url
    });
  } catch (err: any) {
    res.status(500).json({
      status: false,
      message: err.message
    });
  }
}
