import { Request, Response } from 'express';
import axios from 'axios';

export default async function emojimixHandler(req: Request, res: Response) {
    const text = (req.query.text || req.body.text) as string;

    if (!text || !text.includes('+')) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' wajib dan formatnya: emoji1+emoji2"
        });
    }

    try {
        const [emoji1, emoji2] = text.split('+');

        const code1 = emoji1.codePointAt(0)?.toString(16);
        const code2 = emoji2.codePointAt(0)?.toString(16);

        if (!code1 || !code2) {
            return res.status(400).json({
                status: false,
                message: "Emoji tidak valid"
            });
        }

        const url = `https://emojik.vercel.app/s/${code1}_${code2}?size=128`;
        const response = await axios.get(url, { responseType: 'arraybuffer' });

        res.setHeader('Content-Type', 'image/png');
        res.send(response.data);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ status: false, message: error.message });
    }
}