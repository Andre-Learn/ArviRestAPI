import { Request, Response } from 'express'
import axios, { AxiosInstance } from 'axios'
import * as cheerio from 'cheerio'
import vm from 'vm'

class DouyinSearchPage {
    private baseURL: string = 'https://so.douyin.com/'
    private cookies: Record<string, string> = {}
    private api: AxiosInstance

    constructor() {
        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-language': 'id-ID,id;q=0.9',
                'referer': 'https://so.douyin.com/',
                'upgrade-insecure-requests': '1',
                'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
            }
        })

        this.api.interceptors.response.use(res => {
            const setCookies = res.headers['set-cookie']
            if (setCookies) {
                setCookies.forEach(c => {
                    const [name, value] = c.split(';')[0].split('=')
                    if (name && value) this.cookies[name] = value
                })
            }
            return res
        })

        this.api.interceptors.request.use(config => {
            if (Object.keys(this.cookies).length) {
                config.headers['Cookie'] = Object.entries(this.cookies).map(([k, v]) => `${k}=${v}`).join('; ')
            }
            return config
        })
    }

    private async initialize() {
        try {
            await this.api.get('/')
            return true
        } catch {
            return false
        }
    }

    public async search(query: string) {
        await this.initialize()
        const params = {
            search_entrance: 'aweme',
            enter_method: 'normal_search',
            innerWidth: '431',
            innerHeight: '814',
            reloadNavStart: String(Date.now()),
            is_no_width_reload: '1',
            keyword: query,
        }

        const res = await this.api.get('s', { params })
        const $ = cheerio.load(res.data)

        let scriptWithData = ''
        $('script').each((_, el) => {
            const text = $(el).html() || ''
            if (text.includes('let data =') && text.includes('"business_data":')) {
                scriptWithData = text
            }
        })

        if (!scriptWithData) throw new Error('Data script tidak ditemukan.')

        const match = scriptWithData.match(/let\s+data\s*=\s*(\{[\s\S]+?\});/)
        if (!match) throw new Error('Gagal mencocokkan objek data.')

        const sandbox: any = {}
        vm.createContext(sandbox)
        vm.runInContext(`data = ${match[1]}`, sandbox)

        const awemeInfos = sandbox.data?.business_data
            ?.map((entry: any) => entry?.data?.aweme_info)
            .filter(Boolean)

        return awemeInfos || []
    }
}

export default async function douyinHandler(req: Request, res: Response) {
    try {
        const query = (req.query.q || req.query.query) as string

        if (!query) {
            return res.status(400).json({
                status: false,
                error: "parameter 'q' diperlukan"
            })
        }

        const douyin = new DouyinSearchPage()
        const result = await douyin.search(query)

        res.json({
            status: true,
            response: result
        })
    } catch (err: any) {
        res.status(500).json({
            status: false,
            error: err.message || "internal server error"
        })
    }
}