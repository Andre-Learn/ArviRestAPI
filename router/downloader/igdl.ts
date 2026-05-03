import axios from "axios";
import { Request, Response } from "express";

async function instaDownload(url: string) {
    try {
        const response = await axios.post(
            "https://instadownload.in/download",
            { url },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Origin": "https://instadownload.in",
                    "Referer": "https://instadownload.in/",
                    "User-Agent": "Mozilla/5.0"
                }
            }
        );

        const res = response.data;

        if (res.success && res.data) {
            return {
                success: true,
                type: res.data.type,
                caption: res.data.caption,
                thumbnail: res.data.thumbnail,
                links: res.data.media.map((item: any) => ({
                    type: item.type,
                    url: item.url
                }))
            };
        } else {
            return {
                success: false,
                message: "Gagal mendapatkan data dari API."
            };
        }

    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data || error.message
        };
    }
}

// 🔥 EXPORT HANDLER (WAJIB)
export default async function handler(req: Request, res: Response) {
    try {
        const url = req.query.url as string;

        if (!url) {
            return res.status(400).json({
                status: false,
                message: "url required"
            });
        }

        const result = await instaDownload(url);

        res.json({
            status: true,
            result
        });

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}