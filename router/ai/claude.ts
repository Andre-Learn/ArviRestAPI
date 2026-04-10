import { Request, Response } from "express";
import axios from "axios";
import FormData from "form-data";

function generateApiKey() {
    const r = Math.floor(1e11 * Math.random());
    return "tryit-" + r + "-a3edf17b505349f1794bcdbc7290a045";
}

function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c == "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default async function claudeAPI(req: Request, res: Response) {
    const text = (req.query.text as string)?.trim();

    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' diperlukan"
        });
    }

    try {
        const apiKey = generateApiKey();
        const sessionUuid = generateUUID();

        const formData = new FormData();
        formData.append("chat_style", "claudeai_0");
        formData.append("chatHistory", JSON.stringify([{ role: "user", content: text }]));
        formData.append("model", "standard");
        formData.append("session_uuid", sessionUuid);
        formData.append("hacker_is_stinky", "very_stinky");

        const response = await axios.post(
            "https://api.deepai.org/hacking_is_a_serious_crime",
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                    "api-key": apiKey,
                    "user-agent": "Mozilla/5.0",
                    "referer": "https://deepai.org/chat/claude-3-haiku",
                    "accept": "*/*"
                }
            }
        );

        res.json({
            creator: "KayzzAoshi",
            status: true,
            result: response.data
        });

    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            creator: "KayzzAoshi",
            status: false,
            message: err.message || "Terjadi kesalahan saat menghubungi Claude."
        });
    }
}