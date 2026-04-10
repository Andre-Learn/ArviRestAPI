import { Request, Response } from "express";
import { createCanvas, loadImage } from "canvas";
import assets from "./assetsku";

export default async function flamingAPI(req: Request, res: Response) {
  const input = (req.query.q as string)?.trim();
  const style = (req.query.style as string)?.trim()?.toLowerCase();

  if (!input) return res.status(400).send("Parameter 'q' diperlukan. Format: nama|warna");
  if (!style || !["flaming1","flaming2","flaming3","flaming4","flaming5","flaming6"].includes(style))
    return res.status(400).send("Parameter 'style' harus flaming1-6");

  const [name, color] = input.split("|");
  if (!name) return res.status(400).send("Nama tidak boleh kosong");

  const glowColor = color ? color.trim().toLowerCase() : "blue";
  const cmd = style;

  try {
    const bgUrl = assets.flaming || "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771089889521.jpeg";
    const bg = await loadImage(bgUrl);

    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    const textString = name.toUpperCase();
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const maxWidth = canvas.width * 0.85;

    let fontSize = 130;
    ctx.font = `bold ${fontSize}px "Impact", "Arial Black", sans-serif`;

    while (ctx.measureText(textString).width > maxWidth && fontSize > 30) {
      fontSize -= 5;
      ctx.font = `bold ${fontSize}px "Impact", "Arial Black", sans-serif`;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.save();
    ctx.translate(x, y);
    ctx.transform(1, 0, -0.25, 1, 0, 0);
    ctx.translate(-x, -y);

    if (cmd === "flaming1") {
      ctx.shadowBlur = fontSize / 3;
      ctx.shadowColor = glowColor;
      ctx.strokeStyle = "white";
      ctx.lineWidth = fontSize / 8;
      ctx.lineJoin = "round";
      ctx.strokeText(textString, x, y);
      ctx.shadowBlur = 0;
      let grad = ctx.createLinearGradient(0, y - fontSize/2, 0, y + fontSize/2);
      grad.addColorStop(0, glowColor);
      grad.addColorStop(0.49, "rgba(255,255,255,0.4)");
      grad.addColorStop(0.5, "rgba(0,0,0,0.6)");
      grad.addColorStop(0.51, glowColor);
      grad.addColorStop(1, "black");
      ctx.fillStyle = grad;
      ctx.fillText(textString, x, y);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeText(textString, x, y);
    } else if (cmd === "flaming2") {
      ctx.shadowBlur = 40;
      ctx.shadowColor = glowColor;
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 15;
      ctx.strokeText(textString, x, y);
      ctx.fillStyle = "white";
      ctx.fillText(textString, x, y);
      ctx.shadowBlur = 10;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeText(textString, x, y);
    } else if (cmd === "flaming3") {
      ctx.fillStyle = "black";
      ctx.fillText(textString, x + 8, y + 8);
      ctx.fillStyle = glowColor;
      ctx.fillText(textString, x + 4, y + 4);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 10;
      ctx.strokeText(textString, x, y);
      ctx.fillStyle = "white";
      ctx.fillText(textString, x, y);
    } else if (cmd === "flaming4") {
      ctx.shadowBlur = 30;
      ctx.shadowColor = glowColor;
      let grad = ctx.createRadialGradient(x, y, 10, x, y, fontSize * 2);
      grad.addColorStop(0, "white");
      grad.addColorStop(0.3, glowColor);
      grad.addColorStop(1, "black");
      ctx.fillStyle = grad;
      ctx.fillText(textString, x, y);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 4;
      ctx.strokeText(textString, x, y);
    } else if (cmd === "flaming5") {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 12;
      ctx.strokeText(textString, x, y);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 6;
      ctx.strokeText(textString, x, y);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillText(textString, x, y);
    } else if (cmd === "flaming6") {
      ctx.shadowBlur = 20;
      ctx.shadowColor = glowColor;
      ctx.fillStyle = glowColor;
      ctx.fillText(textString, x, y);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      for(let i = -fontSize/2; i < fontSize/2; i+=10) {
        ctx.fillRect(x - (maxWidth/2), y + i, maxWidth, 2);
      }
      ctx.strokeStyle = "white";
      ctx.lineWidth = 5;
      ctx.strokeText(textString, x, y);
    }

    ctx.restore();

    const buffer = canvas.toBuffer("image/jpeg");
    res.setHeader("Content-Type", "image/jpeg");
    res.send(buffer);

  } catch (err: any) {
    res.status(500).send("Error: " + err.message);
  }
}