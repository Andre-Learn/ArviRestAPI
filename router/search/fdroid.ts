import { Request, Response } from 'express';
import axios from 'axios';
import { load } from 'cheerio';

async function searchFDroid(text: string) {
    const url = `https://search.f-droid.org/?q=${encodeURIComponent(text)}&lang=id`;
    const { data } = await axios.get(url);
    const $ = load(data);
    const results: any[] = [];

    $("a.package-header").each((_, el) => {
        const link = $(el).attr("href") || null;
        const icon = $(el).find("img.package-icon").attr("src") || null;
        const name = $(el).find("h4.package-name").text().trim() || null;
        const summary = $(el).find(".package-summary").text().trim() || null;
        const license = $(el).find(".package-license").text().trim() || null;
        results.push({ icon, name, summary, license, link });
    });

    return results;
}

async function detailFDroid(url: string) {
    const { data } = await axios.get(url);
    const $ = load(data);

    const icon = $("header.package-header img.package-icon").attr("src") || null;
    const name = $("header.package-header .package-name").text().trim() || null;
    const summary = $("header.package-header .package-summary").text().trim() || null;
    const license = $("#license a").text().trim() || null;

    const versions: any[] = [];
    $(".package-version").each((_, el) => {
        const version = $(el).find(".package-version-header b").text().trim();
        const added =
            $(el)
                .find(".package-version-header")
                .text()
                .split("Ditambahkan pada")[1]
                ?.trim() || null;
        const requirement =
            $(el).find(".package-version-requirement").text().trim() || null;
        const download =
            $(el).find('.package-version-download a[href$=".apk"]').attr("href") ||
            null;
        const size =
            $(el)
                .find(".package-version-download")
                .text()
                .trim()
                .match(/([\d.]+\s?(KiB|MiB|GiB))/)?.[0] || null;

        versions.push({ version, added, requirement, download, size });
    });

    return { icon, name, summary, license, versions };
}

export default async function fdroidHandler(req: Request, res: Response) {
    const text = (req.query.text || req.body.text) as string;

    if (!text) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' diperlukan."
        });
    }

    try {
        if (text.startsWith("http")) {
            const result = await detailFDroid(text);
            return res.json({ status: true, type: 'detail', result });
        } else {
            const result = await searchFDroid(text);
            return res.json({ status: true, type: 'search', result });
        }
    } catch (err: any) {
        return res.status(500).json({ status: false, message: err.message });
    }
}