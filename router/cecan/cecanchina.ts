import { Request, Response } from 'express';
import axios from 'axios';

export default async function cecanChinaHandler(req: Request, res: Response) {
    try {
        const response = await axios.get('https://api.siputzx.my.id/api/r/cecan/china', {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': 'https://api.siputzx.my.id/',
                'Connection': 'keep-alive'
            }
        });

        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error: any) {
        res.status(500).json({ status: false, message: '❌ Terjadi kesalahan saat mengambil gambar.' });
    }
}