import { Request, Response } from "express";
import { createCanvas, loadImage } from "canvas";
import assets from "./assetsku";

export default async function nokiaAPI(req: Request, res: Response) {
  const nama = (req.query.nama as string)?.trim();
  const text = (req.query.text as string)?.trim();

  if (!nama) return res.status(400).send("Parameter 'nama' diperlukan");
  if (!text) return res.status(400).send("Parameter 'text' diperlukan");

  try {
    const bgUrl = assets.nokia || "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771087955018.jpeg";
    const bg = await loadImage(bgUrl);
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 52px "Impact", "Arial Black", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText(nama, 342, 222);
    ctx.fillStyle = "#e1e5eb";
    ctx.shadowBlur = 3;
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
    ctx.fillText(nama, 340, 220);
    ctx.shadowBlur = 0;

    ctx.font = '32px "Impact", "Arial Black", sans-serif';
    ctx.fillStyle = "rgba(20, 20, 20, 0.8)";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.shadowBlur = 1;
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";

    const maxWidth = 580;
    const x = 90;
    let y = 300;
    const lineHeight = 38;

    const words = text.trim().split(" ");
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);

    const buffer = canvas.toBuffer("image/jpeg");
    res.setHeader("Content-Type", "image/jpeg");
    res.send(buffer);

  } catch (err: any) {
    res.status(500).send("Error: " + err.message);
  }
}