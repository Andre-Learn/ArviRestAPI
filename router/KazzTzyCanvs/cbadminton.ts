import { Request, Response } from "express";
import canvas from "canvas";

const { createCanvas, loadImage } = canvas;

export default async function cbadminton(req: Request, res: Response) {
  const text = req.query.text as string;

  if (!text) {
    return res.status(400).json({
      status: false,
      message: "Parameter 'text' wajib diisi"
    });
  }

  try {
    const name = text.trim();


    const bgUrl =
      "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772228394932.jpeg";

    const bgImage = await loadImage(bgUrl);

    const W = bgImage.width || 1280;
    const H = bgImage.height || 900;

    const cv = createCanvas(W, H);
    const ctx = cv.getContext("2d");

    ctx.drawImage(bgImage, 0, 0, W, H);

    const maxWidth = W * 0.55;
    let fontSize = Math.floor(H * 0.085);

    ctx.font = `italic ${fontSize}px "Times New Roman", Georgia, serif`;

    while (ctx.measureText(name).width > maxWidth && fontSize > 18) {
      fontSize -= 2;
      ctx.font = `italic ${fontSize}px "Times New Roman", Georgia, serif`;
    }

    ctx.fillStyle = "#5a1a1a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(name, W * 0.58, H * 0.52);

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    const buffer = cv.toBuffer("image/jpeg", { quality: 0.92 });

    res.setHeader("Content-Type", "image/jpeg");
    res.send(buffer);

  } catch (e: any) {
    res.status(500).json({
      status: false,
      message: e.message || "Internal Server Error"
    });
  }
}