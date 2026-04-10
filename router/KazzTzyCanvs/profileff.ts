import { Request, Response } from "express";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

registerFont(path.join(__dirname, "Teuton.otf"), { family: "Teuton" });

const backgroundList = [
  "https://files.catbox.moe/6a4utu.jpg",
  "https://files.catbox.moe/bkc7z4.jpg",
  "https://files.catbox.moe/5f4r4j.jpg",
  "https://files.catbox.moe/wgvfbb.jpg",
  "https://files.catbox.moe/wo1fi3.jpg",
  "https://files.catbox.moe/11hbzc.jpg",
  "https://files.catbox.moe/8ahm3q.jpg",
  "https://files.catbox.moe/ohpm1n.jpg",
  "https://files.catbox.moe/nneipb.jpg",
  "https://files.catbox.moe/oge6p6.jpg",
  "https://files.catbox.moe/uoqhpg.jpg"
];

export default async function profileff(req: Request, res: Response) {
  const nickname = (req.query.nickname as string)?.trim();
  const guild = (req.query.guild as string)?.trim() || "";
  let bgPick = (req.query.bg as string)?.trim() || "";

  if (!nickname) return res.status(400).json({ status: false, message: "Parameter 'nickname' diperlukan" });

  if (bgPick.toLowerCase() === "rand" || bgPick.toLowerCase() === "random") {
    bgPick = String(Math.floor(Math.random() * backgroundList.length) + 1);
  }

  const index = parseInt(bgPick, 10) - 1;
  if (isNaN(index) || index < 0 || index >= backgroundList.length) return res.status(400).json({ status: false, message: "Background tidak valid (1–" + backgroundList.length + ")" });

  try {
    const bg = await loadImage(backgroundList[index]);
    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    const safeLeft = 300;
    const safeRight = canvas.width - 50;
    const maxWidth = safeRight - safeLeft;
    const x = safeLeft;
    const yName = canvas.height - 200;
    const yGuild = yName + 150;

    const fitText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxFont: number, minFont: number, fontFamily: string) => {
      let size = maxFont;
      while (size > minFont) {
        ctx.font = `bold ${size}px "${fontFamily}"`;
        if (ctx.measureText(text).width <= maxWidth) break;
        size -= 2;
      }
      return size;
    };

    const ellipsize = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
      if (ctx.measureText(text).width <= maxWidth) return text;
      let t = text;
      while (t.length > 1 && ctx.measureText(t + "…").width > maxWidth) t = t.slice(0, -1);
      return t + "…";
    };

    let nameSize = fitText(ctx, nickname, maxWidth, 90, 26, "Teuton");
    ctx.font = `bold ${nameSize}px "Teuton"`;
    ctx.textAlign = "left";

    const drawOutlined = (text: string, x: number, y: number) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, x, y);
      ctx.fillStyle = "#ffb300";
      ctx.fillText(text, x, y);
      ctx.strokeStyle = "rgba(0,0,0,0.8)";
      ctx.lineWidth = 1.8;
      ctx.strokeText(text, x, y);
    };

    drawOutlined(ellipsize(ctx, nickname, maxWidth), x, yName);

    if (guild.length > 0) {
      let guildSize = fitText(ctx, guild, maxWidth, 90, 26, "Teuton");
      ctx.font = `bold ${guildSize}px "Teuton"`;
      drawOutlined(ellipsize(ctx, guild, maxWidth), x, yGuild);
    }

    const buffer = canvas.toBuffer("image/png");
    res.setHeader("Content-Type", "image/png");
    res.send(buffer);
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message });
  }
}