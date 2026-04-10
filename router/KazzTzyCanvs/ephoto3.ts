import { Request, Response } from "express";
import { createCanvas, loadImage } from "canvas";
import assets from "./assetsku";

export default async function ephotoImageAPI(req: Request, res: Response) {
  const q = (req.query.q as string)?.trim();
  const style = (req.query.style as string)?.trim()?.toLowerCase();

  if (!q) return res.status(400).send("Parameter 'q' diperlukan");
  if (!style || !["ephoto3","ephoto4","ephoto5","ephoto6"].includes(style))
    return res.status(400).send("Parameter 'style' harus ephoto3|ephoto4|ephoto5|ephoto6");

  try {
    const bgUrl = assets.ephoto || "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771091097762.jpeg";
    const bg = await loadImage(bgUrl);

    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    let fontSize = 200;
    const maxWidth = canvas.width * 0.95;
    const words = q.toUpperCase().split(" ");
    const fullText = words.join(" ");

    let fontFamily = "Impact";
    if (style === "ephoto5") fontFamily = "serif";
    if (style === "ephoto6") fontFamily = "sans-serif";
    if (style === "ephoto4") fontFamily = "Arial";

    do {
      fontSize -= 2;
      ctx.font = `italic bold ${fontSize}px ${fontFamily}`;
    } while (ctx.measureText(fullText).width > maxWidth && fontSize > 10);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    let startX = (canvas.width - ctx.measureText(fullText).width) / 2;
    const y = canvas.height / 2;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const char = word[j];

        let mainColor = "#FFFFFF";
        let strokeColor = "#000000";
        let glowColor = "rgba(0,0,0,0.8)";
        let blurLevel = 15;

        if (style === "ephoto3") {
          if (j === 0 && i === 0) mainColor = "#FF2E2E";
          else if (j === 0 && i === 1) mainColor = "#2E5EFF";
          strokeColor = "#000000";
        } else if (style === "ephoto4") {
          mainColor = "#00FBFF";
          strokeColor = "#004142";
          glowColor = "#00FBFF";
          if (j === 0) mainColor = "#FF00D4";
        } else if (style === "ephoto5") {
          mainColor = "#660000";
          strokeColor = "#000000";
          glowColor = "#FF0000";
          blurLevel = 25;
          fontFamily = "serif";
        } else if (style === "ephoto6") {
          mainColor = "#00FF40";
          strokeColor = "#00330D";
          glowColor = "#00FF40";
          blurLevel = 40;
        }

        ctx.shadowColor = glowColor;
        ctx.shadowBlur = blurLevel;
        ctx.shadowOffsetX = style === "ephoto5" ? 10 : 5;
        ctx.shadowOffsetY = style === "ephoto5" ? 15 : 5;

        ctx.lineJoin = "round";
        ctx.lineWidth = fontSize / 6;
        ctx.strokeStyle = strokeColor;
        ctx.strokeText(char, startX, y);

        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        if (style !== "ephoto5") {
          ctx.lineWidth = fontSize / 20;
          ctx.strokeStyle = "#FFFFFF";
          ctx.strokeText(char, startX, y);
        }

        ctx.fillStyle = mainColor;
        ctx.fillText(char, startX, y);

        startX += ctx.measureText(char).width;
      }
      startX += ctx.measureText(" ").width;
    }

    const buffer = canvas.toBuffer("image/jpeg");

    res.setHeader("Content-Type", "image/jpeg");
    res.send(buffer);

  } catch (err: any) {
    res.status(500).send("Error: " + err.message);
  }
}