import { Request, Response } from 'express';
import fetch from 'node-fetch';

export default async function ppcpHandler(req: Request, res: Response) {
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/ShirokamiRyzen/WAbot-DB/main/fitur_db/ppcp.json"
        );
        const data = await response.json();

        if (!data || !data.length) {
            return res.status(404).json({
                status: false,
                message: "Data tidak ditemukan."
            });
        }

        const cita = data[Math.floor(Math.random() * data.length)];

        const cowoBuffer = Buffer.from(await (await fetch(cita.cowo)).arrayBuffer()).toString('base64');
        const ceweBuffer = Buffer.from(await (await fetch(cita.cewe)).arrayBuffer()).toString('base64');

        res.json({
            status: true,
            result: {
                cowo: {
                    caption: "👦 Cowo",
                    image_base64: cowoBuffer,
                    url: cita.cowo
                },
                cewe: {
                    caption: "👧 Cewe",
                    image_base64: ceweBuffer,
                    url: cita.cewe
                }
            }
        });

    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: "Gagal mengambil gambar: " + (err.message || err)
        });
    }
}
