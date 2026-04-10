import { Request, Response } from "express";
import { createCanvas, loadImage } from "canvas";

export default async function brandingHandler(req: Request, res: Response) {
    try {
        let text = (req.query.text || req.body.text) as string;

        if (!text) {
            return res.status(400).json({
                status: false,
                error: "parameter 'text' diperlukan"
            });
        }

        const bgUrl =
            "https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1771430841041.jpeg";

        const bg = await loadImage(bgUrl);

        const canvas = createCanvas(1280, 720);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

        const centerY = canvas.height / 2;

        let fontSize = 80;
        ctx.font = `bold ${fontSize}px Sans`;

        while (ctx.measureText(text).width > 800 && fontSize > 40) {
            fontSize -= 5;
            ctx.font = `bold ${fontSize}px Sans`;
        }

        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.fillText(text, 360, centerY + 20);

        const buffer = canvas.toBuffer("image/png");

        res.setHeader("Content-Type", "image/png");
        res.send(buffer);

    } catch (err: any) {
        res.status(500).json({
            status: false,
            error: err.message || "internal server error"
        });
    }
}