
import { Request, Response } from "express";
import { createCanvas, registerFont } from "canvas";
import path from "path";


registerFont(path.join(__dirname, "Arial Bold.ttf"), { family: "ArialBold" });

function wrapText(ctx: any, text: string, maxWidth: number) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const testLine = line ? line + ' ' + words[i] : words[i];
    const { width } = ctx.measureText(testLine);
    if (width > maxWidth && line) {
      lines.push(line);
      line = words[i];
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default async function stickerRoastHandler(req: Request, res: Response) {
  try {
    const { text } = req.query;
    if (!text) return res.status(400).json({ status: false, message: "Masukkan parameter text dengan format t1|t2|t3" });

    const parts = (text as string).split('|').map(v => v.trim());
    const t1 = parts[0] || '-';
    const t2 = (parts[1] || '-').toUpperCase();
    const t3 = parts[2] || '-';

    const width = 512;
    const height = 512;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');


    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const marginXText = 70;
    const marginXTitle = 30;
    const maxWidthTop = width - marginXText * 2;
    const maxWidthTitle = width - marginXTitle * 2;
    const spacingAfterT1 = 14;
    const spacingAfterT2 = 18;


    ctx.font = '28px ArialBold';
    let lines1 = wrapText(ctx, t1, maxWidthTop);
    const heightT1 = lines1.length * 34;

    let fontSizeTitle = 60;
    ctx.font = `bold ${fontSizeTitle}px ArialBold`;
    let lines2 = wrapText(ctx, t2, maxWidthTitle);
    const heightT2 = lines2.length * (fontSizeTitle + 6);

    ctx.font = '28px ArialBold';
    let lines3 = wrapText(ctx, t3, maxWidthTop);
    const heightT3 = lines3.length * 34;

    const totalHeight = heightT1 + spacingAfterT1 + heightT2 + spacingAfterT2 + heightT3;
    let y = (height - totalHeight) / 2;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#1E90FF';


    ctx.font = '28px ArialBold';
    for (const line of lines1) { ctx.fillText(line, marginXText, y); y += 34; }
    y += spacingAfterT1;


    ctx.font = `bold ${fontSizeTitle}px ArialBold`;
    for (const line of lines2) { ctx.fillText(line, marginXTitle, y); y += fontSizeTitle + 6; }
    y += spacingAfterT2;


    ctx.font = '28px ArialBold';
    for (const line of lines3) { ctx.fillText(line, marginXText, y); y += 34; }

    const buffer = canvas.toBuffer('image/png');
    
    res.set("Content-Type", "image/png");
    res.send(buffer);

  } catch (error: any) {
    res.status(500).json({ status: false, message: error.message });
  }
}