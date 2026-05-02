import axios from "axios";
import FormData from "form-data";
import { Request, Response } from "express";

class HDVideo {
    baseUrl = 'https://hdvideo.tr';

    headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Origin': this.baseUrl,
        'Referer': `${this.baseUrl}/`,
        'Sec-Ch-Ua': '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Linux"',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Connection': 'keep-alive'
    };

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async prepareDownload(url: string, formatType = 'mp3') {
        const formData = new FormData();
        formData.append('url', url);
        formData.append('format_type', formatType);
        formData.append('agree_terms', 'on');
        
        const response = await axios.post(`${this.baseUrl}/api/prepare`, formData, {
            headers: {
                ...this.headers,
                ...formData.getHeaders()
            }
        });
        
        return response.data;
    }

    async checkStatus(jobId: string) {
        const response = await axios.get(`${this.baseUrl}/api/status/${jobId}`, {
            headers: this.headers
        });
        
        return response.data;
    }

    async waitForCompletion(jobId: string, maxAttempts = 30, interval = 2000) {
        for (let i = 0; i < maxAttempts; i++) {
            const result = await this.checkStatus(jobId);
            
            if (result.status === 'completed') {
                return result;
            }
            
            if (result.status === 'failed' || result.status === 'error') {
                return result;
            }
            
            await this.sleep(interval);
        }
        
        return { status: 'timeout', message: 'Download preparation timeout' };
    }

    async downloadVideo(url: string, formatType = 'mp4') {
        const prepareResult = await this.prepareDownload(url, formatType);
        
        if (prepareResult.status !== 'started') {
            return {
                success: false,
                message: 'Failed to start download preparation',
                prepareResult: prepareResult
            };
        }
        
        const jobId = prepareResult.job_id;
        
        const finalResult = await this.waitForCompletion(jobId);
        
        return {
            success: finalResult.status === 'completed',
            jobId: jobId,
            url: url,
            formatType: formatType,
            result: finalResult
        };
    }
}

// 🔥 EXPORT HANDLER (WAJIB)
export default async function handler(req: Request, res: Response) {
    try {
        const url = req.query.url as string;
        const format = (req.query.format as string) || 'mp4';

        if (!url) {
            return res.status(400).json({
                status: false,
                message: "url required"
            });
        }

        const downloader = new HDVideo();
        const result = await downloader.downloadVideo(url, format);

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