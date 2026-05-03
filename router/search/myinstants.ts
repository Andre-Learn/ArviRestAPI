import axios from "axios";
import cheerio from "cheerio";
import { Request, Response } from "express";

class MyInstantsScraper {
    baseUrl = "https://www.myinstants.com";

    axiosInstance = axios.create({
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    async getAllInstantsWithDetails() {
        const url = `${this.baseUrl}/en/index/id/`;
        const { data } = await this.axiosInstance.get(url);
        const $ = cheerio.load(data);
        
        const instants: any[] = [];
        
        $(".instant").each((index, element) => {
            const $element = $(element);
            const title = $element.find(".instant-link").text().trim();
            const link = $element.find(".instant-link").attr("href");
            const audioBtn = $element.find(".small-button").attr("onclick");

            let audioUrl = null;
            const match = audioBtn ? audioBtn.match(/play\('([^']+)'\)/) : null;
            audioUrl = match ? this.baseUrl + match[1] : null;
            
            instants.push({
                position: index + 1,
                title,
                url: this.baseUrl + link,
                audioUrl
            });
        });
        
        const detailedInstants: any[] = [];
        
        for (const instant of instants) {
            const detailResponse = await this.axiosInstance.get(instant.url);
            const detail$ = cheerio.load(detailResponse.data);

            const detailTitle = detail$("h1").first().text().trim();

            const audioElement = detail$("audio source");
            let detailAudioUrl = audioElement.attr("src");
            detailAudioUrl = detailAudioUrl && !detailAudioUrl.startsWith("http")
                ? this.baseUrl + detailAudioUrl
                : detailAudioUrl;

            const downloadBtn = detail$("#instant-page-extra-buttons-container a[download]");
            const downloadUrl = this.baseUrl + downloadBtn.attr("href");

            detailedInstants.push({
                position: instant.position,
                title: detailTitle || instant.title,
                url: instant.url,
                audioUrl: detailAudioUrl || instant.audioUrl,
                downloadUrl
            });
        }

        return detailedInstants;
    }
}

// 🔥 HANDLER
export default async function handler(req: Request, res: Response) {
    try {
        const scraper = new MyInstantsScraper();
        const result = await scraper.getAllInstantsWithDetails();

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