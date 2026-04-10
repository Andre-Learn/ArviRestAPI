import { Request, Response } from "express";
import { createCanvas, loadImage, registerFont } from "canvas";
import path from "path";

registerFont(path.join(__dirname, "Arial Bold.ttf"), { family: "ArialBold" });

export default async function faketiktok(req: Request, res: Response) {
    const { nama, username, verified, mengikuti, pengikut, suka, bio } = req.query;
    if (!nama || !username || !verified || !mengikuti || !pengikut || !suka || !bio) {
        return res.status(400).json({
            status: false,
            message: "Parameter kurang! Required: nama, username, verified, mengikuti, pengikut, suka, bio"
        });
    }

    const verifiedBool = verified.toString().toLowerCase() === "true";
    const imageUrl = req.query.image as string;
    if (!imageUrl) {
        return res.status(400).json({ status: false, message: "Parameter image (reply foto / URL) diperlukan" });
    }

    try {
        const [bg, avatar, centang] = await Promise.all([
            loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230150673.jpeg"),
            loadImage(imageUrl),
            loadImage("https://raw.githubusercontent.com/kayzzaoshi-code/Uploader/main/file_1772230183783.jpeg")
        ]);

        const canvas = createCanvas(bg.width, bg.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(bg, 0, 0);


        const avatarX = 400, avatarY = 70, avatarSize = 280;
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();


        ctx.textAlign = "center";
        ctx.fillStyle = "#000";
        ctx.font = "bold 45px ArialBold";
        ctx.fillText(nama.toString(), canvas.width / 2 - 10, 420);


        ctx.fillStyle = "#555";
        ctx.font = "35px ArialBold";
        ctx.fillText(`@${username.toString()}`, canvas.width / 2 - 10, 475);

        if (verifiedBool) {
            const unameWidth = ctx.measureText(`@${username}`).width;
            ctx.drawImage(centang, canvas.width / 2 - 10 + unameWidth / 2 + 10, 445, 35, 35);
        }


        ctx.fillStyle = "#000";
        ctx.font = "bold 42px ArialBold";
        ctx.fillText(mengikuti.toString(), canvas.width / 2 - 275, 560);
        ctx.fillText(pengikut.toString(), canvas.width / 2, 560);
        ctx.fillText(suka.toString(), canvas.width / 2 + 275, 560);


        ctx.font = "30px ArialBold";
        ctx.fillStyle = "#111";
        ctx.fillText(bio.toString(), canvas.width / 2, 820);

        const buffer = canvas.toBuffer("image/png");
        res.setHeader("Content-Type", "image/png");
        res.send(buffer);

    } catch (err: any) {
        console.error("[FAKETIKTOK ERROR]", err);
        res.status(500).json({ status: false, message: err.message || "Gagal membuat Fake TikTok" });
    }
}