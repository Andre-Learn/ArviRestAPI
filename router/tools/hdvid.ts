import axios from "axios";
import FormData from "form-data";
import { Request, Response } from "express";

class HDVideo {
    baseUrl = 'https://hdvideo.tr';

    headers = {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Origin': this.baseUrl,
        'Referer': `${this.baseUrl}/`
    };

    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async prepareDownload(url: string, formatType = 'mp4') {
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
            
            if (result.status === 'completed') return result;
            if (result.status === 'failed' || result.status === 'error') return result;
            
            await this.sleep(interval);
        }
        
        return { status: 'timeout', message: 'Download preparation timeout' };
    }

    async downloadVideo(url: string) {
        const prepareResult = await this.prepareDownload(url, "mp4");
        
        if (prepareResult.status !== 'started') {
            return {
                success: false,
                message: 'Failed to start download preparation',
                prepareResult
            };
        }
        
        const jobId = prepareResult.job_id;
        const finalResult = await this.waitForCompletion(jobId);
        
        return {
            success: finalResult.status === 'completed',
            jobId,
            url,
            result: finalResult
        };
    }
}

// 🔥 EXPRESS HANDLER
export default async function handler(req: Request, res: Response) {
    try {
        const url = req.query.url as string;

        if (!url) {
            return res.status(400).json({
                status: false,
                message: "url required"
            });
        }

        const api = new HDVideo();
        const result = await api.downloadVideo(url);

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