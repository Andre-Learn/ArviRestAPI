import { Request, Response } from "express";
import { createCanvas } from "canvas";

export default async function p302Handler(req: Request, res: Response) {
    try {
        let text = (req.query.text || req.body.text) as string;

        if (!text) {
            return res.status(400).json({
                status: false,
                error: "parameter 'text' diperlukan"
            });
        }

        text = text.toUpperCase();

        const width = 1200;
        const height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");


        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, "#0b1220");
        bgGradient.addColorStop(0.5, "#000000");
        bgGradient.addColorStop(1, "#111827");
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let fontSize = 320;
        const maxWidth = width * 0.95;

        ctx.font = `bold ${fontSize}px Sans`;
        let textWidth = ctx.measureText(text).width;

        if (textWidth > maxWidth) {
            fontSize = Math.floor(fontSize * (maxWidth / textWidth));
        }

        ctx.font = `bold ${fontSize}px Sans`;

        const x = width / 2;
        const y = height / 2;


        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 60;
        ctx.shadowOffsetY = 30;
        ctx.fillStyle = "#000000";
        ctx.fillText(text, x, y + 25);

        ctx.shadowColor = "transparent";


        const metal = ctx.createLinearGradient(0, y - fontSize, 0, y + fontSize);
        metal.addColorStop(0, "#ffffff");
        metal.addColorStop(0.2, "#e5e7eb");
        metal.addColorStop(0.5, "#9ca3af");
        metal.addColorStop(0.8, "#e5e7eb");
        metal.addColorStop(1, "#ffffff");

        ctx.fillStyle = metal;
        ctx.fillText(text, x, y);

        ctx.lineWidth = fontSize * 0.05;
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.strokeText(text, x, y);

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