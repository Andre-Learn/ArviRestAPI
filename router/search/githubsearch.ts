import { Request, Response } from 'express';
import fetch from 'node-fetch';

function formatDate(dateStr: string, locale = "id") {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    });
}

export default async function githubSearchHandler(req: Request, res: Response) {
    const query = (req.query.text || req.body.text) as string;

    if (!query) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'text' diperlukan."
        });
    }

    try {
        const response = await fetch(
            `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

        const json = await response.json();

        if (!json.items || !json.items.length) {
            return res.json({ status: true, result: [], message: "Repository tidak ditemukan." });
        }

        const result = json.items.map((repo: any, i: number) => ({
            no: i + 1,
            full_name: repo.full_name,
            fork: repo.fork,
            html_url: repo.html_url,
            created_at: formatDate(repo.created_at),
            updated_at: formatDate(repo.updated_at),
            watchers: repo.watchers,
            forks: repo.forks,
            stars: repo.stargazers_count,
            open_issues: repo.open_issues,
            description: repo.description,
            clone_url: repo.clone_url
        }));

        return res.json({ status: true, result });
    } catch (err: any) {
        return res.status(500).json({ status: false, message: err.message });
    }
}