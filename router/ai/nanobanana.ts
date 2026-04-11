import axios from "axios";
import crypto from "crypto";
import { Request, Response } from "express";

class TurnstileSolver {
    solverURL = "https://cf-solver-renofc.my.id/api/solvebeta";

    async solve(url: string, siteKey: string, mode = "turnstile-min") {
        const res = await axios.post(this.solverURL, {
            url,
            siteKey,
            mode
        }, {
            headers: { "Content-Type": "application/json" }
        });

        return res.data.token.result.token;
    }
}

class AIBanana {
    baseURL = "https://aibanana.net";
    siteKey = "0x4AAAAAAB2-fh9F_EBQqG2_";
    solver = new TurnstileSolver();

    fingerprint() {
        return crypto.createHash("sha256")
            .update(crypto.randomBytes(32))
            .digest("hex");
    }

    deviceId() {
        return crypto.randomBytes(8).toString("hex");
    }

    userAgent() {
        const os = [
            "Windows NT 10.0; Win64; x64",
            "Macintosh; Intel Mac OS X 10_15_7",
            "X11; Linux x86_64"
        ][Math.floor(Math.random() * 3)];

        const ver = Math.floor(Math.random() * 40) + 100;
        return `Mozilla/5.0 (${os}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${ver}.0.0.0 Safari/537.36`;
    }

    viewport() {
        const list = [
            { w: 1366, h: 768 },
            { w: 1920, h: 1080 },
            { w: 1280, h: 720 }
        ];
        return list[Math.floor(Math.random() * list.length)];
    }

    platform() {
        return ["Windows", "Linux", "macOS"][Math.floor(Math.random() * 3)];
    }

    lang() {
        return ["en-US,en;q=0.9", "id-ID,id;q=0.9"][Math.floor(Math.random() * 2)];
    }

    // 🔥 FIX: support imageUrl
    async generate(prompt: string, imageUrl?: string) {
        const token = await this.solver.solve(this.baseURL, this.siteKey);

        const vp = this.viewport();
        const chromeVer = Math.floor(Math.random() * 30) + 110;

        const mode = imageUrl ? "image-to-image" : "text-to-image";

        const res = await axios.post(`${this.baseURL}/api/image-generation`, {
            prompt,
            model: "nano-banana-2",
            mode,
            image: imageUrl || undefined,
            numImages: 1,
            aspectRatio: "1:1",
            clientFingerprint: this.fingerprint(),
            turnstileToken: token,
            deviceId: this.deviceId()
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Accept-Language": this.lang(),
                "Origin": this.baseURL,
                "Referer": `${this.baseURL}/`,
                "User-Agent": this.userAgent(),
                "Sec-Ch-Ua": `"Chromium";v="${chromeVer}"`,
                "Sec-Ch-Ua-Mobile": "?0",
                "Sec-Ch-Ua-Platform": `"${this.platform()}"`,
                "Viewport-Width": vp.w.toString(),
                "Viewport-Height": vp.h.toString()
            }
        });

        return res.data;
    }
}

// ✅ HANDLER
export default async function handler(req: Request, res: Response) {
    try {
        const { prompt, imageUrl } = req.query;

        if (!prompt) {
            return res.json({
                status: false,
                message: "prompt required"
            });
        }

        const banana = new AIBanana();
        const result = await banana.generate(
            prompt as string,
            imageUrl as string | undefined
        );

        res.json({
            status: true,
            mode: imageUrl ? "img2img" : "text2img",
            result
        });

    } catch (err: any) {
        res.json({
            status: false,
            message: err.message
        });
    }
}