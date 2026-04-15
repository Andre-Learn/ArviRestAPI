import { Request, Response } from "express";
import { createCanvas, loadImage } from "canvas";
import axios from "axios";

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
                message: "❌ Teks kepanjangan (max 40)"
            });
        }

        const templateUrl = "https://img2.pixhost.to/images/7136/714465659_alip-1776041604068.jpg";

        // ambil gambar
        const response = await axios.get(templateUrl, {
            responseType: "arraybuffer"
        });

        const img = await loadImage(Buffer.from(response.data));

        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0);

        let fontSize = 80;
        ctx.font = `${fontSize}px Calibri`;
        ctx.fillStyle = "black";
        ctx.textAlign = "left";

        let x = 75;
        let y = 320;
        let maxWidth = img.width - 40;
        let lineHeight = fontSize + 4;

        // 🔥 wrap text (dari kode lo)
        let words = text.split(" ");
        let line = "";
        let lines: string[] = [];

        for (let word of words) {
            let testLine = line + word + " ";
            let testWidth = ctx.measureText(testLine).width;

            if (testWidth > maxWidth && line) {
                lines.push(line.trim());
                line = word + " ";
            } else {
                line = testLine;
            }
        }

        lines.push(line.trim());

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, y + i * lineHeight);
        }

        const buffer = canvas.toBuffer("image/png");

        // 🔥 kirim sebagai image
        res.setHeader("Content-Type", "image/png");
        res.send(buffer);

    } catch (err: any) {
        console.log("EKO ERROR:", err);

        res.json({
            status: false,
            message: err.message
        });
    }
}