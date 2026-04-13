import { Request, Response } from "express";
import { createCanvas, loadImage } from "canvas";

export default async function handler(req: Request, res: Response) {
    try {
        const text = req.query.text as string;

        if (!text) {
            return res.json({
                status: false,
                message: "Masukan teks"
            });
        }

        if (text.length > 40) {
            return res.json({
                status: false,
                message: "Teks terlalu panjang (max 40)"
            });
        }

        const templateUrl = "https://files.catbox.moe/cdxt0q.jpeg";

        const img = await loadImage(templateUrl);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, img.width, img.height);

        let fontSize = 24;
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";

        let x = 20;
        let y = 120;
        let maxWidth = img.width - 40;
        let lineHeight = fontSize + 4;

        function drawWrappedText(text: string) {
            let words = text.split(" ");
            let line = "";
            let lines: string[] = [];

            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + " ";
                let testWidth = ctx.measureText(testLine).width;

                if (testWidth > maxWidth && n > 0) {
                    lines.push(line.trim());
                    line = words[n] + " ";
                } else {
                    line = testLine;
                }
            }

            lines.push(line.trim());

            for (let i = 0; i < lines.length; i++) {
                ctx.fillText(lines[i], x, y + (i * lineHeight));
            }
        }

        drawWrappedText(text);

        const buffer = canvas.toBuffer("image/png");

        res.setHeader("Content-Type", "image/png");
        res.send(buffer);

    } catch (err: any) {
        res.json({
            status: false,
            message: err.message
        });
    }
}