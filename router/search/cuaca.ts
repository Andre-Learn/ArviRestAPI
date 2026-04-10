import { Request, Response } from 'express';
import axios from 'axios';

function formatTimezone(offsetSeconds: number) {
    return `GMT${offsetSeconds >= 0 ? '+' : ''}${offsetSeconds / 3600}`;
}

export default async function weatherHandler(req: Request, res: Response) {
    const lokasi = (req.query.text || req.body.text) as string;

    if (!lokasi) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' diperlukan. Contoh: ?text=Jakarta"
        });
    }

    const apiKey = '07a2b10512dc32968ed9a9e812ef625a';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(lokasi)}&appid=${apiKey}&units=metric&lang=id`;

    try {
        const { data } = await axios.get(apiUrl);
        const cuaca = data.weather[0];
        const icon = `https://openweathermap.org/img/wn/${cuaca.icon}@4x.png`;

        const result = {
            lokasi: `${data.name}, ${data.sys.country}`,
            cuaca: cuaca.description,
            suhu: `${data.main.temp}°C`,
            kelembapan: `${data.main.humidity}%`,
            angin: `${data.wind.speed} m/s`,
            tekanan_udara: `${data.main.pressure} hPa`,
            zona_waktu: formatTimezone(data.timezone),
            icon
        };

        return res.json({
            status: true,
            result
        });

    } catch (err: any) {
        console.error('CUACA ERROR:', err?.response?.data || err.message);
        return res.status(500).json({
            status: false,
            message: '❌ Gagal mengambil data cuaca. Cek lokasi atau coba lagi nanti.'
        });
    }
}

