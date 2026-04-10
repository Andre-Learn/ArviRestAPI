import { Request, Response } from "express";
import { createCanvas, loadImage, registerFont } from "canvas";
import axios from "axios";
import path from "path";


registerFont(path.join(__dirname, "Nunito-MediumItalic.ttf"), { family: "Nunito" });

const drawCircularTextBottom = (context: any, str: string, cx: number, cy: number, rad: number) => {
  const fontSize = 85;
  const arcSpan = Math.PI * 0.6; 
  const textRadius = rad + 75; 
  const chars = str.toUpperCase().split("");
  const n = chars.length;
  const angleIncrement = n > 1 ? arcSpan / (n - 1) : 0;
  const start = (Math.PI / 2) + (arcSpan / 2);

  context.font = `bold ${fontSize}px Nunito`;
  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (let i = 0; i < n; i++) {
    const char = chars[i];
    const angle = start - i * angleIncrement;
    const x = cx + Math.cos(angle) * textRadius;
    const y = cy + Math.sin(angle) * textRadius;

    context.save();
    context.translate(x, y);
    context.rotate(angle - Math.PI / 2);
    context.lineWidth = 4;
    context.strokeStyle = "rgba(0,0,0,0.5)";
    context.strokeText(char, 0, 0);
    context.fillText(char, 0, 0);
    context.restore();
  }
};

export default async function makerBotHandler(req: Request, res: Response) {
  try {
    const { url, text } = req.query;

    if (!url || !text) {
      return res.status(400).json({ 
        status: false, 
        message: "Parameter 'url' (link gambar) dan 'text' diperlukan." 
      });
    }

    const bgUrl = "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772229788017.jpeg";
    

    const response = await axios.get(url as string, { responseType: 'arraybuffer' });
    const userImgBuffer = Buffer.from(response.data);

    const canvas = createCanvas(1024, 1024);
    const ctx = canvas.getContext("2d");


    const [background, userImg] = await Promise.all([
      loadImage(bgUrl),
      loadImage(userImgBuffer)
    ]);

    ctx.drawImage(background, 0, 0, 1024, 1024);

    const centerX = 518; 
    const centerY = 455; 
    const radius = 235; 


    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const aspect = userImg.width / userImg.height;
    let drawWidth, drawHeight, dx, dy;
    
    if (aspect > 1) {
      drawHeight = radius * 2;
      drawWidth = drawHeight * aspect;
      dx = centerX - drawWidth / 2;
      dy = centerY - radius;
    } else {
      drawWidth = radius * 2;
      drawHeight = drawWidth / aspect;
      dx = centerX - radius;
      dy = centerY - drawHeight / 2;
    }
    
    ctx.drawImage(userImg, dx, dy, drawWidth, drawHeight);
    ctx.restore();


    drawCircularTextBottom(ctx, (text as string).trim(), centerX, centerY, radius);

    const buffer = canvas.toBuffer("image/png");

    res.set("Content-Type", "image/png");
    res.send(buffer);

  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
}
